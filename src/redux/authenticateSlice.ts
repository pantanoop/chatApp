import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


export type User = {
  email: string;
  password: string;
  confirmpassword?:string;
};


export type AuthState = {
  users: User[];
  currentUser: User | null; 
};


export const initialState: AuthState = {
  users: [
    { email: 'abc@gmail.com', password: '123' },
    { email: 'xyz@gmail.com', password: 'p123' },
    { email: 'y@gmail.com', password: '123' },
  ],
  currentUser: null, 
};

const authenticateSlice = createSlice({
  name: 'authenticate',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    addCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    removeCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const { addUser, addCurrentUser, removeCurrentUser } = authenticateSlice.actions;

export default authenticateSlice.reducer;