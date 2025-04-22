import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { MMKV } from "react-native-mmkv";
import * as DocumentPicker from "expo-document-picker";
import { toast } from "@baronha/ting";
import { useAuthStore } from "@/stores/authStore";

import * as Clipboard from "expo-clipboard";
const storage = new MMKV();

type Message = {
    role: string;
    content: string;
    id?: string;
};

type Document = {
    id: string;
    file_name: string;
    guide?: {
        summary?: string;
        key_points?: string[];
    };
};

type ChatSession = {
    id: string;
    title: string;
};

type DocumentsContextType = {
    documents: Document[];
    messages: Message[];
    chatId: string;
    inputMessage: string;
    isProcessing: boolean;
    error: string;
    chatSessions: ChatSession[];
    selectedSession: string;
    selectedSessionTitle: string;
    showDrawer: boolean;
    showDocumentsPanel: boolean;
    searchQuery: string;
    setInputMessage: (message: string) => void;
    setShowDrawer: (show: boolean) => void;
    setShowDocumentsPanel: (show: boolean) => void;
    setSearchQuery: (query: string) => void;
    sendMessage: () => Promise<void>;
    pickDocument: () => Promise<void>;
    createNewSession: () => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    selectSession: (session: ChatSession) => Promise<void>;
    handleCopyMessage: (content: string) => Promise<void>;
};

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export const useDocuments = () => {
    const context = useContext(DocumentsContext);
    if (!context) {
        throw new Error("useDocuments must be used within a DocumentsProvider");
    }
    return context;
};

export const DocumentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [chatId, setChatId] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState("");
    const [selectedSessionTitle, setSelectedSessionTitle] = useState("");
    const [showDrawer, setShowDrawer] = useState(false);
    const [showDocumentsPanel, setShowDocumentsPanel] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { getUser } = useAuthStore();
    const user = getUser();

    const getBackendUrl = () => storage.getString("backendIP") || "http://localhost:8000";

    useEffect(() => {
        fetchChatSessions();
    }, []);

    const fetchChatSessions = async () => {
        try {
            const backendIP = getBackendUrl();
            const response = await axios.get(`${backendIP}/chat-sessions/`);
            setChatSessions(response.data);
        } catch (err) {
            console.error("Failed to fetch chat sessions:", err);
        }
    };

    const fetchChatMessages = async (chatIdToFetch: string) => {
        if (!chatIdToFetch) return;
        try {
            const backendIP = getBackendUrl();
            const response = await axios.get(`${backendIP}/chat-messages/${chatIdToFetch}`);
            setMessages(response.data.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
                id: msg.id || `msg-${Date.now()}-${Math.random()}`
            })));
        } catch (err) {
            setError("Failed to fetch chat messages");
            console.error(err);
        }
    };

    const fetchDocumentGuides = async (chatIdForGuides: string) => {
        if (!chatIdForGuides) return [];
        try {
            const backendIP = getBackendUrl();
            const response = await axios.get(`${backendIP}/document-guides/${chatIdForGuides}`);
            return response.data || [];
        } catch (err) {
            console.error("Failed to fetch document guides:", err);
            return [];
        }
    };

    const createNewSession = async () => {
        try {
            const backendIP = getBackendUrl();
            const response = await axios.post(`${backendIP}/chat-sessions/`, {
                title: `New Chat ${new Date().toLocaleString()}`,
            });
            const newSession = response.data;
            setChatSessions((prev) => [newSession, ...prev]);
            selectSession(newSession);
        } catch (err) {
            console.error("Failed to create new session:", err);
        }
    };

    const deleteSession = async (sessionIdToDelete: string) => {
        if (!sessionIdToDelete) return;
        try {
            const backendIP = getBackendUrl();
            await axios.delete(`${backendIP}/chat-sessions/${sessionIdToDelete}`);
            setChatSessions((prev) => prev.filter((session) => session.id !== sessionIdToDelete));
            if (selectedSession === sessionIdToDelete) {
                setSelectedSession("");
                setSelectedSessionTitle("");
                setMessages([]);
                setDocuments([]);
                setChatId("");
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
        }
    };

    const selectSession = async (session: ChatSession) => {
        if (selectedSession === session.id) return;
        setSelectedSession(session.id);
        setSelectedSessionTitle(session.title);
        setChatId(session.id);
        setMessages([]);
        setDocuments([]);
        setShowDrawer(false);
        await fetchChatMessages(session.id);
        const guides = await fetchDocumentGuides(session.id);
        setDocuments(guides);
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ],
                multiple: true,
            });

            if (!result.canceled && chatId) {
                processDocuments(result.assets);
            } else if (!chatId) {
                setError("Please select or create a chat session first.");
                toast({
                    haptic: "warning",
                    title: "Warning",
                    message: "Please select or create a chat session first.",
                });
            }
        } catch (err) {
            setError("Failed to pick document");
            console.error(err);
        }
    };

    const processDocuments = async (files: DocumentPicker.DocumentPickerAsset[]) => {
        if (!chatId) {
            setError("No chat session selected for processing documents.");
            toast({
                haptic: "warning",
                title: "Warning",
                message: "No chat session selected.",
            });
            return;
        }
        setIsProcessing(true);
        setError("");

        try {
            const formData = new FormData();
            files.forEach((file) => {
                const fileObj = {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType,
                };
                formData.append("files", fileObj as any);
            });

            const backendIP = getBackendUrl();
            await axios.post(
                `${backendIP}/process-multiple-documents/?chat_id=${chatId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const newDocs = await fetchDocumentGuides(chatId);
            if (newDocs) {
                setDocuments(newDocs);
            }
            toast({
                haptic: "success",
                title: "Success",
                message: "Documents processed.",
            });
        } catch (err) {
            setError("Failed to process documents");
            console.error(err);
            toast({
                haptic: "error",
                title: "Error",
                message: "Failed to process documents.",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopyMessage = async (content: string) => {
        try {
            await Clipboard.setStringAsync(content);
            toast({ haptic: "success", title: "Success", message: "Copied content" });
        } catch (err) {
            console.error("Failed to copy text:", err);
            toast({ haptic: "error", title: "Error", message: "Failed to copy" });
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !chatId) {
            if (!chatId) {
                setError("Please select a chat session first.");
                toast({
                    haptic: "warning",
                    title: "Warning",
                    message: "Please select a chat session first.",
                });
            }
            return;
        }

        try {
            const userMessage = {
                role: "user",
                content: inputMessage,
                id: `msg-${Date.now()}-user`
            };
            setMessages((prev) => [...prev, userMessage]);
            const currentInput = inputMessage;
            setInputMessage("");
            const backendIP = getBackendUrl();

            const response = await axios.post(
                `${backendIP}/chat/?chat_id=${chatId}&prompt=${encodeURIComponent(
                    currentInput
                )}`,
                null,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const aiMessage = {
                role: "assistant",
                content: response.data.response,
                id: `msg-${Date.now()}-ai`
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            setError("Failed to send message");
            console.error(err);
        }
    };

    const value = {
        documents,
        messages,
        chatId,
        inputMessage,
        isProcessing,
        error,
        chatSessions,
        selectedSession,
        selectedSessionTitle,
        showDrawer,
        showDocumentsPanel,
        searchQuery,
        setInputMessage,
        setShowDrawer,
        setShowDocumentsPanel,
        setSearchQuery,
        sendMessage,
        pickDocument,
        createNewSession,
        deleteSession,
        selectSession,
        handleCopyMessage,
    };

    return (
        <DocumentsContext.Provider value={value}>
            {children}
        </DocumentsContext.Provider>
    );
};
