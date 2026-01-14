import React from "react";
interface UserData {
  email: string;
  username?: string;
  photoURL?: string;
}

interface ChatPanelProps {
  selectedUser: UserData | null;
}

const ChatPanel = ({ selectedUser }: ChatPanelProps) => {
  return (
    <div className="chat-panel">
      {selectedUser ? (
        <>
          <div className="chat-header">
            <h4>{selectedUser.username || selectedUser.email}</h4>
          </div>
          <div className="chat-messages">
            <div className="chat-message received">Hey! How are you?</div>
            <div className="chat-message sent">
              I'm good, thanks! What about you?
            </div>
          </div>
          <div className="chat-input-container">
            <input className="chat-input" placeholder="Type a message..." />
            <div className="chat-icons">📷 🎵 🎤</div>
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
