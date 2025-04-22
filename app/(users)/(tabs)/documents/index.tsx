import { View, StyleSheet } from "react-native"
import { useThemeStore } from "@/stores/themeStore"
import themes from "@/utils/themes"
import ChatHeader from "./components/ChatHeader"
import ChatMessages from "./components/ChatMessages"
import ChatInput from "./components/ChatInput"
import DocumentsPanel from "./components/DocumentsPanel"
import SessionsDrawer from "./components/SessionsDrawer"
import { DocumentsProvider } from "./components/DocumentsContext"
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
