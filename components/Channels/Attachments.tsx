import { useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import { styles } from "../../app/(users)/(tabs)/(teams)/(channels)/styles";
import ImageViewer from "./ImageViewer";
import React from "react";

interface AttachmentProps {
  imageUri: string;
  messageId: string;
}

const Attachment = ({ imageUri, messageId }: AttachmentProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        accessibilityLabel="View image attachment"
        accessibilityRole="button"
      >
        <Image source={{ uri: imageUri }} style={styles.thumbnailImage} />
      </TouchableOpacity>

      <ImageViewer
        imageUri={imageUri}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      // messageId={messageId}
      />
    </>
  );
};
export default Attachment;