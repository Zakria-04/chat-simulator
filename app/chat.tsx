import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Images } from "@/assets/images/images";
import ChatList from "@/components/ChatList";
import { initializeSocket } from "@/assets/res/socket";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

type Message = {
  text: string;
  sender: string;
  image: string | null;
};

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [image, setImage] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const socket = initializeSocket();

  const requestPermissions = async () => {
    // ask for gallery Permission access
    const { status: mediaLibraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();

    if (mediaLibraryStatus !== "granted" || cameraStatus !== "granted") {
      Alert.alert("Permission to access camera and media library is required!");
    }
  };

  useEffect(() => {
    requestPermissions();

    socket.on("connect", () => {
      console.log(`Socket connected? ${socket.connected}`);
    });

    socket.on("message", (data) => {
      console.log("Received message:", data);
      setMessages((prevMessage) => [...prevMessage, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const resizeImage = async (uri: string) => {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulatedImage.uri;
  };

  // make the image base64 so it can be seen on both android and ios platforms
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const resizedUri = await resizeImage(result.assets[0].uri);
        const base64 = await FileSystem.readAsStringAsync(resizedUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setImage(`data:image/jpeg;base64,${base64}`);
      } catch (error) {
        console.error("Error converting image to Base64:", error);
      }
    } else {
      Alert.alert("You did not select any image.");
    }
  };

  // take and transfer image into base64
  const takeImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const resizedUri = await resizeImage(result.assets[0].uri);
        const base64 = await FileSystem.readAsStringAsync(resizedUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setImage(`data:image/jpeg;base64,${base64}`);
      } catch (error) {
        console.error("Error converting image to Base64:", error);
      }
    } else {
      Alert.alert("You did not take any image");
    }
  };

  const sendNewMessage = () => {
    const newMessage = {
      text: message,
      image: image ? image : null,
      sender: socket.id || "",
    };

    if (message.trim() || image) {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      socket.emit("message", newMessage);
      setMessage("");
      setImage(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* make the keyboard responsive for ios on input open */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={styles.container}>
          {/* chat body */}
          <View style={styles.chatBody}>
            <FlatList
              data={messages}
              renderItem={({ item }) => (
                <ChatList item={item} socketID={socket.id} />
              )}
            />
          </View>

          {/* chat input footer */}
          <View style={styles.inputContainer}>
            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity
                  onPress={() => setImage(null)}
                  style={styles.clearImageButton}
                >
                  <Text style={styles.clearImageText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              style={styles.input}
              value={message}
              placeholder="Type a message"
              onChangeText={setMessage}
            />

            <TouchableOpacity onPress={takeImage} style={styles.inputBtns}>
              <Image source={Images.camera()} style={styles.inputBtnImage} />
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} style={styles.inputBtns}>
              <Image source={Images.gallery()} style={styles.inputBtnImage} />
            </TouchableOpacity>

            <TouchableOpacity onPress={sendNewMessage} style={styles.inputBtns}>
              <Image source={Images.send()} style={styles.inputBtnImage} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  inputBtns: {
    width: 39,
    height: 39,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  inputBtnImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  chatBody: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  imagePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8, // Spacing between image and input
    position: "relative",
  },
  imagePreview: {
    width: 40, // Adjust size of preview
    height: 40,
    borderRadius: 8,
    resizeMode: "cover",
  },
  clearImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  clearImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
