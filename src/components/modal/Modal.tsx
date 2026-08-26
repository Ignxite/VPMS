import React, { useEffect, useState } from "react";
import { css, keyframes } from "@emotion/react";
import {
  BG_OVERLAY,
  BORDER_COLOR,
  SHADOW_GLASS,
  BLUR_GLASS,
} from "@/theme/color";

interface ModalProps {
  children?: React.ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
  isScroll?: boolean;
}

const fadeInBackground = keyframes`
  from { backdrop-filter: brightness(100%); opacity: 0; }
  to   { backdrop-filter: brightness(70%); opacity: 1; }
`;

const fadeOutBackground = keyframes`
  from { backdrop-filter: brightness(70%); opacity: 1; }
  to   { backdrop-filter: brightness(100%); opacity: 0; }
`;

const fadeIn = keyframes`
  from { transform: translateY(-10px); opacity: 0.4; }
  to   { transform: translateY(0px);   opacity: 1; }
`;

const fadeOut = keyframes`
  from { transform: translateY(0px);   opacity: 1; }
  to   { transform: translateY(-10px); opacity: 0; }
`;

function Modal({ children, onClose, isOpen, isScroll = false }: ModalProps) {
  const [open, setOpen] = useState(false);
  const [contentAnim, setContentAnim] = useState(
    `${fadeIn} 0.3s forwards`
  );
  const [bgAnim, setBgAnim] = useState(
    `${fadeInBackground} 0.3s forwards`
  );

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id !== "modal") return;
    setContentAnim(`${fadeOut} 0.3s forwards`);
    setBgAnim(`${fadeOutBackground} 0.3s forwards`);
    setTimeout(() => {
      onClose?.();
      setOpen(false);
    }, 280);
  };

  useEffect(() => {
    if (isOpen) {
      setOpen(true);
      setContentAnim(`${fadeIn} 0.3s forwards`);
      setBgAnim(`${fadeInBackground} 0.3s forwards`);
    } else if (open) {
      setContentAnim(`${fadeOut} 0.3s forwards`);
      setBgAnim(`${fadeOutBackground} 0.3s forwards`);
      setTimeout(() => {
        onClose?.();
        setOpen(false);
      }, 280);
    }
  }, [isOpen]);

  return (
    <div
      onClick={handleClose}
      id="modal"
      css={css({
        display: open ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        background: BG_OVERLAY,
        backdropFilter: "blur(10px) brightness(80%)",
        animation: bgAnim,
        scrollbarWidth: "none",
        zIndex: 3000,
        transition: "0.1s",
        padding: "1rem",
      })}
    >
      <div
        css={css({
          width: "100%",
          maxWidth: "560px",
          maxHeight: isScroll ? "70vh" : "min(70vh, 720px)",
          margin: "auto",
          padding: "1.35rem",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.92))",
          borderRadius: "24px",
          border: `1px solid ${BORDER_COLOR}`,
          backdropFilter: BLUR_GLASS,
          boxShadow: SHADOW_GLASS,
          overflow: isScroll ? "auto" : "hidden",
          wordBreak: "break-word",
          position: "relative",
          animation: contentAnim,
          "::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "24px",
            padding: "1px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0))",
            pointerEvents: "none",
          },
        })}
      >
        {children}
      </div>
    </div>
  );
}

export { Modal };
