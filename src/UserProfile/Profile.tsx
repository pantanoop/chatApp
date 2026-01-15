import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().max(200, "Bio must be under 200 characters").optional(),
  photoURL: z.url("Enter a valid image URL"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const currentUser = useSelector(
    (state: RootState) => state.authenticator.currentUser
  );

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      bio: "",
      photoURL: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        reset({
          username: data.username || "",
          bio: data.bio || "",
          photoURL: data.photoURL || "",
        });
      }
    };
    fetchProfile();
  }, [currentUser, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser) return;

    const q = query(
      collection(db, "users"),
      where("username", "==", data.username)
    );
    const snap = await getDocs(q);
    const exists = snap.docs.some((doc) => doc.id !== currentUser.uid);

    if (exists) {
      setError("username", {
        type: "manual",
        message: "Username already in use",
      });
      return;
    }

    await updateDoc(doc(db, "users", currentUser.uid), {
      username: data.username,
      bio: data.bio || "",
      photoURL: data.photoURL || "",
    });

    setSnackbarOpen(true);
    setTimeout(() => {
      navigate("/dashboard");
    });
  };

  return (
    <div className="profile-container">
      <Typography variant="h5" mb={2}>
        Edit Profile
      </Typography>

      <Avatar src={watch("photoURL")} sx={{ width: 80, height: 80, mb: 2 }} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          //   label="Username"
          placeholder="user name"
          fullWidth
          sx={{ mb: 2 }}
          {...register("username")}
          error={!!errors.username}
          helperText={errors.username?.message as string | undefined}
        />

        <TextField
          fullWidth
          value={currentUser?.email || ""}
          disabled
          sx={{ mb: 2 }}
        />

        <TextField
          //   label="Bio"
          placeholder="Bio"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
          {...register("bio")}
          error={!!errors.bio}
          helperText={errors.bio?.message as string | undefined}
        />

        <TextField
          //   label="Profile Photo URL"
          placeholder="profile pic"
          fullWidth
          sx={{ mb: 3 }}
          {...register("photoURL")}
          error={!!errors.photoURL}
          helperText={errors.photoURL?.message as string | undefined}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
        >
          Save Changes
        </Button>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success">Profile updated successfully 🎉</Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;
