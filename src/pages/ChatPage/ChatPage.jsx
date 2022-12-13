import React, { useEffect, useRef, useState } from "react";
import ChatBox from "../../components/ChatBox/ChatBox";
import ChatList from "../../components/ChatList/ChatList";
import axios from "axios";
import { io } from "socket.io-client";
import "./ChatPage.css";

export default function ChatPage({ user, setUser }) {
  const socket = useRef();
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  //get chat
  useEffect(() => {
    const getUserChats = async () => {
      try {
        let payload = await axios.get(`/api/chats/${user._id}`);
        if (!payload.status === 200) throw new Error("No response received");
        setChats(payload.data);
      } catch (error) {
        console.log(error);
      }
    };
    getUserChats();
  }, [user._id]);

  //connect to socket.io
  useEffect(() => {
    socket.current = io();
    socket.current.emit("new-user-add", user._id);
  }, [user]);

  //update messages if receiver has sender's chat open
  useEffect(() => {
    socket.current.on("receive-message", (data) => {
      if (data.chatId === currentChat?._id) {
        setMessages((messages) => [...messages, data]);
      }
    });
    return () => {
      socket.current.off("receive-message");
    };
  }, [currentChat]);

  //listen on get users, deleted...
  useEffect(() => {
    socket.current.on("deleted", (data) => {
      const { messageId } = data;
      setMessages((messages) =>
        messages.filter((message) => message._id !== messageId)
      );
    });
    socket.current.on("get-users", (users) => {
      setOnlineUsers(users);
    });
    return () => {
      socket.current.off("deleted");
      socket.current.off("get-users");
      socket.current.disconnect();
    };
  }, []);

  // get messages for chat
  useEffect(() => {
    const serverRoute = "api/messages";
    const getChatMessages = async () => {
      try {
        let { data } = await axios.get(`${serverRoute}/${currentChat._id}`);
        setMessages(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (currentChat !== null) {
      getChatMessages();
    }
  }, [currentChat]);

  //set all users
  useEffect(() => {
    const getAllUsers = async () => {
      try {
        let { data } = await axios.get(`api/users`);
        data = data.filter((users) => users._id !== user._id);
        setAllUsers(data);
      } catch (error) {
        console.log(error);
      }
    };
    getAllUsers();
  }, []);

  //start chat
  async function startChat(friendId) {
    try {
      const newChat = await axios.post(
        `api/chats/create/${user._id}/${friendId}`
      );
      setChats((chats) => [...chats, newChat.data]);
    } catch (error) {
      console.log(error);
    }
  }

  //check who is online
  function isOnline(chat) {
    const chatMember = chat.members.find((member) => member !== user._id);
    const online = onlineUsers.find((user) => user.userId === chatMember);
    return online ? true : false;
  }

  // set currentChat
  function setChat(chat) {
    setCurrentChat(chat);
    updateMessageStatus(chat);
  }
  // create function that calls back to setCurrentChat, pass it into Conversations
  // function updateReadMessages(cb) {
  // updateMessageStatus(chatId)
  // }
  // separate setCurrentChat
  // update message readstatus to true
  // currently, if a new msg is sent, then unread msgs will show after refresh
  // second, even if sender sends msg, after refresh, unread msgs will show in
  // their chatbox with the receiver
  // third, if sender clicks back into convo with receiver, then that will
  // clear the receiver's unread messages

  const updateMessageStatus = async (chat) => {
    try {
      await axios.put(`api/messages/status/${chat._id}`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="chatpage-container">
        <ChatList
          user={user}
          setUser={setUser}
          startChat={startChat}
          setChat={setChat}
          isOnline={isOnline}
          setNewMessage={setNewMessage}
          currentChat={currentChat}
          setMessages={setMessages}
          messages={messages}
          newMessage={newMessage}
          chats={chats}
          allUsers={allUsers}
          setAllUsers={setAllUsers}
          socket={socket}
        />

        <ChatBox
          currentChat={currentChat}
          currentUserId={user._id}
          setMessages={setMessages}
          setNewMessage={setNewMessage}
          messages={messages}
          newMessage={newMessage}
          socket={socket}
          user={user}
        />
      </div>
    </>
  );
}
