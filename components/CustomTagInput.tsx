// Custom Tag Input Component
// File: c:/Users/Koii/tdmumeet/components/CustomTagInput.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CustomTagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  containerStyle?: object;
  tagStyle?: object;
  tagTextStyle?: object;
  inputStyle?: object;
}

const CustomTagInput: React.FC<CustomTagInputProps> = ({
  value,
  onChange,
  placeholder = "Add a tag",
  containerStyle,
  tagStyle,
  tagTextStyle,
  inputStyle,
}) => {
  const [text, setText] = useState("");

  const addTag = () => {
    const newTag = text.trim();
    if (newTag.length > 0 && !value.includes(newTag)) {
      onChange([...value, newTag]);
    }
    setText("");
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (
      e.nativeEvent.key === " " ||
      e.nativeEvent.key === "," ||
      e.nativeEvent.key === "Enter"
    ) {
      addTag();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.tagList}>
        {value.map((tag, index) => (
          <View key={index} style={[styles.tag, tagStyle]}>
            <Text style={[styles.tagText, tagTextStyle]}>{tag}</Text>
            <TouchableOpacity
              onPress={() => onChange(value.filter((t) => t !== tag))}
            >
              <MaterialCommunityIcons name="close" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TextInput
        style={[styles.input, inputStyle]}
        value={text}
        onChangeText={setText}
        onSubmitEditing={addTag}
        placeholder={placeholder}
        blurOnSubmit={false}
        onKeyPress={handleKeyPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 4,
    borderRadius: 4,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1393CA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    color: "#FFF",
    marginRight: 4,
  },
  input: {
    minWidth: 100,
    padding: 4,
    color: "#000",
  },
});

export default CustomTagInput;
