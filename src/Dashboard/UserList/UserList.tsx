import React, { useState } from "react";
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
  uid: string;
  createdAt: string;
  isOnline?: boolean;
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
  const [search, setSearch] = useState("");


  const filteredUsers = users.filter((user) => {
    const value = (user.username || user.email).toLowerCase();
    return value.includes(search.toLowerCase());
  });

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
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MessageOutlinedIcon sx={{ color: "#888" }} />
            </InputAdornment>
          ),
        }}
      />

      <div className="user-list">
        {filteredUsers.map((user) => (
          <div
            key={user.uid}
            className={`user-card ${
              selectedUser?.uid === user.uid ? "selected" : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            <Avatar src={user.photoURL} />
            <div className="user-info">
              <span className="username">{user.username || user.email}</span>
              <span className="status">
                {user.isOnline ? "online" : "offline"}
              </span>
            </div>
          </div>
        ))}

       
        {filteredUsers.length === 0 && (
          <p className="loading">No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserList;
