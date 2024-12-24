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
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}
      {item.text && (
        <Text
          style={
            item.sender === socketID ? styles.senderTxt : styles.receiverTxt
          }
        >
          {item.text}
        </Text>
      )}
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  senderContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#4A90E2",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 10,
  },
  receiverContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5E5",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 10,
  },
  senderTxt: {
    fontSize: 16,
    color: "#fff",
  },
  receiverTxt: {
    fontSize: 16,
    color: "#000",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: "cover",
  },
});
