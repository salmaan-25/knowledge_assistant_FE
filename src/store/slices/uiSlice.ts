import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { storage } from "../../lib/storage";

interface UiState {
  themeMode: "light" | "dark";
  sidebarOpen: boolean;
  globalLoading: boolean;
}

const initialState: UiState = {
  themeMode: storage.getTheme(),
  sidebarOpen: true,
  globalLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === "dark" ? "light" : "dark";
      storage.setTheme(state.themeMode);
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.themeMode = action.payload;
      storage.setTheme(action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setGlobalLoading,
} = uiSlice.actions;
export default uiSlice.reducer;
