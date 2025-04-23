import React from "react"
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface SimpleModalProps {
    visible: boolean
    title: string
    onClose: () => void
    onConfirm: () => void
    confirmText?: string
    children: React.ReactNode
    theme: any
}

const SimpleModal: React.FC<SimpleModalProps> = ({
    visible,
    title,
    onClose,
    onConfirm,
    confirmText = "Confirm",
    children,
    theme,
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.cardBackgroundColor }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.textColor }]}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textColor} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScrollContent}>{children}</ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity onPress={onClose} style={[styles.modalButton, styles.cancelButton]}>
                            <Text style={{ color: theme.secondaryTextColor }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onConfirm}
                            style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.primaryColor }]}
                        >
                            <Text style={{ color: "#fff", fontWeight: "500" }}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        maxWidth: 400,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    closeButton: {
        padding: 4,
    },
    modalScrollContent: {
        maxHeight: 400,
        padding: 16,
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "transparent",
    },
    confirmButton: {
        minWidth: 100,
    },
})

export default SimpleModal
