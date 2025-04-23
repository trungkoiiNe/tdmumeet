import { useRef, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useThemeStore } from "@/stores/themeStore"
import themes from "@/utils/themes"
import { useDocuments } from "./DocumentsContext"
import { MotiView } from "moti"
import React from "react"

export default function ChatMessages() {
    const { isDarkMode } = useThemeStore()
    const theme = isDarkMode ? themes.dark : themes.light
    const { messages, error, chatId, handleCopyMessage } = useDocuments()
    const scrollViewRef = useRef<ScrollView>(null)

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true })
        }
    }, [messages])

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            backgroundColor: theme.backgroundColor,
        },
        error: {
            color: "red",
            marginBottom: 10,
            textAlign: "center",
            paddingHorizontal: 15,
        },
        chatContainer: {
            paddingHorizontal: 10,
            paddingVertical: 15,
        },
        userMessage: {
            alignSelf: "flex-end",
            backgroundColor: theme.ownMessageBackground,
            padding: 12,
            borderRadius: 16,
            marginBottom: 12,
            maxWidth: "85%",
            marginRight: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        aiMessage: {
            alignSelf: "flex-start",
            backgroundColor: theme.otherMessageBackground,
            padding: 12,
            borderRadius: 16,
            marginBottom: 12,
            maxWidth: "85%",
            marginLeft: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        messageText: {
            fontSize: 15,
            color: theme.textColor,
            lineHeight: 22,
        },
        emptyChatContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
        },
        emptyChatText: {
            fontSize: 16,
            color: theme.secondaryTextColor,
            textAlign: "center",
        },
    })

    if (messages.length === 0) {
        return (
            <View style={[styles.content, styles.emptyChatContainer]}>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Text style={styles.emptyChatText}>
                    {chatId ? "Send a message to start chatting." : "Select or create a session to begin."}
                </Text>
            </View>
        )
    }

    return (
        <ScrollView
            style={styles.content}
            contentContainerStyle={styles.chatContainer}
            keyboardShouldPersistTaps="handled"
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {messages.map((msg, index) => (
                <MotiView
                    key={msg.id || index}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 300, delay: index * 50 }}
                >
                    <TouchableOpacity
                        style={msg.role === "user" ? styles.userMessage : styles.aiMessage}
                        onLongPress={() => handleCopyMessage(msg.content)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.messageText}>{msg.content}</Text>
                    </TouchableOpacity>
                </MotiView>
            ))}
        </ScrollView>
    )
}
