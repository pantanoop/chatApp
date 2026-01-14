import React, { useEffect, useState, useRef } from "react";
import SendIcon from "@mui/icons-material/Send";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { formatInTimeZone } from "date-fns-tz";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  serverTimestamp,
  limit,
} from "firebase/firestore";

import { db } from "../../config/firebase";

interface UserData {
  email: string;
  username?: string;
  photoURL?: string;
  uid: string;
  createdAt: string;
}

interface ChatPanelProps {
  selectedUser: UserData | null;
}

const ChatPanel = ({ selectedUser }: ChatPanelProps) => {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [openEmoji, setOpenEmoji] = useState(false);
  const currentDate = new Date();
  const timeZone = "Asia/Kolkata";
  const indiaTime = formatInTimeZone(currentDate, timeZone, "HH:mm");
  const [newMessage, setNewMessage] = useState("");
  console.log(indiaTime);

  const currentUser = useSelector(
    (state: RootState) => state.authenticator.currentUser
  );

  const me = currentUser?.uid;
  const targetUser = selectedUser?.uid;

  const uniqueChatID = [me, targetUser].sort().join(",");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // useEffect(() => {
  //   if (!uniqueChatID) return;

  //   const q = query(
  //     collection(db, "messages"),
  //     orderBy("createdAt", "asc"),
  //     limit(10)
  //   );

  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const newMessages: any[] = [];
  //     snapshot.forEach((doc) => {
  //       newMessages.push({ id: doc.id, ...doc.data() });
  //     });
  //     setMessages(newMessages);
  //     scrollToBottom();
  //   });

  //   return () => unsubscribe();
  // }, [uniqueChatID]);

  useEffect(() => {
    // Query messages for this room
    const q = query(
      collection(db, "chatRoom", uniqueChatID, "messages"),
      orderBy("createdAt", "asc")
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: any = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [uniqueChatID]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !uniqueChatID) return;

    const res = await addDoc(
      collection(db, "chatRoom", uniqueChatID, "messages"),
      {
        text: messageText,
        senderId: me,
        receiverId: targetUser,
        createdAt: serverTimestamp(),
        sentTime: indiaTime,
      }
    );
    console.log("send res", res);
    setMessageText("");
  };

  const handleEmojiClick = () => {
    console.log("handleeoji befor click", openEmoji);
    setOpenEmoji(!openEmoji);
    console.log("handle emoji after", openEmoji);
  };

  const handleEmojiClickEmoji = (emojiObj: any) => {
    setMessageText(emojiObj.emoji);
  };

  return (
    <div className="chat-panel">
      {selectedUser ? (
        <>
          <div className="chat-header">
            <h4>{selectedUser.username || selectedUser.email}</h4>
          </div>

          <div className="chat-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-message ${
                  m.senderId === me ? "sent" : "received"
                }`}
              >
                {m.text}
                <p>{m.sentTime}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div>
            {openEmoji && <EmojiPicker onEmojiClick={handleEmojiClickEmoji} />}
          </div>

          <div className="chat-input-container">
            <ImageOutlinedIcon />
            <PhotoCameraOutlinedIcon />
            <button
              onClick={handleEmojiClick}
              style={{
                margin: "0px",
                padding: "0px",
                borderRadius: "50%",
              }}
            >
              <EmojiEmotionsOutlinedIcon />
            </button>
            <input
              className="chat-input"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>
              <SendIcon />
            </button>
          </div>
        </>
      ) : (
        <p style={{ color: "#888", textAlign: "center", marginTop: "50px" }}>
          Select a user to start chat
        </p>
      )}
    </div>
  );
};

export default ChatPanel;
