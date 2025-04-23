import ContentLoader, { Rect } from "react-content-loader/native";
import { useWindowDimensions, View } from "react-native";
import { styles } from "../styles";
import React from "react";
const MessageSkeleton = () => {
  const { width } = useWindowDimensions();
  const bubbleWidth = width * 0.6;

  return (
    <View style={styles.skeletonContainer}>
      <ContentLoader
        speed={1}
        width={width}
        height={70}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={styles.skeletonLoader}
      >
        <Rect x="10" y="10" rx="16" ry="16" width={bubbleWidth} height="50" />
      </ContentLoader>

      {/* Right-aligned message skeleton */}
      <ContentLoader
        speed={1}
        width={width}
        height={60}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={styles.skeletonLoader}
      >
        <Rect
          x={width - bubbleWidth - 10}
          y="10"
          rx="16"
          ry="16"
          width={bubbleWidth}
          height="40"
        />
      </ContentLoader>

      {/* Left-aligned message skeleton */}
      <ContentLoader
        speed={1}
        width={width}
        height={80}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={styles.skeletonLoader}
      >
        <Rect
          x="10"
          y="10"
          rx="16"
          ry="16"
          width={bubbleWidth - 40}
          height="60"
        />
      </ContentLoader>

      {/* Right-aligned message skeleton */}
      <ContentLoader
        speed={1}
        width={width}
        height={55}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={styles.skeletonLoader}
      >
        <Rect
          x={width - bubbleWidth + 30}
          y="10"
          rx="16"
          ry="16"
          width={bubbleWidth - 50}
          height="35"
        />
      </ContentLoader>
    </View>
  );
};

export default MessageSkeleton;