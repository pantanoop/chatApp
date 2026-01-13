import  { useState ,useEffect} from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addCurrentUser } from "../redux/authenticateSlice";
import type { User } from "../redux/authenticateSlice"
import { RootState } from "../redux/store";
import { auth ,googleProvider,db} from '../config/firebase';
import { signInWithEmailAndPassword ,signInWithPopup} from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";

import {  getDocs, DocumentData } from 'firebase/firestore';


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

interface UserData {
  email: string;
}

const LoginSchema = z.object({
  email: z.email("must be a valid email"),
  password: z
  .string()
  .min(1, "Password must be at least 1 characters long")
  .regex(/^\S*$/, "Password cannot contain spaces"),
});

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const users = useSelector((state:RootState) => state.authenticator.users);
  const [openSnackbar, setOpenSnackbar] = useState(false);
      const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);


    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
 
  console.log("users:", users);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });


useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);
        const usersList = usersSnapshot.docs.map(
          (doc) => doc.data() as UserData
        );
        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers().catch(console.error);
  }, []);


  const signInWithGoogle = async () => {
  try {
    const existingUser = users.find((u)=>u.email)
    if(existingUser){
    const res =await signInWithPopup(auth, googleProvider);
      const docRef = await addDoc(collection(db, 'users'), {
             email:res?.user.email ,
             password:""        
          });
      console.log('Document written with ID: ', docRef.id);
     console.log("auth",res?.user.email) ;}
     setOpenSnackbar(true);
         setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
  } catch (error) {
    console.error('Error signing in with Google', error);
  }
};



  const handleLogin = async(data:User) => {

    try {
      const res = await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log({res});
      setOpenSnackbar(true);
        setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
    } catch (error) {
      console.error(error);
    }
    // if (!user) {
    //   setError("email", {
    //     type: "manual",
    //     message: "Invalid email or password",
    //   });
    //   setError("password", {
    //     type: "manual",
    //     message: "Invalid email or password",
    //   });
    //   return;
    // }

     dispatch(addCurrentUser({
          email: data.email,
          password: data.password,
        }))
  };

  return (
    <Card variant="outlined" sx={{ p: 4, minWidth: 350 }}>
      <Typography variant="h5" textAlign="center" mb={2}>
        Login
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(handleLogin)}
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
              error={!!errors?.email}
              helperText={errors?.email?.message}
            />
          )}
        />

        {/* <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="password"
              type="password"
              fullWidth
              error={!!errors?.password}
              helperText={errors?.password?.message}
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

        <Button type="submit" variant="contained" fullWidth>
          Login
        </Button>
        {/* <FcGoogle size={40} style={{ margin: '10px' }} /> */}

        <Button onClick={signInWithGoogle} variant="contained" fullWidth>
          Sign in with Google
        </Button>
        

        <Typography variant="body2" align="center">
          New User?{" "}
          <Link component={RouterLink} to="/register" underline="hover">
            Register
          </Link>
        </Typography>
        <Typography variant="body2" align="center">
          skip for now?{" "}
          <Link component={RouterLink} to="/dashboard" underline="hover">
            Explore Site
          </Link>
        </Typography>

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
            Successfully Login 🎉
          </Alert>
        </Snackbar>
      </Box>
    </Card>
  );
}

export default Login;