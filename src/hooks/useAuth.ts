import { useAppSelector, useAppDispatch } from "./useAppStore";
import { logout, setCredentials, setUser } from "../store/slices/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((s) => s.auth);

  const handleLogout = () => dispatch(logout());

  return {
    user,
    token,
    isAuthenticated,
    logout: handleLogout,
    setCredentials: (token: string) => dispatch(setCredentials({ token })),
    setUser: (u: Parameters<typeof setUser>[0]) => dispatch(setUser(u)),
  };
}
