import { css } from "@emotion/react";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import {
  BG_GLASS,
  BG_GLASS_HOVER,
  BORDER_COLOR,
  TEXT_PRIMARY,
  BLUR_GLASS,
  SHADOW_GLASS,
} from "@/theme/color";

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isShow?: boolean;
}

const baseButtonStyles = css({
  color: TEXT_PRIMARY,
  backgroundColor: BG_GLASS,
  backdropFilter: BLUR_GLASS,
  border: `1px solid ${BORDER_COLOR}`,
  boxShadow: SHADOW_GLASS,
  padding: "0.8rem 1.05rem",
  borderRadius: "999px",
  fontWeight: "600",
  fontSize: "13px",
  cursor: "pointer",
  letterSpacing: "0.01em",
  transition: "transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease",
  alignItems: "center",
  gap: "0.5rem",
  minHeight: "46px",
  ":hover": {
    backgroundColor: BG_GLASS_HOVER,
    transform: "translateY(-1px)",
    boxShadow: "0 18px 38px rgba(15, 23, 42, 0.18)",
  },
  ":disabled": {
    backgroundColor: BG_GLASS_HOVER,
    cursor: "not-allowed",
    opacity: 0.7,
    transform: "none",
    boxShadow: "none",
  },
});

export function NextButton(props: ButtonProps) {
  return (
    <button
      css={[
        baseButtonStyles,
        css({ display: props.isShow ? "inline-flex" : "none" }),
      ]}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function PrevButton(props: ButtonProps) {
  return (
    <button
      css={[
        baseButtonStyles,
        css({ display: props.isShow ? "inline-flex" : "none" }),
      ]}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function Button(props: ButtonProps) {
  return (
    <button
      css={[
        baseButtonStyles,
        css({ display: props.isShow ? "inline-flex" : "none" }),
      ]}
      {...props}
    >
      {props.children}
    </button>
  );
}
