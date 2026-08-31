import { css, keyframes } from "@emotion/react";
import { Building2, Layers, Ruler } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ACCENT_BLUE,
  ACCENT_TEAL,
  BORDER_COLOR,
  SHADOW_GLASS,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from "@/theme/color";

export interface Building {
  id: number;
  tags: { [key: string]: string | undefined };
  geometry?: { lat: number; lng: number }[];
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.08); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const LOADING_PHRASES = [
  "Fetching parcel data...",
  "Accessing building records...",
  "Triangulating coordinates...",
  "Cross-referencing ULPIN records...",
  "Validating floor topology...",
  "Rendering vertical property data...",
];

export function BuildingHeights({
  buildings,
  loading,
}: {
  buildings: Building[];
  loading: boolean;
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      setPhraseIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div
      css={css({
        position: "relative",
        paddingTop: "0.25rem",
      })}
    >
      {loading && (
        <div
          css={css({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.5rem 1.5rem",
            margin: "0.5rem 0",
            borderRadius: "20px",
            border: `1px solid ${BORDER_COLOR}`,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(246,248,252,0.85))",
            backdropFilter: "blur(18px)",
            boxShadow: SHADOW_GLASS,
            textAlign: "center",
            gap: "1.25rem",
          })}
        >
          {/* Subtle spinning & pulsing indicator */}
          <div
            css={css({
              position: "relative",
              width: "56px",
              height: "56px",
              display: "grid",
              placeItems: "center",
            })}
          >
            {/* Outer subtle spinning ring */}
            <div
              css={css({
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid rgba(37, 99, 235, 0.12)",
                borderTopColor: ACCENT_BLUE,
                borderRightColor: ACCENT_TEAL,
                animation: `${spin} 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite`,
              })}
            />
            {/* Inner pulsing core */}
            <div
              css={css({
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(20,184,166,0.15))",
                display: "grid",
                placeItems: "center",
                color: ACCENT_BLUE,
                animation: `${pulse} 2s ease-in-out infinite`,
                boxShadow: "0 0 16px rgba(37, 99, 235, 0.15)",
              })}
            >
              <Layers size={18} />
            </div>
          </div>

          {/* Rotating status phrase & progress hint */}
          <div
            css={css({
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            })}
          >
            <div
              key={phraseIndex}
              css={css({
                fontSize: "14px",
                fontWeight: 600,
                color: TEXT_PRIMARY,
                letterSpacing: "-0.01em",
                transition: "opacity 0.25s ease",
              })}
            >
              {LOADING_PHRASES[phraseIndex]}
            </div>
            <div
              css={css({
                fontSize: "12px",
                color: TEXT_SECONDARY,
                fontWeight: 500,
              })}
            >
              Processing spatial topology & building models
            </div>
          </div>

          {/* Shimmer line bar */}
          <div
            css={css({
              width: "140px",
              height: "3px",
              borderRadius: "999px",
              background:
                "linear-gradient(90deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.6) 50%, rgba(37,99,235,0.1) 100%)",
              backgroundSize: "200% 100%",
              animation: `${shimmer} 2s infinite linear`,
            })}
          />
        </div>
      )}

      {!loading && buildings.length > 0 && (
        <div
          css={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "0.65rem",
            color: "#4b5563",
            fontSize: "13px",
            marginBottom: "0.65rem",
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(17,24,39,0.08)",
            borderRadius: "999px",
            padding: "0.55rem 0.85rem",
          })}
        >
          <Building2 size={14} color="#2563eb" />
          <span css={css({ color: "#2563eb", fontWeight: 700 })}>
            {buildings.length}
          </span>
          buildings loaded. Click Next Step to view in 3D.
        </div>
      )}

      {!loading && buildings.length === 0 && (
        <div
          css={css({
            padding: "1.5rem",
            textAlign: "center",
            color: TEXT_SECONDARY,
            fontSize: "13px",
            borderRadius: "16px",
            border: `1px solid ${BORDER_COLOR}`,
            background: "rgba(255,255,255,0.6)",
          })}
        >
          No 3D building footprints found in the selected region. You can still proceed to 3D view or go back to select another area.
        </div>
      )}

      {!loading && buildings.length > 0 && (
        <ul
          css={css({
            overflow: "auto",
            zIndex: 999,
            position: "relative",
            maxHeight: "42vh",
            listStyle: "none",
            padding: 0,
            margin: "0.5rem 0 0",
            color: "#374151",
            fontSize: "12px",
            display: "grid",
            gap: "0.6rem",
          })}
        >
          {buildings.map((b) => (
            <li
              key={b.id}
              css={css({
                padding: "0.85rem 0.95rem",
                borderRadius: "16px",
                border: "1px solid rgba(17,24,39,0.08)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(248,250,252,0.82))",
                boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)",
              })}
            >
              <div
                css={css({
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: "0.4rem",
                  alignItems: "center",
                })}
              >
                <div css={css({ fontWeight: 700, color: "#111827" })}>
                  Building {b.id}
                </div>
                <span
                  css={css({
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "999px",
                    background: "rgba(37,99,235,0.08)",
                    color: "#2563eb",
                    fontWeight: 700,
                    fontSize: "11px",
                  })}
                >
                  <Ruler size={12} />
                  {b.tags.height || "No height"}
                </span>
              </div>
              {b.geometry ? (
                <div css={css({ fontSize: "11px", color: "#6b7280" })}>
                  {b.geometry.length} vertices
                </div>
              ) : (
                <div css={css({ fontSize: "11px", color: "#6b7280" })}>
                  No geometry info
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
