import { Text, StyleSheet, TouchableOpacity } from "react-native"
import { useThemeStore } from "@/stores/themeStore"
import themes from "@/utils/themes"
import { MotiView } from "moti"
import React from "react"

type MessageBubbleProps = {
    content: string
    isUser: boolean
    onLongPress: () => void
    index: number
}

export default function MessageBubble({ content, isUser, onLongPress, index }: MessageBubbleProps) {
    const { isDarkMode } = useThemeStore()
    const theme = isDarkMode ? themes.dark : themes.light

    const styles = StyleSheet.create({
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
    })

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: index * 50 }}
        >
            <TouchableOpacity
                style={isUser ? styles.userMessage : styles.aiMessage}
                onLongPress={onLongPress}
                activeOpacity={0.7}
            >
                <Text style={styles.messageText}>{content}</Text>
            </TouchableOpacity>
        </MotiView>
    )
}
