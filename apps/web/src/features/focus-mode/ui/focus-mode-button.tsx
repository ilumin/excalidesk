import { Maximize2 } from "lucide-react";

import { IconButton } from "@/shared/ui";

import { useFocusStore } from "../model/focus-store";

export function FocusModeButton() {
  const toggle = useFocusStore((state) => state.toggle);
  return (
    <IconButton onClick={toggle} aria-label="Enter focus mode" title="Focus mode">
      <Maximize2 size={14} strokeWidth={1.5} />
    </IconButton>
  );
}
