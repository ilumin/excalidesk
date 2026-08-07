import type { Meta, StoryObj } from "@storybook/react-vite";

import { useTabStore } from "@/entities/tab";
import { readVault, useVaultStore } from "@/entities/vault";
import { useSidebarStore } from "@/features/toggle-sidebar";
import { WindowFrame } from "@/shared/ui";
import { useTreeStore } from "@/widgets/file-tree-sidebar";

import { WorkspacePage } from "./workspace-page";

const ROOT = "/Users/me/Sketches";

/** The sample session from the design reference (1a / 1b / 1c). */
async function seed(collapsed: boolean) {
  useVaultStore.setState({ ...(await readVault(ROOT)), booted: true });
  useTreeStore.setState({
    expanded: [`${ROOT}/Work`, `${ROOT}/Work/Diagrams`],
    activeFolderPath: `${ROOT}/Work`,
  });
  useTabStore.setState({
    tabs: [
      {
        id: `${ROOT}/Work/Diagrams/system-map.excalidraw`,
        filePath: `${ROOT}/Work/Diagrams/system-map.excalidraw`,
        title: "system-map",
        isDirty: false,
      },
      {
        id: `${ROOT}/quick-note.excalidraw`,
        filePath: `${ROOT}/quick-note.excalidraw`,
        title: "quick-note",
        isDirty: true,
      },
      {
        id: `${ROOT}/Work/Diagrams/onboarding-flow.excalidraw`,
        filePath: `${ROOT}/Work/Diagrams/onboarding-flow.excalidraw`,
        title: "onboarding-flow",
        isDirty: false,
      },
    ],
    activeTabId: `${ROOT}/Work/Diagrams/system-map.excalidraw`,
  });
  useSidebarStore.setState({ collapsed });
}

const meta = {
  title: "Pages/Workspace",
  component: WorkspacePage,
  decorators: [
    (Story) => (
      <WindowFrame>
        <Story />
      </WindowFrame>
    ),
  ],
} satisfies Meta<typeof WorkspacePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
  globals: { theme: "light" },
  beforeEach: () => seed(false),
};

export const Dark: Story = {
  globals: { theme: "dark" },
  beforeEach: () => seed(false),
};

export const SidebarCollapsed: Story = {
  globals: { theme: "light" },
  beforeEach: () => seed(true),
};
