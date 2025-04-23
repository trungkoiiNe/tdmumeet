"use client";

import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { Avatar } from "react-native-paper";
import { styles } from "../../app/(users)/(tabs)/(teams)/(channels)/styles";
import React from "react";

interface TypingIndicatorProps {
  userId: string;
  visible: boolean;
}

const TypingIndicator = ({ userId, visible }: TypingIndicatorProps) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    }

    return () => {
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    };
  }, [visible, dot1, dot2, dot3]);

  if (!visible) return null;

  return (
    <View style={styles.typingIndicator}>
      <Avatar.Text size={24} label={userId.substring(0, 2).toUpperCase()} />
      <View style={{ flexDirection: "row", marginLeft: 8 }}>
        <Animated.View
          style={[
            styles.typingDot,
            {
              opacity: dot1,
              transform: [
                {
                  translateY: dot1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.typingDot,
            {
              opacity: dot2,
              transform: [
                {
                  translateY: dot2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.typingDot,
            {
              opacity: dot3,
              transform: [
                {
                  translateY: dot3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};
export default TypingIndicator;