import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";
import Login from "./Login/Login";
import Register from "./Register/Register";
import Dashboard from "./Dashboard/Dashboard";
import ProtectedRoute from "./Dashboard/ProtectedRoute";
import Profile from "./UserProfile/Profile";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100vh"
            >
              <Login />
            </Box>
          }
        />
        <Route
          path="/register"
          element={
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100vh"
            >
              <Register />
            </Box>
          }
        />
        {/* <Route
          path="/dashboard"
          element={
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100vh"
            >
              <Dashboard />
            </Box>
          }
        /> */}
        <Route
          path="/dashboard"
          element={
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100vh"
            >
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Box>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100vh"
            >
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Box>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
