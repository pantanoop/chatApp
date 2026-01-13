import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addUser, addCurrentUser } from "../redux/authenticateSlice";
import type { User } from "../redux/authenticateSlice";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";

import {
  TextField,
  Button,
  Box,
  Typography,
  Link,
  Card,
  Snackbar,
  Alert,
} from "@mui/material";
import { RootState } from "../redux/store";

const RegistrationSchema = z.object({
  email: z.email("Must be a valid email"),
  password: z
    .string()
    .regex(/^\S*$/, "Field cannot contain spaces.")
    .min(1, "Password must be at least 1 characters long"),
  confirmpassword: z.string().min(1, "Password is required"),
});

type RegistrationSchemaType = z.infer<typeof RegistrationSchema>;

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useSelector((state: RootState) => state.authenticator.users);
  console.log({ users });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowPassword(!showConfirmPassword);
    const handleShowDownPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegistrationSchemaType>({
    resolver: zodResolver(RegistrationSchema),
  });

  console.log("hhe", { errors });

  const handleRegister = async (data: User) => {
    const existingUser = users?.some((u: User) => u.email === data.email);

    if (existingUser) {
      setError("email", {
        type: "manual",
        message: "Email already registered",
      });
      return;
    }
    if (data.password === data.confirmpassword) {
      try {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        const docRef = await addDoc(collection(db, "users"), {
          email: data.email,
          password: data.password,
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (error) {
        console.log(error);
      }
      dispatch(
        addCurrentUser({
          email: data.email,
          password: data.password,
        })
      );
    } else {
      setError("confirmpassword", {
        type: "manual",
        message: "Confirm password is different from password you entered",
      });
      return;
    }

    setOpenSnackbar(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
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
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          {/* <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="password"
                label="Password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          /> */}
          {/* <Controller
            name="confirmpassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="password"
                label="Confirm Password"
                fullWidth
                error={!!errors.confirmpassword}
                helperText={errors.confirmpassword?.message}
              />
            )}
          /> */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
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
                label="confirm password"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                error={!!errors.confirmpassword}
                helperText={errors?.confirmpassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleShowDownPassword}
                      >
                        {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
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

        <Typography variant="body2" align="center" mt={2}>
          Existing User?{" "}
          <Link component={RouterLink} to="/" underline="hover">
            Login
          </Link>
        </Typography>
      </Card>

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
          User successfully registered 🎉
        </Alert>
      </Snackbar>
    </>
  );
}

export default Register;
