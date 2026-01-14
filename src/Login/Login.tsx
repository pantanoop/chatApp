import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addCurrentUser } from "../redux/authenticateSlice";

import { auth, googleProvider, db } from "../config/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  TextField,
  Button,
  Box,
  Typography,
  Link,
  Card,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const LoginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

const DEFAULT_AVATAR =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    console.log("Login attempt:", data);

    if (!data.email || !data.password) {
      console.warn("Email or password missing");
      setError("email", { type: "manual", message: "Email is required" });
      setError("password", { type: "manual", message: "Password is required" });
      return;
    }

    try {
      console.log("Calling Firebase Auth with:", {
        email: data.email,
        password: data.password,
      });

      const res = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      console.log("Firebase Auth response:", res);
      const user = res.user;

      if (!user.email) {
        console.error("User email missing in Auth response", user);
        setError("email", { type: "manual", message: "User email not found" });
        return;
      }

      console.log("Fetching Firestore profile for UID:", user.uid);
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      console.log("Firestore snapshot:", snap);

      if (!snap.exists()) {
        setError("email", {
          type: "manual",
          message: "User profile not found",
        });
        return;
      }

      const userData = snap.data();
      console.log("User data from Firestore:", userData);

      dispatch(
        addCurrentUser({
          uid: user.uid,
          email: user.email,
          username: userData.username,
          photoURL: userData.photoURL,
        })
      );

      setOpenSnackbar(true);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: any) {
      console.error("Firebase login error:", error);

      if (error.code === "auth/user-not-found") {
        setError("email", { type: "manual", message: "Email not registered" });
      } else if (error.code === "auth/wrong-password") {
        setError("password", { type: "manual", message: "Incorrect password" });
      } else if (error.code === "auth/invalid-email") {
        setError("email", { type: "manual", message: "Invalid email format" });
      } else {
        setError("email", { type: "manual", message: "Login failed" });
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          username: user.displayName || "User",
          photoURL: user.photoURL || DEFAULT_AVATAR,
          createdAt: serverTimestamp(),
        });
      }

      const userData = snap.exists()
        ? snap.data()
        : {
            username: user.displayName || "User",
            photoURL: user.photoURL || DEFAULT_AVATAR,
          };

      dispatch(
        addCurrentUser({
          uid: user.uid,
          email: user.email!,
          username: userData.username,
          photoURL: userData.photoURL,
        })
      );

      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  return (
    <>
      <Card variant="outlined" sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" textAlign="center" mb={2}>
          Login
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(handleLogin)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type={showPassword ? "text" : "password"}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)}>
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Button type="submit" variant="contained" fullWidth>
            Login
          </Button>

          <Button onClick={signInWithGoogle} variant="outlined" fullWidth>
            Sign in with Google
          </Button>

          <Typography align="center">
            New user?{" "}
            <Link component={RouterLink} to="/register">
              Register
            </Link>
          </Typography>
        </Box>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success">User successfully registered 🎉</Alert>
      </Snackbar>
    </>
  );
}

export default Login;
