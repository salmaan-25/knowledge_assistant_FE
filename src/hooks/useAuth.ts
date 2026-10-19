import { useAppSelector, useAppDispatch } from "./useAppStore";
import { logout, setCredentials, setUser } from "../store/slices/authSlice";
import { api } from "../store/api/apiSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(api.util.resetApiState());
  };

  return {
    user,
    token,
    isAuthenticated,
    logout: handleLogout,
    setCredentials: (token: string) => dispatch(setCredentials({ token })),
    setUser: (u: Parameters<typeof setUser>[0]) => dispatch(setUser(u)),
  };
}
