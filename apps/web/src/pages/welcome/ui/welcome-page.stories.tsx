import type { Meta, StoryObj } from "@storybook/react-vite";

import { useVaultStore } from "@/entities/vault";
import { WindowFrame } from "@/shared/ui";

import { WelcomePage } from "./welcome-page";

const meta = {
  title: "Pages/Welcome",
  component: WelcomePage,
  decorators: [
    (Story) => (
      <WindowFrame>
        <Story />
      </WindowFrame>
    ),
  ],
  beforeEach() {
    useVaultStore.setState({ status: "none", path: null, tree: [], booted: true });
  },
} satisfies Meta<typeof WelcomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = { globals: { theme: "light" } };
export const Dark: Story = { globals: { theme: "dark" } };
