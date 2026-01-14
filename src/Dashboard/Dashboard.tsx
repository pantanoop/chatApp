import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Sidebar from "./Sidebar/Sidebar";
import ChatPanel from "./ChatPanel/ChatPanel";
import UserList from "./UserList/UserList";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import "./Dashboard.css";
interface UserData {
  email: string;
  username?: string;
  photoURL?: string;
}

function Dashboard() {
  const currentUser = useSelector(
    (state: RootState) => state.authenticator.currentUser
  );

  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;

      const usersCollectionRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollectionRef);
      const usersList = usersSnapshot.docs
        .map((doc) => doc.data() as UserData)
        .filter((u) => u.email !== currentUser.email);
      setUsers(usersList);
    };

    fetchUsers();
  }, [currentUser]);

  return (
    <div className="dashboard-container">
      <Sidebar currentUserPhoto={currentUser?.photoURL} />

      <UserList
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <ChatPanel selectedUser={selectedUser} />
    </div>
  );
}

export default Dashboard;
