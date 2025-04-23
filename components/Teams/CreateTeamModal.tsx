import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from "react-native"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import { useThemeStore } from "@/stores/themeStore"
import { darkTheme, lightTheme } from "@/utils/themes"
import pickupImage from "@/utils/avatar"

interface CreateTeamModalProps {
    visible: boolean
    onClose: () => void
    onSubmit: (teamData: {
        name: string
        desc: string
        avatar: string
        tags: string
        isPublic: boolean
    }) => void
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ visible, onClose, onSubmit }) => {
    const [teamName, setTeamName] = useState("")
    const [teamDesc, setTeamDesc] = useState("")
    const [teamAvatar, setTeamAvatar] = useState("")
    const [teamTags, setTeamTags] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [nameError, setNameError] = useState("")

    const { isDarkMode } = useThemeStore()
    const theme = isDarkMode ? darkTheme : lightTheme

    const slideAnim = React.useRef(new Animated.Value(0)).current
    const backdropOpacity = React.useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (visible) {
            // Reset form when opening
            setTeamName("")
            setTeamDesc("")
            setTeamAvatar("")
            setTeamTags("")
            setIsPublic(true)
            setNameError("")

            // Animate in
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    friction: 8,
                    tension: 40,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start()
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }, [visible, slideAnim, backdropOpacity])

    const handlePickImage = async () => {
        try {
            const base64Image = await pickupImage()
            if (base64Image) {
                setTeamAvatar(`data:image/jpeg;base64,${base64Image}`)
            }
        } catch (error) {
            console.error("Error picking image:", error)
        }
    }

    const validateForm = () => {
        if (!teamName.trim()) {
            setNameError("Team name is required")
            return false
        }
        return true
    }

    const handleSubmit = () => {
        if (!validateForm()) return

        onSubmit({
            name: teamName.trim(),
            desc: teamDesc.trim(),
            avatar: teamAvatar,
            tags: teamTags,
            isPublic: isPublic,
        })
    }

    // Animation transforms
    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0],
    })

    const opacity = backdropOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
    })

    return (
        <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "black", opacity }]} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
                >
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            {
                                backgroundColor: theme.cardBackgroundColor,
                                transform: [{ translateY }],
                            },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.textColor }]}>Create New Team</Text>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                <Feather name="x" size={24} color={theme.textColor} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            <TouchableOpacity onPress={handlePickImage} style={styles.avatarPicker} activeOpacity={0.7}>
                                <View style={[styles.avatarContainer, { borderColor: theme.borderColor }]}>
                                    {teamAvatar ? (
                                        <Image source={{ uri: teamAvatar }} style={styles.avatarImage} />
                                    ) : (
                                        <Feather name="camera" size={24} color={theme.tertiaryTextColor} />
                                    )}
                                </View>
                                <Text style={[styles.avatarPickerText, { color: theme.primaryColor }]}>Choose Avatar</Text>
                            </TouchableOpacity>

                            <Text style={[styles.inputLabel, { color: theme.textColor }]}>Team Name*</Text>
                            <TextInput
                                value={teamName}
                                onChangeText={(text) => {
                                    setTeamName(text)
                                    if (text.trim()) setNameError("")
                                }}
                                placeholder="Enter team name"
                                placeholderTextColor={theme.tertiaryTextColor}
                                style={[
                                    styles.textInput,
                                    {
                                        borderColor: nameError ? theme.dangerColor : theme.inputBorderColor,
                                        color: theme.textColor,
                                        backgroundColor: theme.backgroundColor,
                                    },
                                ]}
                            />
                            {nameError ? <Text style={[styles.errorText, { color: theme.dangerColor }]}>{nameError}</Text> : null}

                            <Text style={[styles.inputLabel, { color: theme.textColor }]}>Description</Text>
                            <TextInput
                                value={teamDesc}
                                onChangeText={setTeamDesc}
                                placeholder="Enter team description"
                                placeholderTextColor={theme.tertiaryTextColor}
                                multiline
                                numberOfLines={3}
                                style={[
                                    styles.textAreaInput,
                                    {
                                        borderColor: theme.inputBorderColor,
                                        color: theme.textColor,
                                        backgroundColor: theme.backgroundColor,
                                    },
                                ]}
                            />

                            <Text style={[styles.inputLabel, { color: theme.textColor }]}>Tags (comma separated)</Text>
                            <TextInput
                                value={teamTags}
                                onChangeText={setTeamTags}
                                placeholder="design, development, marketing"
                                placeholderTextColor={theme.tertiaryTextColor}
                                style={[
                                    styles.textInput,
                                    {
                                        borderColor: theme.inputBorderColor,
                                        color: theme.textColor,
                                        backgroundColor: theme.backgroundColor,
                                    },
                                ]}
                            />

                            <View style={styles.checkboxContainer}>
                                <Text style={[styles.checkboxLabel, { color: theme.textColor }]}>Public Team</Text>
                                <TouchableOpacity
                                    onPress={() => setIsPublic(!isPublic)}
                                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                                >
                                    {isPublic ? (
                                        <MaterialIcons name="check-box" size={24} color={theme.primaryColor} />
                                    ) : (
                                        <MaterialIcons name="check-box-outline-blank" size={24} color={theme.tertiaryTextColor} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.infoBox, { backgroundColor: `${theme.primaryColor}15` }]}>
                                <Feather name="info" size={16} color={theme.primaryColor} style={styles.infoIcon} />
                                <Text style={[styles.infoText, { color: theme.secondaryTextColor }]}>
                                    {isPublic
                                        ? "Public teams can be found and joined by anyone."
                                        : "Private teams require an invitation to join."}
                                </Text>
                            </View>
                        </ScrollView>

                        <View style={[styles.modalFooter, { borderTopColor: theme.borderColor }]}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={[styles.cancelButtonText, { color: theme.secondaryTextColor }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    {
                                        backgroundColor: theme.primaryColor,
                                        opacity: teamName.trim() ? 1 : 0.6,
                                    },
                                ]}
                                onPress={handleSubmit}
                                disabled={!teamName.trim()}
                            >
                                <Text style={styles.confirmButtonText}>Create Team</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    keyboardAvoidingView: {
        width: "100%",
    },
    modalContainer: {
        width: "100%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: "90%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
    },
    modalContent: {
        marginBottom: 15,
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingTop: 16,
        borderTopWidth: 1,
        marginTop: 10,
    },
    confirmButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        elevation: 2,
    },
    confirmButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
    cancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginRight: 12,
    },
    cancelButtonText: {
        fontWeight: "500",
        fontSize: 16,
    },
    avatarPicker: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "transparent",
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
        fontSize: 16,
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
        fontSize: 16,
    },
    infoBox: {
        flexDirection: "row",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    errorText: {
        fontSize: 14,
        marginTop: -12,
        marginBottom: 12,
    },
})

export default CreateTeamModal
