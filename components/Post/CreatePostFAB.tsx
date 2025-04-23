import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface CreatePostFABProps {
  onPress: () => void;
}

const CreatePostFAB = ({ onPress }: CreatePostFABProps) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  const handlePress = () => {
    scale.value = withSpring(1.1, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.primaryColor }]}
        onPress={handlePress}
        label="New Post"
        color={theme.buttonText}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    bottom: 16
  },
  fab: {
    backgroundColor: "#3b82f6"
  }
});

export default React.memo(CreatePostFAB);