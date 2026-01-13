import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, DocumentData } from 'firebase/firestore'; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Snackbar,
  Alert,
    Button,
} from "@mui/material";

interface UserData {
  email: string;
}

function Dashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const currentUser = useSelector(
    (state: RootState) => state.authenticator.currentUser
  );

  console.log({ currentUser });

  const handleSignOut = async () => {
    try {
      await signOut(auth);
       setOpenSnackbar(true);
        setTimeout(() => {
      navigate("/");
    }, 1200);
      alert('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out.');
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);
        const usersList = usersSnapshot.docs.map(
          (doc) => doc.data() as UserData
        );
        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers().catch(console.error);
  }, []);

  return (
    <div className='.main-container'>
      <header>Welcome to the app!
        <Button onClick={handleSignOut} variant="contained" fullWidth>
          Log Out
        </Button>
      </header>
      <div className='chat-section'>
        <div className='user-section'>
            <div></div>
            <div className='users'>

            </div>
        </div>
      </div>


      <h3>👤Registered Users:</h3>
      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && users.length === 0 && <p>No users found.</p>}

      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.email}</li>
        ))}
      </ul>

      <Snackbar
                open={openSnackbar}
                autoHideDuration={2000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              >
                <Alert
                  onClose={() => setOpenSnackbar(false)}
                  severity="success"
                  sx={{ width: "100%" }}
                >
                  Successfully Logged Out 🎉
                </Alert>
              </Snackbar>
    </div>
  );
}

export default Dashboard;
