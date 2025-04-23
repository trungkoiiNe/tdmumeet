import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { theme } from "../../app/(users)/(tabs)/(teams)/(channels)/styles";
import React from "react";

interface TextProps extends RNTextProps {
  variant?: "body" | "title" | "subtitle" | "caption" | "button" | "overline";
  color?: string;
}

const Text = ({
  variant = "body",
  style,
  color,
  ...props
}: TextProps) => {
  return (
    <RNText
      style={[
        (() => {
          switch (variant) {
            case "title":
              return { fontSize: 20, fontWeight: "700", lineHeight: 28 };
            case "subtitle":
              return { fontSize: 16, fontWeight: "600", lineHeight: 24 };
            case "caption":
              return { fontSize: 12, lineHeight: 16 };
            case "button":
              return { fontSize: 14, fontWeight: "600", letterSpacing: 0.5 };
            case "overline":
              return {
                fontSize: 10,
                fontWeight: "500",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              };
            case "body":
            default:
              return { fontSize: 14, lineHeight: 20 };
          }
        })(),
        { color: color || theme.colors.onBackground },
        style,
      ]}
      {...props}
    />
  );
};
export default Text;