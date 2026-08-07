/**
 * Static stand-in for a drawn document: rough shapes with a second pass at ~38%
 * opacity, the way Excalidraw's roughjs strokes read. Purely decorative.
 */
export function SketchPlaceholder() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 920 600"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 size-full"
    >
      <g
        stroke="var(--ed-sketch)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M132 148c74-4 152-3 224 1 4 44 3 88 0 130-76 4-152 4-226 1-4-44-3-88 2-132z" />
        <path
          d="M134 152c76-5 150-4 220 0 5 43 4 86 1 126-74 5-150 4-222 2-3-43-3-86 1-128"
          opacity=".38"
        />
        <path d="M566 128c72-3 148-2 216 2 5 40 4 82 1 122-74 4-148 4-220 1-3-42-3-84 3-125z" />
        <path
          d="M570 133c70-4 144-3 210 1 4 39 3 79 0 117-72 4-144 3-214 1-2-40-2-80 4-119"
          opacity=".38"
        />
        <path d="M404 216c38-4 76-6 148-4" />
        <path d="M552 212l-22-9M552 212l-21 10" />
        <path d="M300 372l72-58 74 58-72 60z" />
        <path d="M303 372l69-55 71 55-69 57z" opacity=".35" />
        <path d="M604 348c-24 14-46 34-52 58-3 13 6 24 20 24 18 0 30-16 34-32 5-19-2-38-16-48-11-8-25-8-36-1" />
        <path d="M143 480c22-16 34 12 54 4 18-7 20-30 40-30 22 0 26 28 46 28 16 0 24-18 38-24 12-5 24 0 30 10" />
        <path d="M446 432c34 20 68 30 108 26" />
        <path d="M554 458l-16-4M554 458l-8 14" transform="translate(-2 -8)" />
      </g>
      <g fill="var(--ed-sketch)" fontFamily="Caveat, cursive" fontSize="30">
        <text x="180" y="222">
          local vault
        </text>
        <text x="614" y="200">
          .excalidraw
        </text>
        <text x="322" y="382" fontSize="26">
          sync?
        </text>
      </g>
      <g
        stroke="var(--ed-sketch-alt)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M660 400c34-6 70-4 100 6 6 26 4 52-2 74-34 6-70 5-102-2-4-26-2-52 4-78z" />
      </g>
      <text
        x="686"
        y="452"
        fill="var(--ed-sketch-alt)"
        fontFamily="Caveat, cursive"
        fontSize="28"
      >
        exports
      </text>
    </svg>
  );
}
