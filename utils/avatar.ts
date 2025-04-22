import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * Picks an image from the device's media library, compresses it, and returns a base64 string
 * @returns {Promise<string|null>} Base64 string of the image or null if cancelled/error
 */
const pickupImage = async (): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return null;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1, // Start with high quality
      base64: false, // Do NOT convert to Base64 yet
    });

    if (result.canceled) {
      return null;
    }

    let imageUri = result.assets[0].uri;

    // Compress & Resize the image to fit under 1MB
    let compressedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // { resize: { width: 800 } }
      ]
      , // Resize width to 800px (adjust as needed)
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    // Ensure the base64 size is under 1MB
    if (!compressedImage.base64) {
      throw new Error("Failed to get base64 from image");
    }

    let base64Size = (compressedImage.base64.length * (3 / 4)) / 1024; // Convert to KB
    console.log(`Base64 size: ${base64Size.toFixed(2)} KB`);

    if (base64Size > 1000) {
      console.warn("Image still too large. Attempting further compression.");
      // Try one more time with higher compression
      compressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 600 } }], // Smaller resize
        {
          compress: 0.75, // Higher compression
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      base64Size = (compressedImage.base64.length * (3 / 4)) / 1024;
      if (base64Size > 1000) {
        console.error(
          "Image still too large even after additional compression"
        );
        alert("Image is too large. Please select a smaller image.");
        return null;
      }
    }

    return compressedImage.base64;
  } catch (error) {
    console.error("Error in pickupImage:", error);
    return null;
  }
};

export default pickupImage;
