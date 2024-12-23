import { StyleSheet, Text, View } from "react-native";
import React from "react";

interface Message {
  message: string;
  senderID: string;
}

interface ChatListProps {
  item: Message;
}

const ChatList: React.FC<ChatListProps> = ({}) => {
  return (
    <View>
      <Text>ChatList</Text>
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({});
