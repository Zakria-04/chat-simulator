import {
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

type Message = {
  text: string;
  sender: string;
};

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const socket = initializeSocket();

  useEffect(() => {
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

  const sendNewMessage = () => {
    const newMessage = { text: message, sender: socket.id || "" };

    if (message.trim()) {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      socket.emit("message", newMessage);
      setMessage("");
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

            <TouchableOpacity>
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
