import { useCarStore } from "@/state/carStore";
import {
  ACCENT_BLUE,
  BORDER_COLOR,
  BLUR_GLASS,
  SHADOW_GLASS,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from "@/theme/color";
import { css } from "@emotion/react";
import { DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import {
  CarFront,
  Github,
  Layers3,
  Sparkles,
  SquareDashedMousePointer,
  Video,
} from "lucide-react";

const TOP_PANEL_HEIGHT = "3rem";

const breakpoints = [768];
const mq = breakpoints.map((bp) => `@media (max-width: ${bp}px)`);

interface NavButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isShow?: boolean;
}

export function TopNav({ step }: { step: number }) {
  const setThirdMode = useCarStore((state) => state.setThirdMode);
  const thirdMode = useCarStore((state) => state.thirdMode);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  return (
    <div
      css={css({
        display: "flex",
        transition: "all 0.3s ease",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        minHeight: TOP_PANEL_HEIGHT,
        padding: "0.75rem 1rem",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(247,249,253,0.78))",
        backdropFilter: BLUR_GLASS,
        borderBottom: `1px solid ${BORDER_COLOR}`,
        boxShadow: SHADOW_GLASS,
        zIndex: 9999,
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
      })}
    >
      <div
        css={css({
          alignItems: "center",
          flexDirection: "row",
          display: "flex",
          gap: "0.85rem",
          minWidth: 0,
        })}
      >
        <div
          css={css({
            width: "2.35rem",
            height: "2.35rem",
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(20,184,166,0.14))",
            border: `1px solid ${BORDER_COLOR}`,
            color: ACCENT_BLUE,
            flexShrink: 0,
          })}
        >
          <Layers3 size={18} />
        </div>

        <div css={css({ minWidth: 0 })}>
          <div
            css={css({
              fontFamily: '"Space Grotesk", "Manrope", sans-serif',
              fontSize: "15px",
              fontWeight: 700,
              color: TEXT_PRIMARY,
              lineHeight: 1.1,
            })}
          >
            VPMS
          </div>
          <div
            css={css({
              fontSize: "11px",
              color: TEXT_SECONDARY,
              marginTop: "0.15rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            })}
          >
            Select, process, and export 3D city data
          </div>
        </div>

        <div
          css={css({
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginLeft: "0.5rem",
            [mq[0]]: { display: "none" },
          })}
        >
          {[
            { label: "Select", icon: Sparkles },
            { label: "Process", icon: Video },
            { label: "View", icon: SquareDashedMousePointer },
          ].map((item, i) => (
            <div
              key={item.label}
              css={css({
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.45rem 0.7rem",
                borderRadius: "999px",
                backgroundColor:
                  i <= step ? "rgba(37, 99, 235, 0.08)" : "transparent",
              })}
            >
              <div
                css={css({
                  width: "1.15rem",
                  height: "1.15rem",
                  borderRadius: "999px",
                  backgroundColor:
                    i <= step ? ACCENT_BLUE : "rgba(148, 163, 184, 0.28)",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  boxShadow:
                    i === step ? `0 0 0 4px rgba(37,99,235,0.12)` : "none",
                })}
              />
              <span
                css={css({
                  fontSize: "12px",
                  fontWeight: i === step ? "700" : "500",
                  color: i === step ? TEXT_PRIMARY : TEXT_SECONDARY,
                })}
              >
                {item.label}
              </span>
              {i < 2 && (
                <div
                  css={css({
                    width: "14px",
                    height: "1px",
                    backgroundColor:
                      i < step
                        ? "rgba(37, 99, 235, 0.35)"
                        : "rgba(15, 23, 42, 0.08)",
                  })}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        css={css({
          display: "flex",
          flexDirection: "row",
          gap: "0.55rem",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        })}
      >
        <NavButton
          isShow={true}
          onClick={() => window.open("https://github.com/Invariants0/VPMS")}
        >
          <Github size={14} />
          GitHub
        </NavButton>

        {!isMobile && (
          <>
            {thirdMode ? (
              <NavButton
                isShow={step === 2}
                onClick={() => setThirdMode(false)}
              >
                <CarFront size={14} />
                Exit Car
              </NavButton>
            ) : (
              <NavButton
                isShow={step === 2}
                onClick={() => setThirdMode(true)}
              >
                <CarFront size={14} />
                Car Mode
              </NavButton>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function NavButton(props: NavButtonProps) {
  return (
    <button
      css={css({
        color: TEXT_PRIMARY,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,247,252,0.88))",
        backdropFilter: BLUR_GLASS,
        border: `1px solid ${BORDER_COLOR}`,
        padding: "0.68rem 0.95rem",
        borderRadius: "999px",
        fontWeight: "700",
        fontSize: "12px",
        display: props.isShow ? "inline-flex" : "none",
        cursor: "pointer",
        transition:
          "transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease",
        alignItems: "center",
        gap: "0.45rem",
        boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
        ":hover": {
          backgroundColor: "rgba(255,255,255,0.98)",
          transform: "translateY(-1px)",
          boxShadow: "0 16px 30px rgba(15, 23, 42, 0.12)",
        },
      })}
      {...props}
    >
      {props.children}
    </button>
  );
}
