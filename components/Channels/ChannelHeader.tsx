import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, TouchableOpacity, Text } from "react-native";
import ContextMenu from "react-native-context-menu-view";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../../app/(users)/(tabs)/(teams)/(channels)/styles";
import { Channel, MenuAction } from "../../app/(users)/(tabs)/(teams)/(channels)/types";

interface ChannelHeaderProps {
  channel: Channel;
  onBack: () => void;
  onInfoPress: () => void;
  menuActions: MenuAction[];
}

const ChannelHeader = ({
  channel,
  onBack,
  onInfoPress,
  menuActions,
}: ChannelHeaderProps) => {
  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: "#fff" }]}>
        {channel.name}
      </Text>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={onInfoPress} style={styles.headerButton}>
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <ContextMenu
          actions={menuActions}
          onPress={(e) => {
            const selectedAction = menuActions.find(
              (action) => action.title === e.nativeEvent.name
            );
            if (selectedAction) {
              selectedAction.onPress();
            }
          }}
          previewBackgroundColor="#f2f2f2"
        >
          <View style={styles.headerButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="#fff"
            />
          </View>
        </ContextMenu>
      </View>
    </LinearGradient>
  );
};
export default ChannelHeader;