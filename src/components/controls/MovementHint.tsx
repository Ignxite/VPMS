import { css } from "@emotion/react";
import { useCarStore } from "@/state/carStore";

export function MovementHint({ isVisible }: { isVisible: boolean }) {
  const thirdMode = useCarStore((state) => state.thirdMode);

  if (!isVisible || !thirdMode) return null;

  return (
    <div
      css={css({
        position: "fixed",
        right: "1.5rem",
        bottom: "6.5rem",
        zIndex: 9999,
        maxWidth: "min(20rem, calc(100vw - 2rem))",
        pointerEvents: "none",
        userSelect: "none",
        padding: "0.8rem 0.95rem",
        borderRadius: "14px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,249,253,0.82))",
        border: "1px solid rgba(17,24,39,0.08)",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.14)",
        color: "#111827",
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: 1.55,
      })}
    >
      Use W/A/S/D or arrow keys to drive. Move the mouse to steer. Press Esc
      to exit car mode.
    </div>
  );
}
