import { css, keyframes } from "@emotion/react";
import { Building2, Loader2, Ruler } from "lucide-react";

export interface Building {
  id: number;
  tags: { [key: string]: string | undefined };
  geometry?: { lat: number; lng: number }[];
}

const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export function BuildingHeights({
  buildings,
  loading,
}: {
  buildings: Building[];
  loading: boolean;
}) {
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
            display: "inline-flex",
            alignItems: "center",
            gap: "0.65rem",
            color: "#4b5563",
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(17,24,39,0.08)",
            borderRadius: "999px",
            padding: "0.55rem 0.85rem",
          })}
        >
          <Loader2
            css={css({
              animation: `${spinAnimation} 1s linear infinite`,
              color: "#2563eb",
            })}
            size={16}
          />
          Fetching building information...
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
    </div>
  );
}
