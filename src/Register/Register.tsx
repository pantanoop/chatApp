import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addCurrentUser } from "../redux/authenticateSlice";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import {
  TextField,
  Button,
  Box,
  Typography,
  Link,
  Card,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&color=fff&name=";

const RegistrationSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^\S+$/, "Username cannot contain spaces"),
    email: z.string().email("Must be a valid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/^\S*$/, "Password cannot contain spaces"),
    confirmpassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmpassword, {
    path: ["confirmpassword"],
    message: "Passwords do not match",
  });

type RegistrationSchemaType = z.infer<typeof RegistrationSchema>;

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegistrationSchemaType>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmpassword: "",
    },
  });

  const handleRegister = async (data: RegistrationSchemaType) => {
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = res.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: data.email,
        username: data.username,
        photoURL: `${DEFAULT_AVATAR}${data.username}`,
        provider: "password",
        createdAt: serverTimestamp(),
      });

      dispatch(
        addCurrentUser({
          uid: user.uid,
          email: data.email,
          username: data.username,
          photoURL: `${DEFAULT_AVATAR}${data.username}`,
        })
      );

      setOpenSnackbar(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (error: any) {
      console.log({ error });
      if (error.code === "auth/email-already-in-use") {
        setError("email", {
          type: "manual",
          message: "Email already registered",
        });
      } else {
        setError("email", {
          type: "manual",
          message: "Registration failed",
        });
      }
    }
  };

  return (
    <>
      <Card variant="outlined" sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" textAlign="center" mb={2}>
          Register
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(handleRegister)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Username"
                error={!!errors.username}
                helperText={errors.username?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
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
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="confirmpassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                error={!!errors.confirmpassword}
                helperText={errors.confirmpassword?.message}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {showConfirmPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Button variant="contained" type="submit" fullWidth>
            Register
          </Button>
        </Box>

        <Typography align="center" mt={2}>
          Existing user?{" "}
          <Link component={RouterLink} to="/">
            Login
          </Link>
        </Typography>
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

export default Register;
