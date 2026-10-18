import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile } from "../../types/api";
import { storage } from "../../lib/storage";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: storage.getUser() as UserProfile | null,
  token: storage.getToken(),
  isAuthenticated: !!storage.getToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user?: UserProfile }>
    ) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      storage.setToken(action.payload.token);
      if (action.payload.user) {
        state.user = action.payload.user;
        storage.setUser(action.payload.user);
      }
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      storage.setUser(action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      storage.clearAll();
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
