import { createTheme, type PaletteMode } from "@mui/material";

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            primary: { main: "#7C5CFC", light: "#9D82FD", dark: "#5A3DD6" },
            secondary: { main: "#22D3EE", light: "#67E8F9", dark: "#0891B2" },
            background: {
              default: "#0D0F17",
              paper: "#13161F",
            },
            surface: "#1C2032",
            divider: "rgba(255,255,255,0.07)",
            text: {
              primary: "#F0F2FF",
              secondary: "#8B92B3",
            },
            success: { main: "#34D399", light: "#6EE7B7", dark: "#059669" },
            warning: { main: "#FBBF24", light: "#FCD34D", dark: "#D97706" },
            error: { main: "#F87171", light: "#FCA5A5", dark: "#DC2626" },
          }
        : {
            primary: { main: "#6248E8", light: "#7C5CFC", dark: "#4930C0" },
            secondary: { main: "#0891B2", light: "#22D3EE", dark: "#0E7490" },
            background: {
              default: "#F4F6FD",
              paper: "#FFFFFF",
            },
            surface: "#EEF0FB",
            divider: "rgba(0,0,0,0.07)",
            text: {
              primary: "#0F1224",
              secondary: "#5A6087",
            },
            success: { main: "#059669", light: "#34D399", dark: "#047857" },
            warning: { main: "#D97706", light: "#FBBF24", dark: "#B45309" },
            error: { main: "#DC2626", light: "#F87171", dark: "#B91C1C" },
          }),
    },
    typography: {
      fontFamily: `"Inter", "Outfit", -apple-system, BlinkMacSystemFont, sans-serif`,
      h1: { fontWeight: 800, letterSpacing: "-0.03em" },
      h2: { fontWeight: 700, letterSpacing: "-0.025em" },
      h3: { fontWeight: 700, letterSpacing: "-0.02em" },
      h4: { fontWeight: 600, letterSpacing: "-0.015em" },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.01em" },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "8px 20px",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          contained: {
            "&.MuiButton-containedPrimary": {
              background:
                mode === "dark"
                  ? "linear-gradient(135deg, #7C5CFC 0%, #9D82FD 100%)"
                  : "linear-gradient(135deg, #6248E8 0%, #7C5CFC 100%)",
              "&:hover": {
                background:
                  mode === "dark"
                    ? "linear-gradient(135deg, #5A3DD6 0%, #7C5CFC 100%)"
                    : "linear-gradient(135deg, #4930C0 0%, #6248E8 100%)",
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border:
              mode === "dark"
                ? "1px solid rgba(255,255,255,0.05)"
                : "1px solid rgba(0,0,0,0.06)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6 },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: "2px 8px",
            padding: "8px 12px",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 6, fontSize: "0.75rem" },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4 },
        },
      },
    },
  });

// Augment the palette to include custom `surface` token
declare module "@mui/material/styles" {
  interface Palette {
    surface: string;
  }
  interface PaletteOptions {
    surface?: string;
  }
}
