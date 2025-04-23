// Define the color palettes for both light and dark modes
export const lightTheme = {
  // Background colors
  backgroundColor: "#fff",
  cardBackgroundColor: "#fff",
  secondaryBackgroundColor: "#f9fafb",

  // Text colors
  textColor: "#111827",
  secondaryTextColor: "#4b5563",
  tertiaryTextColor: "#6b7280",

  // Border colors
  borderColor: "#e5e7eb",
  inputBorderColor: "#d1d5db",

  // UI element colors
  primaryColor: "#2563eb",
  dangerColor: "#dc2626",
  disabledColor: "#93c5fd",

  // Message bubbles
  ownMessageBackground: "#2563eb",
  ownMessageText: "#fff",
  otherMessageBackground: "#e5e7eb",
  otherMessageText: "#1f2937",

  // Status bar
  statusBarStyle: "dark-content",

  // Tag colors
  tagBackground: "#f3f4f6",
  tagText: "#4b5563",

  // Button colors
  buttonBackground: "#3b82f6",
  buttonText: "#fff",
  cancelButtonBackground: "#f1f5f9",
  cancelButtonText: "#64748b",

  // Settings-specific colors
  editButtonBackground: "#4C6EF5", // For edit avatar button
  editButtonBorderColor: "#fff",
  dividerColor: "#e0e0e0",
  shadowColor: "#000",

  // Overlay color
  overlay: "rgba(0, 0, 0, 0.5)",
};

export const darkTheme = {
  // Background colors
  backgroundColor: "#111827",
  cardBackgroundColor: "#1f2937",
  secondaryBackgroundColor: "#111827",

  // Text colors
  textColor: "#f9fafb",
  secondaryTextColor: "#e5e7eb",
  tertiaryTextColor: "#9ca3af",

  // Border colors
  borderColor: "#374151",
  inputBorderColor: "#4b5563",

  // UI element colors
  primaryColor: "#3b82f6",
  dangerColor: "#ef4444",
  disabledColor: "#3b82f6",

  // Message bubbles
  ownMessageBackground: "#3b82f6",
  ownMessageText: "#fff",
  otherMessageBackground: "#374151",
  otherMessageText: "#f9fafb",

  // Status bar
  statusBarStyle: "light-content",

  // Tag colors
  tagBackground: "#374151",
  tagText: "#d1d5db",

  // Button colors
  buttonBackground: "#3b82f6",
  buttonText: "#fff",
  cancelButtonBackground: "#374151",
  cancelButtonText: "#d1d5db",

  // Settings-specific colors
  editButtonBackground: "#4C6EF5", // Or a more suitable dark color if needed
  editButtonBorderColor: "#1f2937",
  dividerColor: "#374151",
  shadowColor: "#000",

  // Overlay color
  overlay: "rgba(0, 0, 0, 0.6)",
};

// Default export of both themes
export default {
  light: lightTheme,
  dark: darkTheme,
};
