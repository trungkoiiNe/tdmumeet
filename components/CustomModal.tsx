import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useThemeStore } from "@/stores/themeStore";
import { lightTheme, darkTheme } from "@/utils/themes";

export type ModalType =
  | "alert"
  | "input"
  | "deleteConfirm"
  | "logoutConfirm"
  | "loading"
  | "custom"
  | "information";

type CustomModalProps = {
  visible: boolean;
  modalType: ModalType;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm?: (inputValue?: string) => void;
  children?: React.ReactNode;
  confirmationValue?: string;
  onChangeConfirmationValue?: (v: string) => void;
  confirmDisabled?: boolean;
};

const MODAL_WIDTH = Dimensions.get("window").width * 0.9;
const MAX_MODAL_WIDTH = 448; // For tablet-friendly design

const CustomModal = ({
  visible,
  modalType,
  title,
  message,
  onClose,
  onConfirm,
  children,
  confirmationValue,
  onChangeConfirmationValue,
  confirmDisabled,
}: CustomModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleConfirm = () => {
    if (modalType === "input") {
      onConfirm?.(inputValue);
    } else if (modalType === "deleteConfirm") {
      onConfirm?.(confirmationValue);
    } else {
      onConfirm?.();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay || 'rgba(0, 0, 0, 0.4)' }]}>
        <View style={[styles.modalContainer, { backgroundColor: theme.cardBackgroundColor }]}>
          {/* Header */}
          {title && (
            <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
              <Text style={[styles.title, { color: theme.textColor }]}>{title}</Text>
            </View>
          )}

          {/* Body */}
          <View style={styles.body}>
            {modalType === "alert" && message && (
              <Text style={[styles.message, { color: theme.secondaryTextColor }]}>{message}</Text>
            )}

            {modalType === "input" && (
              <>
                {message && <Text style={[styles.message, { color: theme.secondaryTextColor }]}>{message}</Text>}
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.inputBorderColor,
                      color: theme.textColor,
                      backgroundColor: theme.cardBackgroundColor,
                    },
                  ]}
                  placeholder={title || "Enter value..."}
                  placeholderTextColor={theme.tertiaryTextColor}
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoFocus
                />
              </>
            )}

            {modalType === "deleteConfirm" && (
              <>
                <Text style={[styles.message, styles.dangerText, { color: theme.dangerColor }]}>{message}</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.inputBorderColor,
                      color: theme.textColor,
                      backgroundColor: theme.cardBackgroundColor,
                    },
                  ]}
                  placeholder="Type team name to confirm..."
                  placeholderTextColor={theme.tertiaryTextColor}
                  value={confirmationValue}
                  onChangeText={onChangeConfirmationValue}
                  autoFocus
                />
              </>
            )}

            {modalType === "logoutConfirm" && message && (
              <>
                <Text style={[styles.message, { color: theme.secondaryTextColor }]}>{message}</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.cancelButton,
                      { backgroundColor: theme.cancelButtonBackground },
                    ]}
                    onPress={onClose}
                  >
                    <Text
                      style={[
                        styles.cancelButtonText,
                        { color: theme.cancelButtonText },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.confirmButton,
                      { backgroundColor: theme.primaryColor },
                    ]}
                    onPress={() => onConfirm && onConfirm()}
                  >
                    <Text
                      style={[
                        styles.confirmButtonText,
                        { color: theme.buttonText },
                      ]}
                    >
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {modalType === "loading" && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primaryColor} />
                {message && <Text style={[styles.loadingText, { color: theme.secondaryTextColor }]}>{message}</Text>}
              </View>
            )}

            {modalType === "custom" && children}

            {modalType === "information" && message && (
              <Text style={[styles.message, { color: theme.secondaryTextColor }]}>{message}</Text>
            )}
          </View>

          {/* Footer Buttons (Only for specific types needing a generic footer) */}
          {(modalType === "alert" || modalType === "input" || modalType === "deleteConfirm" || modalType === "information") && (
            <View style={[styles.footer, { borderTopColor: theme.borderColor }]}>
              {/* Optional Cancel Button - Uncomment if needed for these types */}
              {/* <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: theme.cancelButtonBackground },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelButtonText, { color: theme.cancelButtonText }]}>Cancel</Text>
              </TouchableOpacity> */}

              {/* Confirm/Action Button */}
              {(modalType === "alert" ||
                modalType === "input" ||
                modalType === "deleteConfirm") &&
                onConfirm && (
                  <TouchableOpacity
                    onPress={handleConfirm}
                    style={[
                      styles.button,
                      modalType === "deleteConfirm"
                        ? [styles.dangerButton, { backgroundColor: theme.dangerColor }]
                        : [styles.confirmButton, { backgroundColor: theme.primaryColor }],
                      confirmDisabled && styles.disabledButton,
                    ]}
                    disabled={confirmDisabled}
                    activeOpacity={confirmDisabled ? 1 : 0.8}
                  >
                    <Text
                      style={[
                        styles.confirmButtonText,
                        { color: theme.buttonText },
                      ]}
                    >
                      {modalType === "deleteConfirm"
                        ? "Delete"
                        : modalType === "input"
                          ? "Submit"
                          : "Confirm"}
                    </Text>
                  </TouchableOpacity>
                )}

              {/* Close Button for Information Modal */}
              {modalType === "information" && (
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: theme.primaryColor },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.confirmButtonText, { color: theme.buttonText }]}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    opacity:1

  },
  modalContainer: {
    width: MODAL_WIDTH,
    maxWidth: MAX_MODAL_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    borderBottomWidth: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  body: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  dangerText: {
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginTop: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  loadingText: {
    marginLeft: 16,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    padding: 20,
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {},
  dangerButton: {},
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
export default CustomModal;
