import React, { useState, useEffect } from "react";
import { Avatar, Snackbar, Alert } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

import ChatIcon from "@mui/icons-material/Chat";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import ArchiveIcon from "@mui/icons-material/Archive";
import LogoutIcon from "@mui/icons-material/Logout";

import { doc, updateDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const Sidebar = () => {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>("");

  const currentUser = useSelector(
    (state: RootState) => state.authenticator.currentUser
  );

  useEffect(() => {
    setAvatar(currentUser?.photoURL);
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        await updateDoc(docRef, { isOnline: false });
      }

      setOpenSnackbar(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      console.error(err);
      setError("Failed to sign out.");
    }
  };

  return (
    <>
      <div className="app-sidebar">
        <div className="sidebar-top">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbTyi3afQGtFkxup4GYKuYWVkcbgxJXUOnUw&s"
            alt="Messenger"
            className="messenger-logo"
          />
        </div>

        <div className="sidebar-menu">
          <div className="menu-item active">
            <ChatIcon />
            <span>Chat</span>
          </div>
          <div className="menu-item">
            <PeopleIcon />
            <span>People</span>
          </div>
          <div className="menu-item">
            <StoreIcon />
            <span>Shop</span>
          </div>
          <div className="menu-item">
            <RequestPageIcon />
            <span>Request</span>
          </div>
          <div className="menu-item">
            <ArchiveIcon />
            <span>Archive</span>
          </div>
        </div>

        <div className="sidebar-logout">
          <div
            className="menu-item"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/profile/edit")}
          >
            <Avatar src={avatar} sx={{ width: 32, height: 32 }} />
          </div>

          <div className="menu-item logout-item" onClick={handleLogout}>
            <LogoutIcon />
            <span>Logout</span>
          </div>
        </div>
      </div>

      <Snackbar open={openSnackbar} autoHideDuration={2000}>
        <Alert severity="success">Successfully Logged Out 🎉</Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={3000}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </>
  );
};

export default Sidebar;
