import type { Meta, StoryObj } from "@storybook/react-vite";

import { TreeRow } from "./tree-row";

const meta = {
  title: "Entities/TreeRow",
  component: TreeRow,
  decorators: [
    (Story) => (
      <div className="ed-app w-[260px] bg-ed-chrome px-2 py-3">
        <Story />
      </div>
    ),
  ],
  args: { name: "Ideas", kind: "directory", depth: 0 },
} satisfies Meta<typeof TreeRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Folder: Story = {};
export const FolderExpandedActive: Story = {
  args: { name: "Work", expanded: true, active: true },
};
export const SelectedFile: Story = {
  args: { name: "system-map.excalidraw", kind: "file", depth: 2, selected: true },
};
export const DirtyFile: Story = {
  args: { name: "quick-note.excalidraw", kind: "file", depth: 0, dirty: true },
};
