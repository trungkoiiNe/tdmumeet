import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";

type ModalType = "alert" | "input" | "deleteConfirm" | "loading" | "custom";

type CustomModalProps = {
  visible: boolean;
  modalType: ModalType;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm?: (inputValue?: string) => void;
  children?: React.ReactNode;
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
}: CustomModalProps) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Section */}
          {modalType !== "loading" && title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}

          {/* Body Content */}
          <View style={styles.body}>
            {modalType === "alert" && message && (
              <Text style={styles.message}>{message}</Text>
            )}

            {modalType === "input" && (
              <>
                {message && <Text style={styles.message}>{message}</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Enter value..."
                  placeholderTextColor="#94a3b8"
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoFocus
                />
              </>
            )}

            {modalType === "deleteConfirm" && message && (
              <Text style={[styles.message, styles.dangerText]}>{message}</Text>
            )}

            {modalType === "loading" && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                {message && <Text style={styles.loadingText}>{message}</Text>}
              </View>
            )}

            {modalType === "custom" && children}
          </View>

          {/* Footer Buttons */}
          {modalType !== "loading" && (
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancelButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              {(modalType === "alert" ||
                modalType === "input" ||
                modalType === "deleteConfirm") && (
                  <TouchableOpacity
                    onPress={() =>
                      onConfirm?.(modalType === "input" ? inputValue : undefined)
                    }
                    style={[
                      styles.button,
                      modalType === "deleteConfirm"
                        ? styles.dangerButton
                        : styles.confirmButton,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmButtonText}>OK</Text>
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
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 16,
  },
  modalContainer: {
    width: MODAL_WIDTH,
    maxWidth: MAX_MODAL_WIDTH,
    backgroundColor: "white",
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
    borderBottomColor: "#e2e8f0",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  body: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
    textAlign: "center",
  },
  dangerText: {
    color: "#dc2626",
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1e293b",
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
    color: "#64748b",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    padding: 16,
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
  cancelButton: {
    backgroundColor: "#f1f5f9",
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#3b82f6",
  },
  dangerButton: {
    backgroundColor: "#dc2626",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CustomModal;
