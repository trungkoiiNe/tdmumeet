import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../app/(users)/(tabs)/(teams)/(channels)/styles";
import React from "react";

interface NoAccessViewProps {
  onJoin: () => void;
}

const NoAccessView = ({ onJoin }: NoAccessViewProps) => {
  return (
    <View style={styles.noAccessContainer}>
      <Text style={styles.noAccessText}>
        This is a private channel. Join to view messages.
      </Text>
      <TouchableOpacity onPress={onJoin} style={styles.button}>
        <Text style={styles.buttonText}>Join Channel</Text>
      </TouchableOpacity>
    </View>
  );
};
export default NoAccessView;