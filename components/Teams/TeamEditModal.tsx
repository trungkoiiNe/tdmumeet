import React from "react"
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"

interface TeamEditModalProps {
    visible: boolean
    onClose: () => void
    onConfirm: () => void
    confirmText?: string
    theme: any
    editName: string
    setEditName: (value: string) => void
    editDesc: string
    setEditDesc: (value: string) => void
    editTags: string
    setEditTags: (value: string) => void
    editIsPublic: boolean
    setEditIsPublic: (value: boolean) => void
    editAvatar: string
    handlePickImage: () => void
}

const TeamEditModal: React.FC<TeamEditModalProps> = ({
    visible,
    onClose,
    onConfirm,
    confirmText = "Save Changes",
    theme,
    editName,
    setEditName,
    editDesc,
    setEditDesc,
    editTags,
    setEditTags,
    editIsPublic,
    setEditIsPublic,
    editAvatar,
    handlePickImage,
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.cardBackgroundColor }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.textColor }]}>Edit Team</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textColor} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <TouchableOpacity onPress={handlePickImage} style={styles.avatarPicker}>
                            <View style={[styles.avatarContainer, { borderColor: theme.inputBorderColor }]}>
                                {editAvatar ? (
                                    <Image source={{ uri: editAvatar }} style={styles.avatarImage} />
                                ) : (
                                    <Ionicons name="camera" size={24} color={theme.tertiaryTextColor} />
                                )}
                            </View>
                            <Text style={[styles.avatarPickerText, { color: theme.primaryColor }]}>Change Avatar</Text>
                        </TouchableOpacity>

                        <Text style={[styles.inputLabel, { color: theme.textColor }]}>Team Name</Text>
                        <TextInput
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Enter team name"
                            placeholderTextColor={theme.tertiaryTextColor}
                            style={[
                                styles.textInput,
                                {
                                    borderColor: theme.inputBorderColor,
                                    color: theme.textColor,
                                    backgroundColor: theme.inputBackgroundColor,
                                },
                            ]}
                        />

                        <Text style={[styles.inputLabel, { color: theme.textColor }]}>Description</Text>
                        <TextInput
                            value={editDesc}
                            onChangeText={setEditDesc}
                            placeholder="Enter team description"
                            multiline
                            numberOfLines={3}
                            placeholderTextColor={theme.tertiaryTextColor}
                            style={[
                                styles.textAreaInput,
                                {
                                    borderColor: theme.inputBorderColor,
                                    color: theme.textColor,
                                    backgroundColor: theme.inputBackgroundColor,
                                },
                            ]}
                        />

                        <Text style={[styles.inputLabel, { color: theme.textColor }]}>Tags (comma separated)</Text>
                        <TextInput
                            value={editTags}
                            onChangeText={setEditTags}
                            placeholder="design, development, marketing"
                            placeholderTextColor={theme.tertiaryTextColor}
                            style={[
                                styles.textInput,
                                {
                                    borderColor: theme.inputBorderColor,
                                    color: theme.textColor,
                                    backgroundColor: theme.inputBackgroundColor,
                                },
                            ]}
                        />

                        <View style={styles.checkboxContainer}>
                            <Text style={[styles.checkboxLabel, { color: theme.textColor }]}>Public Team</Text>
                            <TouchableOpacity onPress={() => setEditIsPublic(!editIsPublic)}>
                                {editIsPublic ? (
                                    <MaterialIcons name="check-box" size={24} color={theme.primaryColor} />
                                ) : (
                                    <MaterialIcons name="check-box-outline-blank" size={24} color={theme.tertiaryTextColor} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                            <Text style={{ color: theme.secondaryTextColor }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onConfirm}
                            style={[styles.confirmButton, { backgroundColor: theme.primaryColor }]}
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
    modalContent: {
        padding: 16,
        maxHeight: 400,
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginRight: 12,
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 120,
        alignItems: "center",
    },
    avatarPicker: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    avatarPickerText: {
        marginTop: 8,
        fontWeight: "500",
    },
    inputLabel: {
        marginBottom: 8,
        fontWeight: "500",
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    textAreaInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        height: 100,
        textAlignVertical: "top",
        fontSize: 16,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    checkboxLabel: {
        fontWeight: "500",
    },
})

export default TeamEditModal
