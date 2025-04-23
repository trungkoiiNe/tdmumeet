import { View, StyleSheet } from "react-native"
import { useThemeStore } from "@/stores/themeStore"
import themes from "@/utils/themes"
import ChatHeader from "@/components/documents/ChatHeader"
import ChatMessages from "@/components/documents/ChatMessages"
import ChatInput from "@/components/documents/ChatInput"
import DocumentsPanel from "@/components/documents/DocumentsPanel"
import SessionsDrawer from "@/components/documents/SessionsDrawer"
import { DocumentsProvider } from "@/components/documents/DocumentsContext"
import React from "react"

export default function DocumentsScreen() {
  const { isDarkMode } = useThemeStore()
  const theme = isDarkMode ? themes.dark : themes.light

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
  })

  return (
    <DocumentsProvider>
      <View style={styles.container}>
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
        <DocumentsPanel />
        <SessionsDrawer />
      </View>
    </DocumentsProvider>
  )
}
