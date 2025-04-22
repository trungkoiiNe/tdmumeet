import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useThemeStore } from "@/stores/themeStore";
import themes from "@/utils/themes";
import { useDocuments } from "./DocumentsContext";

import * as Clipboard from "expo-clipboard";
export default function ChatHeader() {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? themes.dark : themes.light;
    const { selectedSessionTitle, setShowDrawer, createNewSession } = useDocuments();

    const styles = StyleSheet.create({
        header: {
            paddingTop: Platform.OS === "android" ? 35 : 15,
            paddingBottom: 10,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.backgroundColor,
        },
        drawerButton: {
            padding: 8,
        },
        titleContainer: {
            flex: 1,
            alignItems: "center",
        },
        title: {
            fontSize: 18,
            fontWeight: "bold",
            color: theme.textColor,
        },
        editButton: {
            padding: 8,
        },
    });

    return (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.drawerButton}
                onPress={() => setShowDrawer(true)}
            >
                <FontAwesome name="bars" size={22} color={theme.textColor} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {selectedSessionTitle || "TDMU Meet AI"}
                </Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={createNewSession}>
                <FontAwesome name="edit" size={22} color={theme.textColor} />
            </TouchableOpacity>
        </View>
    );
}
