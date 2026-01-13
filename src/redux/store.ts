import { configureStore } from '@reduxjs/toolkit';
import authenticateReducer from './authenticateSlice';


export const store = configureStore({
  reducer: {
    authenticator: authenticateReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch