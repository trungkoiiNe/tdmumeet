import { TextInput, StyleSheet, TouchableOpacity, Platform } from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { useThemeStore } from "@/stores/themeStore"
import themes from "@/utils/themes"
import { useDocuments } from "./DocumentsContext"
import { MotiView } from "moti"
import React from "react"

export default function ChatInput() {
    const { isDarkMode } = useThemeStore()
    const theme = isDarkMode ? themes.dark : themes.light
    const {
        inputMessage,
        setInputMessage,
        sendMessage,
        chatId,
        setShowDocumentsPanel,
        showDocumentsPanel,
        isProcessing,
    } = useDocuments()

    const styles = StyleSheet.create({
        inputContainer: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderTopWidth: 1,
            borderTopColor: theme.borderColor,
            backgroundColor: theme.backgroundColor,
        },
        documentsButton: {
            padding: 10,
            marginRight: 5,
        },
        input: {
            flex: 1,
            borderWidth: 1,
            borderColor: theme.inputBorderColor,
            borderRadius: 20,
            paddingHorizontal: 15,
            paddingVertical: Platform.OS === "ios" ? 10 : 8,
            fontSize: 16,
            color: theme.textColor,
            backgroundColor: theme.cardBackgroundColor,
            marginRight: 10,
        },
        sendButton: {
            backgroundColor: theme.primaryColor,
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
        },
        sendButtonDisabled: {
            backgroundColor: theme.secondaryBackgroundColor,
        },
    })

    return (
        <MotiView
            style={styles.inputContainer}
            from={{ translateY: 50, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
        >
            <TouchableOpacity
                style={styles.documentsButton}
                onPress={() => setShowDocumentsPanel(!showDocumentsPanel)}
                disabled={!chatId || isProcessing}
            >
                <FontAwesome name="file-text-o" size={20} color={chatId ? theme.primaryColor : theme.secondaryTextColor} />
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder={chatId ? "Ask about your documents..." : "Select a session first..."}
                placeholderTextColor={theme.secondaryTextColor}
                editable={!!chatId}
                multiline
            />
            <TouchableOpacity
                style={[styles.sendButton, (!inputMessage.trim() || !chatId) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!inputMessage.trim() || !chatId}
            >
                <FontAwesome name="send" size={18} color={inputMessage.trim() && chatId ? "white" : theme.secondaryTextColor} />
            </TouchableOpacity>
        </MotiView>
    )
}
