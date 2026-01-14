import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = {
  uid: string;
  email: string | null;
  username: string|null;
  photoURL?: string;
  isOnline?:boolean;
};

export type AuthState = {
  currentUser: User | null;
};

const initialState: AuthState = {
  currentUser: null,
};

const authenticateSlice = createSlice({
  name: "authenticate",
  initialState,
  reducers: {
    addCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    removeCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const { addCurrentUser, removeCurrentUser } = authenticateSlice.actions;

export default authenticateSlice.reducer;
