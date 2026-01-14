import React from "react";
import { Avatar, InputAdornment, TextField } from "@mui/material";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import "./UserList.css";

interface UserData {
  email: string;
  username?: string;
  photoURL?: string;
  lastMessage?: string;
}

interface UsersPanelProps {
  users: UserData[];
  selectedUser: UserData | null;
  setSelectedUser: (user: UserData) => void;
}

const UserList = ({
  users,
  selectedUser,
  setSelectedUser,
}: UsersPanelProps) => {
  return (
    <div className="users-panel">
      <div className="top-header">
        <div className="chats-label">Chats</div>
        <div className="icon-group">
          <VideocamOutlinedIcon />
          <AddBoxOutlinedIcon />
        </div>
      </div>
      <TextField
        placeholder="Search Messenger..."
        size="small"
        fullWidth
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MessageOutlinedIcon sx={{ color: "#888" }} />
            </InputAdornment>
          ),
        }}
      />

      {users.map((user, idx) => (
        <div
          key={user.email || idx}
          className={`user-card ${
            selectedUser?.email === user.email ? "selected" : ""
          }`}
          onClick={() => setSelectedUser(user)}
        >
          <Avatar src={user.photoURL} />
          <div className="user-info">
            <span className="username">{user.username || user.email}</span>
            {user.lastMessage && (
              <span className="last-message">{user.lastMessage}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
