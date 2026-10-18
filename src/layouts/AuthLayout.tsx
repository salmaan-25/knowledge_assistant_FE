import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(ellipse at 60% 40%, rgba(124,92,252,0.15) 0%, rgba(34,211,238,0.06) 50%, transparent 70%), #0D0F17"
            : "radial-gradient(ellipse at 60% 40%, rgba(98,72,232,0.10) 0%, rgba(8,145,178,0.05) 50%, transparent 70%), #F4F6FD",
        px: 2,
      }}
    >
      <Outlet />
    </Box>
  );
}
