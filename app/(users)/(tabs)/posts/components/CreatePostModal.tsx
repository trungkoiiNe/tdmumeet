import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Modal, Text, TextInput, Button, Chip, SegmentedButtons, IconButton } from 'react-native-paper';
import pickupImage from '@/utils/avatar';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';
import { TAG_OPTIONS, VISIBILITY_OPTIONS } from '../constants';

interface CreatePostModalProps {
    visible: boolean;
    formData: any;
    onChange: (data: any) => void;
    onSubmit: () => void;
    onDismiss: () => void;
}

const CreatePostModal = ({ visible, formData, onChange, onSubmit, onDismiss }: CreatePostModalProps) => {
    const isDarkMode = useThemeStore(state => state.isDarkMode);
    const theme = isDarkMode ? darkTheme : lightTheme;
    const handleTagToggle = (tag: string) => {
        const newTags = formData.tags.includes(tag)
            ? formData.tags.filter((t: string) => t !== tag)
            : [...formData.tags, tag];

        onChange({ ...formData, tags: newTags });
    };

    const handlePickImage = async () => {
        const base64 = await pickupImage();
        if (base64) onChange({ ...formData, imageBase64: base64 });
    };

    return (
        <Modal
            visible={visible}
            onDismiss={onDismiss}
            contentContainerStyle={[styles.container, { backgroundColor: theme.cardBackgroundColor }]}
        >
            <ScrollView>
                <Text variant="headlineMedium" style={[styles.title, { color: theme.textColor }]}>Create New Post</Text>

                <TextInput
                    label="Title"
                    mode="outlined"
                    value={formData.title}
                    onChangeText={(text) => onChange({ ...formData, title: text })}
                    style={[styles.input, { backgroundColor: theme.secondaryBackgroundColor, color: theme.textColor }]}
                    placeholder="Add a catchy title"
                    maxLength={100}
                    right={<TextInput.Affix text={`${formData.title.length}/100`} />}
                    placeholderTextColor={theme.tertiaryTextColor}
                    theme={{
                        colors: {
                            primary: theme.primaryColor,
                            text: theme.textColor,
                            placeholder: theme.tertiaryTextColor,
                            background: theme.secondaryBackgroundColor,
                            surface: theme.secondaryBackgroundColor,
                            disabled: theme.disabledColor,
                        }
                    }}
                />

                <TextInput
                    label="Content"
                    mode="outlined"
                    value={formData.content}
                    onChangeText={(text) => onChange({ ...formData, content: text })}
                    multiline
                    numberOfLines={5}
                    style={[styles.input, { backgroundColor: theme.secondaryBackgroundColor, color: theme.textColor }]}
                    placeholder="Write something interesting..."
                    maxLength={2000}
                    right={<TextInput.Affix text={`${formData.content.length}/2000`} />}
                    placeholderTextColor={theme.tertiaryTextColor}
                    theme={{
                        colors: {
                            primary: theme.primaryColor,
                            text: theme.textColor,
                            placeholder: theme.tertiaryTextColor,
                            background: theme.secondaryBackgroundColor,
                            surface: theme.secondaryBackgroundColor,
                            disabled: theme.disabledColor,
                        }
                    }}
                />

                <Text variant="titleMedium" style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                    {TAG_OPTIONS.map((tag) => (
                        <Chip
                            key={tag}
                            selected={formData.tags.includes(tag)}
                            onPress={() => handleTagToggle(tag)}
                            style={[styles.chip, { backgroundColor: theme.tagBackground }]}
                            textStyle={{ color: theme.tagText }}
                        >
                            {tag}
                        </Chip>
                    ))}
                </View>

                <Text variant="titleMedium" style={styles.sectionTitle}>Visibility</Text>
                <SegmentedButtons
                    value={formData.visibility}
                    onValueChange={(value) => onChange({ ...formData, visibility: value })}
                    buttons={VISIBILITY_OPTIONS.map(v => ({
                        value: v,
                        label: v.charAt(0).toUpperCase() + v.slice(1),
                        icon: v === 'public' ? 'earth' : v === 'team' ? 'account-group' : 'lock'
                    }))}
                    style={styles.segmentedButtons}
                    theme={{
                        colors: {
                            primary: theme.primaryColor,
                            onSurface: theme.tertiaryTextColor
                        }
                    }}
                />

                <Text variant="titleMedium" style={styles.sectionTitle}>Image</Text>
                <Button
                    mode="outlined"
                    icon="image"
                    onPress={handlePickImage}
                    style={styles.imageButton}
                    color={theme.primaryColor}
                >
                    {formData.imageBase64 ? "Change Image" : "Add Image"}
                </Button>

                {formData.imageBase64 && (
                    <View style={styles.previewImageContainer}>
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${formData.imageBase64}` }}
                            style={styles.previewImage}
                        />
                        <IconButton
                            icon="close-circle"
                            size={24}
                            style={styles.removeImageButton}
                            onPress={() => onChange({ ...formData, imageBase64: "" })}
                            iconColor={theme.primaryColor}
                        />
                    </View>
                )}

                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={onSubmit}
                        style={[styles.submitButton, { backgroundColor: theme.primaryColor }]}
                        textColor={theme.buttonText}
                        disabled={!formData.title || !formData.content}
                    >
                        Create Post
                    </Button>
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        padding: 20,
        margin: 20,
        borderRadius: 12,
        maxHeight: "90%"
    },
    title: {
        marginBottom: 16,
        textAlign: "center"
    },
    input: {
        marginBottom: 16
    },
    sectionTitle: {
        marginBottom: 8,
        marginTop: 8
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
        gap: 4
    },
    chip: {
        marginRight: 8,
        marginBottom: 8
    },
    segmentedButtons: {
        marginBottom: 16
    },
    imageButton: {
        marginBottom: 16
    },
    previewImageContainer: {
        position: "relative",
        marginBottom: 16
    },
    previewImage: {
        width: "100%",
        height: 200,
        borderRadius: 8
    },
    removeImageButton: {
        position: "absolute",
        top: -12,
        right: -12,
        backgroundColor: "white"
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        marginBottom: 16
    },
    cancelButton: {
        flex: 1,
        marginRight: 8
    },
    submitButton: {
        flex: 1,
        marginLeft: 8,
        backgroundColor: "#3b82f6"
    }
});

export default React.memo(CreatePostModal);
