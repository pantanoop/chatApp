import React, { useEffect, useState, useRef } from "react";
import SendIcon from "@mui/icons-material/Send";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { formatInTimeZone } from "date-fns-tz";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CallIcon from "@mui/icons-material/Call";
import DuoIcon from "@mui/icons-material/Duo";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";

import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  limit,
  startAfter,
} from "firebase/firestore";

import { db } from "../../config/firebase";
import "./ChatPanel.css";

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

const PAGE_SIZE = 10;

const ChatPanel = ({ selectedUser }: ChatPanelProps) => {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const currentDate = new Date();
  const indiaTime = formatInTimeZone(currentDate, "Asia/Kolkata", "HH:mm");

  const currentUser = useSelector(
    (state: RootState) => state.authenticator.currentUser
  );

  const me = currentUser?.uid;
  const targetUser = selectedUser?.uid;
  const uniqueChatID =
    me && targetUser ? [me, targetUser].sort().join(",") : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!uniqueChatID) return;

    const loadInitialMessages = async () => {
      setMessages([]);
      setLastVisible(null);
      setHasMore(true);

      const q = query(
        collection(db, "chatRoom", uniqueChatID, "messages"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setHasMore(false);
        return;
      }

      const msgs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setMessages(msgs.reverse());
      setLastVisible(snap.docs[snap.docs.length - 1]);

      setTimeout(scrollToBottom, 100);
    };

    loadInitialMessages();
  }, [uniqueChatID]);

  const loadMoreMessages = async () => {
    if (!uniqueChatID || !lastVisible || loadingMore || !hasMore) return;

    setLoadingMore(true);

    const q = query(
      collection(db, "chatRoom", uniqueChatID, "messages"),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      setHasMore(false);
      setLoadingMore(false);
      return;
    }

    const older = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setMessages((prev) => [...older.reverse(), ...prev]);
    setLastVisible(snap.docs[snap.docs.length - 1]);
    setLoadingMore(false);
  };

  useEffect(() => {
    if (!uniqueChatID) return;

    const q = query(
      collection(db, "chatRoom", uniqueChatID, "messages"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === change.doc.id)) return prev;
            return [...prev, { id: change.doc.id, ...change.doc.data() }];
          });
          scrollToBottom();
        }
      });
    });

    return () => unsubscribe();
  }, [uniqueChatID]);

  const handleSendMessage = async () => {
    if (!uniqueChatID || !messageText.trim()) return;

    await addDoc(collection(db, "chatRoom", uniqueChatID, "messages"), {
      text: messageText,
      senderId: me,
      receiverId: targetUser,
      createdAt: serverTimestamp(),
      sentTime: indiaTime,
    });

    setMessageText("");
    updateTypingStatus(false);
  };

  useEffect(() => {
    if (!uniqueChatID || !me || !targetUser) return;

    const typingRef = doc(db, "chatRoom", uniqueChatID);

    const unsubscribe = onSnapshot(typingRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()?.typing || {};
        setOtherUserTyping(data[targetUser] === true);
      }
    });

    return () => unsubscribe();
  }, [uniqueChatID, me, targetUser]);

  const updateTypingStatus = async (status: boolean) => {
    if (!uniqueChatID || !me) return;

    await setDoc(
      doc(db, "chatRoom", uniqueChatID),
      { typing: { [me]: status } },
      { merge: true }
    );
  };

  const handleTyping = () => {
    updateTypingStatus(true);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 1500);
  };

  return (
    <div className="chat-panel">
      {selectedUser ? (
        <>
          <div className="chat-header">
            <div className="chat-header-left">
              <img
                src={selectedUser.photoURL || "/avatar.png"}
                alt="user"
                className="chat-header-avatar"
              />
              <div>
                <h4>{selectedUser.username}</h4>
                <span className="chat-status">Active</span>
              </div>
            </div>

            <div className="chat-header-right">
              <CallIcon />
              <DuoIcon />
              <PriorityHighOutlinedIcon />
            </div>
          </div>

          <div
            className="chat-messages"
            ref={chatContainerRef}
            onScroll={() => {
              if (chatContainerRef.current?.scrollTop === 0) {
                loadMoreMessages();
              }
            }}
          >
            {loadingMore && <div className="loading-msg">Loading...</div>}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`message-row ${m.senderId === me ? "own" : ""}`}
              >
                <div className="chat-message">
                  <span className="message-text">{m.text}</span>
                  <span className="message-time">{m.sentTime}</span>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {openEmoji && (
            <div className="emoji-wrapper">
              <EmojiPicker
                onEmojiClick={(e) => setMessageText((prev) => prev + e.emoji)}
              />
            </div>
          )}

          {otherUserTyping && (
            <div className="typing-indicator">
              {selectedUser.username} is typing...
            </div>
          )}

          <div className="chat-input-container">
            <ImageOutlinedIcon />
            <PhotoCameraOutlinedIcon />

            <button onClick={() => setOpenEmoji(!openEmoji)}>
              <EmojiEmotionsOutlinedIcon />
            </button>

            <input
              className="chat-input"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              onBlur={() => updateTypingStatus(false)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />

            <button className="send-btn" onClick={handleSendMessage}>
              <SendIcon />
            </button>
          </div>
        </>
      ) : (
        <p className="no-chat">Select a user to start chat</p>
      )}
    </div>
  );
};

export default ChatPanel;
