import { View, Text } from "react-native";
import { styles } from "../styles";
import { formatMessageDate } from "@/utils/dateUtils";
import React from "react";

interface DateHeaderProps {
  timestamp: number;
}

const DateHeader = ({ timestamp }: DateHeaderProps) => {
  return (
    <View style={styles.dateHeader}>


    </View>
  );
};
export default DateHeader;