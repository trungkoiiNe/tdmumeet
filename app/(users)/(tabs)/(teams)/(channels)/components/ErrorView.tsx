import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";
import React from "react";

interface ErrorViewProps {
  errorMessage: string;
  onRetry: () => void;
}

const ErrorView = ({ errorMessage, onRetry }: ErrorViewProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};
export default ErrorView;
