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

    if (mediaLibraryStatus !== "granted") {
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
      [{ resize: { width: 800 } }], // Resize to a smaller width
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulatedImage.uri;
  };

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
            <TextInput
              style={styles.input}
              value={message}
              placeholder="Type a message"
              onChangeText={setMessage}
            />

            <TouchableOpacity>
              <Image source={Images.camera()} style={styles.inputBtns} />
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage}>
              <Image source={Images.gallery()} style={styles.inputBtns} />
            </TouchableOpacity>

            <TouchableOpacity onPress={sendNewMessage}>
              <Image source={Images.send()} style={styles.inputBtns} />
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
  },
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderColor: "#ccc",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  inputBtns: {
    width: 35,
    height: 35,
  },
  chatBody: {
    flex: 1,
  },
});
