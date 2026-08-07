import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilePlus2, FolderOpen, FolderPlus } from "lucide-react";

import { ActionRow } from "./action-row";

const meta = {
  title: "Shared/ActionRow",
  component: ActionRow,
  decorators: [
    (Story) => (
      <div className="ed-app w-[520px] bg-ed-canvas p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    icon: FolderOpen,
    title: "Open folder",
    subtitle: "Use an existing folder of sketches",
  },
} satisfies Meta<typeof ActionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { primary: true } };

export const Flat: Story = {
  args: { icon: FolderPlus, title: "Create new folder", subtitle: "Start a fresh sketch folder" },
};

export const Group: Story = {
  render: (args) => (
    <div className="flex flex-col gap-px">
      <ActionRow {...args} primary />
      <ActionRow icon={FolderPlus} title="Create new folder" subtitle="Start a fresh sketch folder" />
      <ActionRow
        icon={FilePlus2}
        title="Open single file"
        subtitle="Edit one .excalidraw file without a folder"
      />
    </div>
  ),
};
