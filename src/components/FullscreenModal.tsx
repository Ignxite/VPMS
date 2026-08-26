import { css } from "@emotion/react";
import React from "react";
import { BLUR_GLASS, BG_OVERLAY } from "@/theme/color";

export function FullscreenModal({
  children,
  isOpen = false,
}: {
  children: React.ReactNode;
  isOpen?: boolean;
}) {
  return (
    <div
      css={css({
        width: "100%",
        height: "100%",
        position: "fixed",
        zIndex: 999,
        background:
          "linear-gradient(180deg, rgba(248, 250, 252, 0.88), rgba(241, 245, 249, 0.92))",
        backdropFilter: BLUR_GLASS,
        display: isOpen ? "flex" : "none",
        overflow: "hidden",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 0 9999px ${BG_OVERLAY}`,
      })}
    >
      <div
        css={css({
          padding: "1.5rem",
          paddingTop: "4.5rem",
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          height: "100%",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        })}
      >
        {children}
      </div>
    </div>
  );
}
