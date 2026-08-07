import { useToolStore, zoomIn, zoomOut } from "../model/tool-store";

const step = "rounded-[5px] px-[7px] py-[3px] hover:bg-ed-soft-hover";

export function ZoomControl() {
  const zoom = useToolStore((state) => state.zoom);
  return (
    <div className="absolute bottom-4 left-4 z-3 flex items-center gap-px rounded-[8px] border border-ed-edge-strong bg-ed-surface p-1 text-[11.5px] text-ed-muted shadow-[0_2px_8px_rgb(0_0_0/0.05)]">
      <button type="button" aria-label="Zoom out" onClick={zoomOut} className={step}>
        −
      </button>
      <span className="min-w-[38px] px-1.5 py-[3px] text-center tabular-nums">{zoom}%</span>
      <button type="button" aria-label="Zoom in" onClick={zoomIn} className={step}>
        +
      </button>
    </div>
  );
}
