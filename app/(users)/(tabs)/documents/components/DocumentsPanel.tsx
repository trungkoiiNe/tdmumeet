import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { useThemeStore } from "@/stores/themeStore"
import themes from "@/utils/themes"
import { useDocuments } from "./DocumentsContext"
import { MotiView } from "moti"
import React from "react"

export default function DocumentsPanel() {
    const { isDarkMode } = useThemeStore()
    const theme = isDarkMode ? themes.dark : themes.light
    const { showDocumentsPanel, chatId, documents, isProcessing, pickDocument } = useDocuments()

    if (!showDocumentsPanel || !chatId) {
        return null
    }

    const styles = StyleSheet.create({
        documentsPanel: {
            position: "absolute",
            bottom: Platform.OS === "ios" ? 70 : 60,
            left: 0,
            right: 0,
            backgroundColor: theme.cardBackgroundColor,
            borderTopWidth: 1,
            borderTopColor: theme.borderColor,
            padding: 15,
            maxHeight: 250,
            zIndex: 50,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 5,
        },
        documentsHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
        },
        addDocumentButton: {
            backgroundColor: theme.primaryColor,
            borderRadius: 20,
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
        },
        addDocumentButtonDisabled: {
            backgroundColor: theme.secondaryTextColor,
        },
        documentsList: {
            maxHeight: 200,
        },
        documentItemContainer: {
            marginBottom: 12,
        },
        documentItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: theme.borderColor,
            borderRadius: 8,
            backgroundColor: theme.secondaryBackgroundColor,
        },
        documentIcon: {
            marginRight: 12,
        },
        documentName: {
            color: theme.textColor,
            flex: 1,
            fontSize: 14,
        },
        emptyDocuments: {
            textAlign: "center",
            color: theme.secondaryTextColor,
            paddingVertical: 20,
        },
        guideContainer: {
            backgroundColor: theme.backgroundColor,
            padding: 12,
            marginTop: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.borderColor,
        },
        guideTitle: {
            fontWeight: "bold",
            marginTop: 5,
            marginBottom: 3,
            color: theme.textColor,
            fontSize: 14,
        },
        guideText: {
            marginLeft: 5,
            marginBottom: 5,
            color: theme.textColor,
            fontSize: 13,
            lineHeight: 18,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "bold",
            color: theme.textColor,
        },
        processingText: {
            color: theme.secondaryTextColor,
            textAlign: "center",
            marginVertical: 10,
        },
    })

    return (
        <MotiView
            style={styles.documentsPanel}
            from={{ translateY: 100, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
        >
            <View style={styles.documentsHeader}>
                <Text style={styles.sectionTitle}>Documents</Text>
                <TouchableOpacity
                    style={[styles.addDocumentButton, isProcessing && styles.addDocumentButtonDisabled]}
                    onPress={pickDocument}
                    disabled={isProcessing}
                >
                    <FontAwesome name={isProcessing ? "spinner" : "plus"} size={16} color="white" />
                </TouchableOpacity>
            </View>

            {isProcessing && <Text style={styles.processingText}>Processing...</Text>}

            {documents.length > 0 ? (
                <ScrollView style={styles.documentsList}>
                    {documents.map((doc, index) => (
                        <MotiView
                            key={doc.id || index}
                            style={styles.documentItemContainer}
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "timing", duration: 300, delay: index * 100 }}
                        >
                            <View style={styles.documentItem}>
                                <FontAwesome
                                    name={doc.file_name?.endsWith(".pdf") ? "file-pdf-o" : "file-word-o"}
                                    size={16}
                                    color={doc.file_name?.endsWith(".pdf") ? "#FF0000" : "#2B579A"}
                                    style={styles.documentIcon}
                                />
                                <Text style={styles.documentName} numberOfLines={1}>
                                    {doc.file_name
                                        ? doc.file_name.includes(".")
                                            ? doc.file_name
                                            : `${doc.file_name}.${doc.file_name.endsWith("pdf") ? "pdf" : "docx"}`
                                        : "Unknown Document"}
                                </Text>
                            </View>
                            {doc.guide && (
                                <View style={styles.guideContainer}>
                                    {doc.guide.summary && (
                                        <>
                                            <Text style={styles.guideTitle}>Summary:</Text>
                                            <Text style={styles.guideText}>{doc.guide.summary}</Text>
                                        </>
                                    )}
                                    {doc.guide.key_points && doc.guide.key_points.length > 0 && (
                                        <>
                                            <Text style={styles.guideTitle}>Key Points:</Text>
                                            {doc.guide.key_points.map((point, i) => (
                                                <Text key={i} style={styles.guideText}>
                                                    • {point}
                                                </Text>
                                            ))}
                                        </>
                                    )}
                                </View>
                            )}
                        </MotiView>
                    ))}
                </ScrollView>
            ) : (
                !isProcessing && <Text style={styles.emptyDocuments}>No documents added to this session yet</Text>
            )}
        </MotiView>
    )
}
