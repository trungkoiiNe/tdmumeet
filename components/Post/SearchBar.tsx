import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

const SearchBar = ({ value, onChangeText, onClear }: SearchBarProps) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.container, { backgroundColor: theme.backgroundColor, borderBottomColor: theme.borderColor }]}>
      <TextInput
        mode="outlined"
        placeholder="Search posts..."
        value={value}
        onChangeText={onChangeText}
        left={<TextInput.Icon icon="magnify" />}
        right={value ? <TextInput.Icon icon="close" onPress={onClear} /> : null}
        style={[styles.input, { backgroundColor: theme.secondaryBackgroundColor, color: theme.textColor }]}
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  input: {
    borderRadius: 8,
  }
});

export default React.memo(SearchBar);
