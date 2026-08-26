import { css } from "@emotion/react";
import type { Building } from "@/components/map/Processing";
import { Building2, Gauge, MapPinned } from "lucide-react";
import { type ReactNode } from "react";

export function StatsPanel({
  buildings,
  area,
  isVisible,
}: {
  buildings: Building[];
  area: { lat: number; lng: number }[] | null;
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  const buildingCount = buildings.length;
  const areaLabel =
    area && area.length >= 2
      ? `${Math.abs(area[0].lat - area[1].lat).toFixed(3)} x ${Math.abs(
          area[0].lng - area[1].lng
        ).toFixed(3)}`
      : "N/A";

  const withHeightInfo = buildings.filter((b) => b.tags.height).length;

  return (
    <aside
      css={css({
        position: "fixed",
        left: "1rem",
        bottom: "1rem",
        zIndex: 9999,
        minWidth: "240px",
        padding: "0.95rem 1rem",
        borderRadius: "20px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(247,249,253,0.84))",
        backdropFilter: "blur(16px)",
        boxShadow: "0 18px 36px rgba(15, 23, 42, 0.12)",
        color: "#1a1a1a",
        border: "1px solid rgba(17,24,39,0.08)",
      })}
    >
      <div
        css={css({
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "13px",
          fontWeight: 800,
          marginBottom: "0.75rem",
          color: "#111827",
        })}
      >
        <Gauge size={15} color="#2563eb" />
        Scene Stats
      </div>
      <StatRow icon={<Building2 size={12} />} label="Buildings" value={String(buildingCount)} />
      <StatRow icon={<MapPinned size={12} />} label="With height" value={String(withHeightInfo)} />
      <StatRow icon={<Gauge size={12} />} label="Area" value={areaLabel} />
    </aside>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      css={css({
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        fontSize: "12px",
        padding: "0.45rem 0.55rem",
        borderRadius: "14px",
        backgroundColor: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(17,24,39,0.06)",
        marginBottom: "0.5rem",
      })}
    >
      <span
        css={css({
          color: "#4b5563",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
        })}
      >
        <span css={css({ color: "#2563eb" })}>{icon}</span>
        {label}
      </span>
      <span css={css({ fontWeight: 700, textAlign: "right", color: "#111827" })}>
        {value}
      </span>
    </div>
  );
}
