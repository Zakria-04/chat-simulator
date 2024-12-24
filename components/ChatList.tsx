import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";

interface Message {
  text: string;
  sender: string;
  image: string | null;
}

interface ChatListProps {
  item: Message;
  socketID: any;
}

const ChatList: React.FC<ChatListProps> = ({ item, socketID }) => {
  return (
    <View
      style={[
        styles.container,
        item.sender === socketID
          ? styles.senderContainer
          : styles.receiverContainer,
      ]}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : null}
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    maxWidth: "80%",
  },
  senderContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#cce7ff",
  },
  receiverContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e0e0",
  },
  text: {
    fontSize: 15,
  },
  image: {
    width: 150,
    height: 150,
  },
});
