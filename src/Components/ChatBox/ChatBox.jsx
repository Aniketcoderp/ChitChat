import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../Context/AppContext";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const convertTimestamp = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0");
    return hour > 12 ? `${hour - 12}:${minute} PM` : `${hour}:${minute} AM`;
  };

  const updateChatData = async (id, lastMessage) => {
    try {
      const userChatRef = doc(db, "chats", id);
      const userChatSnapshot = await getDoc(userChatRef);
      if (userChatSnapshot.exists()) {
        const userChatData = userChatSnapshot.data();
        const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);

        if (chatIndex !== -1) {
          userChatData.chatsData[chatIndex] = {
            ...userChatData.chatsData[chatIndex],
            lastMessage: lastMessage,
            updateAt: Date.now(),
            messageSeen: userChatData.chatsData[chatIndex].rId === userData.id ? false : true,
          };
          await updateDoc(userChatRef, { chatsData: userChatData.chatsData });
        }
      }
    } catch (error) {
      console.error("Error updating chat data:", error.message);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !messagesId) return;

    setIsSending(true);
    try {
      const newMessage = { sId: userData.id, text: input, createdAt: new Date() };
      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion(newMessage),
      });

      const userIDs = [chatUser.rId, userData.id];
      userIDs.forEach((id) => updateChatData(id, input.slice(0, 30)));
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setInput("");
      setIsSending(false);
    }
  };

  const uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
      if (!file) reject(new Error("No file provided"));
      const fileUrl = URL.createObjectURL(file); // Simulate getting a file URL
      setTimeout(() => resolve(fileUrl), 1000); // Simulate a delay
    });
  };

  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !messagesId) return;

    setIsSending(true);
    try {
      const fileUrl = await uploadFile(file);
      const newImageMessage = { sId: userData.id, image: fileUrl, createdAt: new Date() };

      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion(newImageMessage),
      });

      const userIDs = [chatUser.rId, userData.id];
      userIDs.forEach((id) => updateChatData(id, "Image"));
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data()?.messages?.reverse() || []);
      });
      return () => unSub();
    }
  }, [messagesId, setMessages]);

  return chatUser?(
    <div className="chat-box">
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
         {chatUser.userData.name}<img className="dot" src={assets.green_dot} alt="" />
        </p>
        <img src={assets.help_icon} className="help" alt="" />
      </div>

      <div className="chat-msg">
      {messages.map((msg,index)=>(
        <div key={index} className={msg.sId === userData.id ? "s-msg": "r-msg"}>
        {msg.image
        ?<img className="msg-img"  src={msg.image}/>:<p className="msg">{msg.text}</p> }
        <div>
          <img src={msg.sId === userData.id?userData.avatar:chatUser.userData.avatar} alt="" />
          <p>{convertTimestamp(msg.createdAt)}</p>
        </div>
      </div>
      ))}
      </div>
      <div className="chat-input">
        <input  onChange={(e)=>setInput(e.target.value)} value={input}type="text" placeholder="Send a message" />
        <input onChange={sendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage}src={assets.send_button} alt="" />
      </div>
    </div>
  ):<div className="chat-welcome">
    <img src={assets.chitchat} alt="" />
    <p>Connect Instantly, Anywhere, Anytime</p>
  </div>
};

export default ChatBox;
