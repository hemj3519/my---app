interface StampProps {
  text: string;
  shape?: "square" | "circle";
  rotation?: number;
  size?: "sm" | "md";
}

export default function Stamp({
  text,
  shape = "square",
  rotation = -6,
  size = "sm",
}: StampProps) {
  const isCircle = shape === "circle";

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid var(--vermilion)",
        color: "var(--vermilion)",
        fontFamily: "var(--font-gowun-batang), serif",
        fontSize: size === "sm" ? "0.6rem" : "0.75rem",
        padding: size === "sm" ? "3px 5px" : "5px 8px",
        borderRadius: isCircle ? "50%" : "2px",
        writingMode: isCircle ? undefined : "vertical-rl",
        transform: `rotate(${rotation}deg)`,
        opacity: 0.85,
        lineHeight: 1.2,
        userSelect: "none",
        pointerEvents: "none",
        flexShrink: 0,
        minWidth: isCircle ? "2.2em" : undefined,
        minHeight: isCircle ? "2.2em" : undefined,
      }}
    >
      {text}
    </span>
  );
}
