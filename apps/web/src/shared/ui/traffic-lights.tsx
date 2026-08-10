import { isDesktop } from "@/shared/api/fs";

const LIGHTS = ["#f0605c", "#f4bd4f", "#61c554"];

/**
 * macOS window controls — identical in both themes, hairline ring in light only.
 *
 * The desktop shell puts the *real* traffic lights here via `hiddenInset` +
 * `setWindowButtonPosition`, so it renders a spacer of the same width instead.
 * ponytail: macOS only. Windows and Linux keep the drawn lights and will need
 * explicit close/minimize/maximize RPC when either is targeted.
 */
export function TrafficLights() {
  if (isDesktop) {
    return <div className="w-[52px] flex-none" aria-hidden />;
  }

  return (
    <div className="flex flex-none items-center gap-2">
      {LIGHTS.map((color) => (
        <span
          key={color}
          className="size-3 rounded-full border border-black/[0.09] dark:border-transparent"
          style={{ background: color }}
        />
      ))}
    </div>
  );
}
