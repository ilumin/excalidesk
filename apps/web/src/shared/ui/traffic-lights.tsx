const LIGHTS = ["#f0605c", "#f4bd4f", "#61c554"];

/** macOS window controls — identical in both themes, hairline ring in light only. */
export function TrafficLights() {
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
