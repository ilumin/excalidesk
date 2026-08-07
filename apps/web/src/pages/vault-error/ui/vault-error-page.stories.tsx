import type { Meta, StoryObj } from "@storybook/react-vite";

import { useVaultStore } from "@/entities/vault";
import { WindowFrame } from "@/shared/ui";

import { VaultErrorPage } from "./vault-error-page";

const DAY = 86_400_000;

const meta = {
  title: "Pages/Vault error",
  component: VaultErrorPage,
  decorators: [
    (Story) => (
      <WindowFrame>
        <Story />
      </WindowFrame>
    ),
  ],
  beforeEach() {
    useVaultStore.setState({
      status: "missing",
      path: "/Users/me/Documents/Sketches",
      name: "Sketches",
      tree: [],
      booted: true,
      recentFolders: [
        {
          path: "/Users/me/Documents/Sketches",
          name: "Sketches",
          lastOpenedAt: Date.now(),
          missing: true,
        },
        { path: "/Users/me/Work/Work diagrams", name: "Work diagrams", lastOpenedAt: Date.now() - 3 * DAY },
        { path: "/Users/me/Desktop/Scratch", name: "Scratch", lastOpenedAt: Date.now() - 14 * DAY },
      ],
    });
  },
} satisfies Meta<typeof VaultErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = { globals: { theme: "light" } };
export const Dark: Story = { globals: { theme: "dark" } };
