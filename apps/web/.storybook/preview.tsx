import type { Preview } from "@storybook/react-vite";

import { ThemeProvider } from "../src/components/theme-provider";

import "../src/index.css";

const STORAGE_KEY = "excalidesk-theme";

/** The toolbar theme switch drives the same next-themes setup the app uses. */
const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { expanded: true },
  },
  globalTypes: {
    theme: {
      description: "Excalidesk theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      const theme = String(context.globals.theme ?? "light");
      // Seed before mounting so the settings menu shows the matching check.
      localStorage.setItem(STORAGE_KEY, theme);
      document.body.style.background = theme === "dark" ? "#1a1a1a" : "#e8e7e3";
      return (
        <ThemeProvider
          key={theme}
          attribute="class"
          defaultTheme={theme}
          storageKey={STORAGE_KEY}
          enableSystem
          disableTransitionOnChange
        >
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
