import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useAreaStore } from "@/state/areaStore";
import { Html, Sky, Environment, Line } from "@react-three/drei";
import * as THREE from "three";
import { useActionStore } from "@/state/exportStore";
import { GLTFExporter } from "three/examples/jsm/Addons.js";
import Car from "./Car";
import instanceFleet from "@/api/axios";
import { create } from "zustand";
import {
  ANNOTATION_COLORS,
  BuildingAnnotationColor,
  useBuildingAnnotationStore,
} from "@/state/buildingAnnotationStore";

const SCALE = 51000;

// ─── Hidden Buildings Store ───
interface HiddenStore {
  hiddenIds: Set<number>;
  selectedBuildingId: number | null;
  toggleHidden: (id: number) => void;
  selectBuilding: (id: number | null) => void;
  showAll: () => void;
  hiddenCount: () => number;
}

export const useHiddenStore = create<HiddenStore>((set, get) => ({
  hiddenIds: new Set(),
  selectedBuildingId: null,
  toggleHidden: (id) =>
    set((state) => {
      const next = new Set(state.hiddenIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return {
        hiddenIds: next,
        selectedBuildingId:
          state.selectedBuildingId === id ? null : state.selectedBuildingId,
      };
    }),
  selectBuilding: (id) => set({ selectedBuildingId: id }),
  showAll: () => set({ hiddenIds: new Set() }),
  hiddenCount: () => get().hiddenIds.size,
}));

// ─── Color palette for building types ───
const BUILDING_COLORS: Record<string, string> = {
  residential: "#b8a99a",
  apartments: "#b0a090",
  commercial: "#a0aab0",
  retail: "#a5b0a8",
  industrial: "#8a9098",
  office: "#9aa5b0",
  church: "#c8b8a0",
  school: "#a0b0a0",
  university: "#98a8a0",
  hospital: "#b0a0a8",
  default: "#9da0a3",
};

const HOVERED_COLOR = "#d4c8b8";
const SELECTED_COLOR = "#38b2ac";

function getBuildingColor(tags: Record<string, string | undefined>): string {
  const buildingType = tags.building ?? "default";
  return BUILDING_COLORS[buildingType] ?? BUILDING_COLORS.default;
}

// ─── Coordinate Projection ───
function createProjection(refLat: number, refLng: number) {
  return (lat: number, lng: number): THREE.Vector2 => {
    const x = (lng - refLng) * SCALE * Math.cos((refLat * Math.PI) / 180);
    const y = (lat - refLat) * SCALE;
    return new THREE.Vector2(x, y);
  };
}

// ─── Building Component ───
interface BuildingProps {
  shape: THREE.Shape;
  extrudeSettings: { steps: number; depth: number; bevelEnabled: boolean };
  tags: Record<string, string | undefined>;
  buildingId: number;
  markerPosition: THREE.Vector3;
}

function Building({
  shape,
  extrudeSettings,
  tags,
  buildingId,
  markerPosition,
}: BuildingProps) {
  const [hovered, setHovered] = useState(false);
  const [hoverPos, setHoverPos] = useState<THREE.Vector3 | null>(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [annotationTitle, setAnnotationTitle] = useState("");
  const [annotationNotes, setAnnotationNotes] = useState("");
  const [annotationColor, setAnnotationColor] =
    useState<BuildingAnnotationColor>("red");

  const toggleHidden = useHiddenStore((s) => s.toggleHidden);
  const selectedBuildingId = useHiddenStore((s) => s.selectedBuildingId);
  const selectBuilding = useHiddenStore((s) => s.selectBuilding);
  const annotation = useBuildingAnnotationStore(
    (s) => s.annotations[buildingId]
  );
  const upsertAnnotation = useBuildingAnnotationStore(
    (s) => s.upsertAnnotation
  );
  const removeAnnotation = useBuildingAnnotationStore(
    (s) => s.removeAnnotation
  );
  const selected = selectedBuildingId === buildingId;

  const baseColor = getBuildingColor(tags);
  const displayColor =
    selected ? SELECTED_COLOR : hovered ? HOVERED_COLOR : baseColor;

  const hasAnyData =
    tags.name ||
    (tags.building && tags.building !== "yes") ||
    tags.height ||
    tags["building:levels"] ||
    tags.amenity ||
    tags["addr:street"];

  const closePopup = () => {
    setHovered(false);
    setShowAdditionalInfo(false);
    setShowTranslations(false);
    setShowAnnotationForm(false);
    selectBuilding(null);
  };

  const openAnnotationEditor = () => {
    setShowAdditionalInfo(false);
    setShowTranslations(false);
    setAnnotationTitle(annotation?.title ?? "");
    setAnnotationNotes(annotation?.notes ?? "");
    setAnnotationColor(annotation?.color ?? "red");
    setShowAnnotationForm(true);
  };

  return (
    <>
      {annotation && (
        <group position={markerPosition}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 8, 12]} />
            <meshBasicMaterial
              color={ANNOTATION_COLORS[annotation.color]}
              transparent
              opacity={0.42}
            />
          </mesh>
          <pointLight
            color={ANNOTATION_COLORS[annotation.color]}
            intensity={0.75}
            distance={18}
          />
          <Html position={[0, 8.5, 0]} center>
            <div
              style={{
                maxWidth: "160px",
                padding: "4px 8px",
                borderRadius: "999px",
                backgroundColor: "rgba(255, 255, 255, 0.88)",
                border: `1px solid ${ANNOTATION_COLORS[annotation.color]}44`,
                color: "#111827",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.14)",
                fontSize: "11px",
                fontWeight: 700,
                lineHeight: 1.25,
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                pointerEvents: "none",
              }}
            >
              {annotation.title}
            </div>
          </Html>
        </group>
      )}
      <mesh
      onPointerOver={(e) => {
        setHovered(true);
        e.stopPropagation();
      }}
      onPointerOut={(e) => {
        setHovered(false);
        e.stopPropagation();
      }}
      onPointerMove={(e) => {
        setHoverPos(e.point.clone());
        e.stopPropagation();
      }}
      onClick={(e) => {
        selectBuilding(selected ? null : buildingId);
        e.stopPropagation();
      }}
      onContextMenu={(e) => {
        e.nativeEvent.preventDefault();
        setHoverPos(e.point.clone());
        selectBuilding(buildingId);
        openAnnotationEditor();
        e.stopPropagation();
      }}
      rotation={[-Math.PI / 2, 0, 0]}
      userData={{ exportToGLB: true }}
    >
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color={displayColor} />
      {(hovered || selected) && hoverPos && (
        <Html
          position={[
            hoverPos.x,
            hoverPos.y + extrudeSettings.depth + 0.5,
            hoverPos.z,
          ]}
          center
        >
          <div
            role="dialog"
            aria-label={tags.name || "Building Information"}
            style={{
              color: "#000000",
              backgroundColor: "#ffffff96",
              backdropFilter: "blur(8px)",
              border: "none",
              padding: "14px",
              borderRadius: "10px",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "13px",
              width: "220px",
              boxShadow: "0 2px 14px rgba(0, 0, 0, 0.16)",
              transition: "all 0.2s ease-in-out",
              position: "relative",
            }}
          >
            {/* Title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                fontWeight: "600",
                fontSize: "15px",
                borderBottom: tags.name
                  ? "1px solid rgba(0, 0, 0, 0.08)"
                  : "none",
                paddingBottom: tags.name ? "6px" : "0",
                marginBottom: tags.name ? "8px" : "4px",
              }}
            >
              <span>{tags.name || "Building Information"}</span>
              <button
                type="button"
                aria-label="Close building information"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  closePopup();
                }}
                style={{
                  width: "24px",
                  height: "24px",
                  flex: "0 0 24px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.72)",
                  color: "#5f6368",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: "1",
                  padding: "0",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  target.style.backgroundColor = "rgba(17, 24, 39, 0.06)";
                  target.style.color = "#111827";
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  target.style.backgroundColor = "rgba(255, 255, 255, 0.72)";
                  target.style.color = "#5f6368";
                }}
              >
                ×
              </button>
            </div>

            {showAnnotationForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const title = annotationTitle.trim();
                  const notes = annotationNotes.trim();
                  if (!title) return;

                  upsertAnnotation({
                    buildingId,
                    title,
                    notes,
                    color: annotationColor,
                  });
                  setShowAnnotationForm(false);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "grid",
                  gap: "8px",
                  marginBottom: "10px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <input
                  value={annotationTitle}
                  onChange={(e) => setAnnotationTitle(e.target.value)}
                  placeholder="Title"
                  maxLength={48}
                  style={{
                    width: "100%",
                    border: "1px solid rgba(17, 24, 39, 0.12)",
                    borderRadius: "6px",
                    padding: "7px 8px",
                    backgroundColor: "rgba(255, 255, 255, 0.82)",
                    color: "#111827",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
                <textarea
                  value={annotationNotes}
                  onChange={(e) => setAnnotationNotes(e.target.value)}
                  placeholder="Notes"
                  rows={3}
                  maxLength={220}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    border: "1px solid rgba(17, 24, 39, 0.12)",
                    borderRadius: "6px",
                    padding: "7px 8px",
                    backgroundColor: "rgba(255, 255, 255, 0.82)",
                    color: "#111827",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  {Object.entries(ANNOTATION_COLORS).map(([key, color]) => (
                    <button
                      key={key}
                      type="button"
                      aria-label={`Use ${key} marker`}
                      onClick={() =>
                        setAnnotationColor(key as BuildingAnnotationColor)
                      }
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "999px",
                        border:
                          annotationColor === key
                            ? "2px solid #111827"
                            : "1px solid rgba(17, 24, 39, 0.16)",
                        backgroundColor: color,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  {annotation && (
                    <button
                      type="button"
                      onClick={() => {
                        removeAnnotation(buildingId);
                        setShowAnnotationForm(false);
                      }}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "6px 0",
                      }}
                    >
                      Delete
                    </button>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginLeft: "auto",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowAnnotationForm(false)}
                      style={{
                        border: "1px solid rgba(17, 24, 39, 0.12)",
                        borderRadius: "6px",
                        backgroundColor: "rgba(255, 255, 255, 0.72)",
                        color: "#374151",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "6px 9px",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!annotationTitle.trim()}
                      style={{
                        border: "1px solid rgba(37, 99, 235, 0.18)",
                        borderRadius: "6px",
                        backgroundColor: annotationTitle.trim()
                          ? "#2563eb"
                          : "rgba(148, 163, 184, 0.42)",
                        color: "#ffffff",
                        cursor: annotationTitle.trim()
                          ? "pointer"
                          : "not-allowed",
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "6px 10px",
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            )}

            {annotation && !showAnnotationForm && (
              <div
                style={{
                  marginBottom: "10px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    marginBottom: annotation.notes ? "6px" : "0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        flex: "0 0 8px",
                        borderRadius: "999px",
                        backgroundColor: ANNOTATION_COLORS[annotation.color],
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {annotation.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      openAnnotationEditor();
                    }}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#2563eb",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "2px 0",
                    }}
                  >
                    Edit
                  </button>
                </div>
                {annotation.notes && (
                  <div
                    style={{
                      color: "#5f6368",
                      fontSize: "12px",
                      lineHeight: 1.45,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {annotation.notes}
                  </div>
                )}
              </div>
            )}

            {/* Core info or No Data */}
            {hasAnyData ? (
              <>
                {[
                  "building",
                  "height",
                  "building:levels",
                  "amenity",
                  "denomination",
                ].map(
                  (key) =>
                    tags[key] &&
                    (key !== "building" || tags[key] !== "yes") && (
                      <InfoRow
                        key={key}
                        label={formatLabel(key)}
                        value={
                          key === "height"
                            ? `${tags[key]} m`
                            : String(tags[key])
                        }
                      />
                    )
                )}

                {/* Address block */}
                {[
                  "addr:street",
                  "addr:housenumber",
                  "addr:district",
                  "addr:city",
                  "addr:postcode",
                ].some((key) => tags[key]) && (
                  <div
                    style={{
                      margin: "10px 0 8px",
                      borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                      paddingTop: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "500",
                        marginBottom: "4px",
                        color: "#5f6368",
                      }}
                    >
                      Address
                    </div>
                    <div
                      style={{
                        marginLeft: "4px",
                        fontSize: "12px",
                        color: "#5f6368",
                      }}
                    >
                      {[
                        [tags["addr:street"], tags["addr:housenumber"]]
                          .filter(Boolean)
                          .join(" "),
                        tags["addr:district"],
                        tags["addr:city"],
                        tags["addr:postcode"],
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  color: "#8f8f96",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "6px 0",
                }}
              >
                No data available
              </div>
            )}

            {/* Additional Info toggle */}
            {Object.entries(tags).filter(
              ([key]) =>
                ![
                  "building",
                  "name",
                  "height",
                  "building:levels",
                  "source",
                  "amenity",
                  "denomination",
                ].includes(key) &&
                !key.startsWith("addr:") &&
                !key.startsWith("name:") &&
                !key.startsWith("alt_name:")
            ).length > 0 && (
              <div
                style={{
                  margin: "10px 0 4px",
                  borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                  paddingTop: "8px",
                }}
              >
                <div
                  style={{
                    fontWeight: "500",
                    marginBottom: "4px",
                    color: "#5f6368",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAdditionalInfo(!showAdditionalInfo);
                  }}
                >
                  Additional Information
                  <span>{showAdditionalInfo ? "▲" : "▼"}</span>
                </div>
                {showAdditionalInfo && (
                  <div>
                    {Object.entries(tags)
                      .filter(
                        ([key]) =>
                          ![
                            "building",
                            "name",
                            "height",
                            "building:levels",
                            "source",
                            "amenity",
                            "denomination",
                          ].includes(key) &&
                          !key.startsWith("addr:") &&
                          !key.startsWith("name:") &&
                          !key.startsWith("alt_name:")
                      )
                      .map(([key, value]) => {
                        if (
                          key === "description" ||
                          (typeof value === "string" && value.length > 80)
                        ) {
                          return (
                            <div key={key} style={{ margin: "8px 0" }}>
                              <div
                                style={{
                                  fontWeight: "500",
                                  color: "#5f6368",
                                  marginBottom: "4px",
                                }}
                              >
                                {formatLabel(key)}
                              </div>
                              <div
                                style={{
                                  textAlign: "left",
                                  fontSize: "12px",
                                  color: "#5f6368",
                                  fontWeight: "400",
                                  whiteSpace: "pre-wrap",
                                  lineHeight: "1.4",
                                  backgroundColor: "rgba(0,0,0,0.02)",
                                  padding: "6px 8px",
                                  borderRadius: "4px",
                                }}
                              >
                                {String(value)}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <InfoRow
                            key={key}
                            label={formatLabel(key)}
                            value={String(value)}
                          />
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Translations toggle */}
            {Object.entries(tags).filter(([key]) => key.startsWith("name:"))
              .length > 0 && (
              <div
                style={{
                  margin: "10px 0 4px",
                  borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                  paddingTop: "8px",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    fontWeight: "500",
                    marginBottom: "4px",
                    color: "#5f6368",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTranslations(!showTranslations);
                  }}
                >
                  Name Translations
                  <span>{showTranslations ? "▲" : "▼"}</span>
                </div>
                {showTranslations && (
                  <div>
                    {Object.entries(tags)
                      .filter(([key]) => key.startsWith("name:"))
                      .map(([key, value]) => (
                        <InfoRow
                          key={key}
                          label={key.replace("name:", "").toUpperCase()}
                          value={String(value)}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Cut Building Button ── */}
            <div
              style={{
                marginTop: "10px",
                borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                paddingTop: "8px",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closePopup();
                  toggleHidden(buildingId);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "rgba(239, 68, 68, 0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "rgba(239, 68, 68, 0.08)";
                }}
              >
                ✂ Cut Building
              </button>
            </div>
          </div>
        </Html>
      )}
      </mesh>
    </>
  );
}

// ─── Helpers ───
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: "4px 0",
      }}
    >
      <span style={{ fontWeight: "500", color: "#5f6368" }}>{label}:</span>
      <span style={{ textTransform: "capitalize" }}>{value}</span>
    </div>
  );
}

function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    building: "Type",
    height: "Height",
    "building:levels": "Levels",
    amenity: "Facility",
    denomination: "Denomination",
  };
  return (
    labels[key] ??
    key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")
  );
}

// ─── Road Colors ───
const ROAD_COLORS: Record<string, string> = {
  motorway: "#ffffff",
  trunk: "#e0e0e0",
  primary: "#d0d0d0",
  secondary: "#a0a0a0",
  tertiary: "#808080",
  residential: "#606060",
  service: "#505050",
  footway: "#404040",
  path: "#383838",
  default: "#34f516",
};

interface RoadElement {
  id: number;
  tags: Record<string, string | undefined>;
  geometry?: { lat: number; lon: number }[];
}

function Roads({
  area,
}: {
  area: { lat: number; lng: number }[] | undefined;
}) {
  const [roads, setRoads] = useState<RoadElement[]>([]);

  if (!area || area.length < 2) return null;

  const refLat = (area[1].lat + area[0].lat) / 2;
  const refLng = (area[1].lng + area[0].lng) / 2;
  const project = createProjection(refLat, refLng);

  useEffect(() => {
    const south = area[1].lat;
    const west = area[1].lng;
    const north = area[0].lat;
    const east = area[0].lng;
    const query = `[out:json][timeout:25];(way["highway"](${south},${west},${north},${east}););out body geom;`;

    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
      .then((response) => response.json())
      .then((data) => setRoads(data.elements))
      .catch((err) => console.error(err));
  }, [area]);

  return (
    <>
      {roads.map((road) => {
        if (!road.geometry || road.geometry.length < 2) return null;

        const color = "#34f516";

        const points = road.geometry.map((pt) => {
          const v = project(pt.lat, pt.lon);
          return new THREE.Vector3(v.x, 0.1, -v.y);
        });

        return (
          <Line
            key={road.id}
            points={points}
            color={color}
            lineWidth={1}
            userData={{ exportToGLB: true }}
          />
        );
      })}
    </>
  );
}

// ─── Export ───
export function Export() {
  const { scene } = useThree();
  const getActionState = useActionStore.getState;

  useEffect(() => {
    window.riosExportModel = (mode: "glb" | "fleet") => {
      exportGLB(mode);
    };

    return () => {
      window.riosExportModel = undefined;
    };
  }, [scene]);

  const uploadFleet = async (blob: Blob) => {
    const { fleetSpaceId } = getActionState();
    const formData = new FormData();
    formData.append("object", blob, "box3d.glb");
    formData.append("title", "New Object");
    formData.append("description", "");
    formData.append("spaceId", fleetSpaceId);

    await instanceFleet.post("space/file/mesh", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const exportGLB = (mode: "glb" | "fleet") => {
    const exportRoot = new THREE.Group();
    scene.updateMatrixWorld(true);
    scene.traverse((child) => {
      if (child.userData?.exportToGLB === true) {
        exportRoot.add(child.clone(true));
      }
    });

    const exporter = new GLTFExporter();
    const options = { binary: true, embedImages: true };
    exportRoot.updateMatrixWorld(true);

    if (exportRoot.children.length === 0) {
      console.error("GLB export skipped: no exportable objects were found.");
      return;
    }

    exporter.parse(
      exportRoot,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: "model/gltf-binary" });

          if (mode === "glb") {
            const link = document.createElement("a");
            link.style.display = "none";
            document.body.appendChild(link);
            link.href = URL.createObjectURL(blob);
            link.download = "scene.glb";
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
          }

          if (mode === "fleet") {
            uploadFleet(blob);
          }
        } else {
          console.error("GLB export failed: unexpected result", result);
        }
      },
      (error) => {
        console.error("An error occurred during export", error);
      },
      options
    );
  };

  return null;
}

// ─── Main Scene ───
export function Space() {
  const areas = useAreaStore((state) => state.areas);
  const hiddenIds = useHiddenStore((s) => s.hiddenIds);
  const [realCenter, setRealCenter] = useState<
    { lat: number; lng: number }[] | undefined
  >();
  const center = useAreaStore((state) => state.center);
  const refLat = (center[1].lat + center[0].lat) / 2;
  const refLng = (center[1].lng + center[0].lng) / 2;
  const project = createProjection(refLat, refLng);

  const buildingsData = useMemo(() => {
    const result: BuildingProps[] = [];
    areas.forEach(
      (bld: {
        id: number;
        geometry?: { lat: number; lng: number }[];
        tags: Record<string, string | undefined>;
      }) => {
        if (!bld.geometry || bld.geometry.length < 3) return;

        const shapePoints = bld.geometry.map((pt) =>
          project(pt.lat, pt.lng)
        );
        if (!shapePoints[0].equals(shapePoints[shapePoints.length - 1])) {
          shapePoints.push(shapePoints[0]);
        }
        const shape = new THREE.Shape(shapePoints);

        let heightValue = parseFloat(bld.tags.height || "");
        const heightLevels = parseFloat(bld.tags["building:levels"] || "");
        if (isNaN(heightValue)) heightValue = 10;
        if (!isNaN(heightLevels)) heightValue = heightLevels * 2.2;

        const extrudeSettings = {
          steps: 1,
          depth: heightValue,
          bevelEnabled: false,
        };

        result.push({
          shape,
          extrudeSettings,
          tags: bld.tags,
          buildingId: bld.id,
          markerPosition: new THREE.Vector3(
            shapePoints.reduce((sum, point) => sum + point.x, 0) /
              shapePoints.length,
            heightValue + 0.4,
            -shapePoints.reduce((sum, point) => sum + point.y, 0) /
              shapePoints.length
          ),
        });
      }
    );
    return result;
  }, [areas, refLat, refLng]);

  useEffect(() => {
    setRealCenter(center);
  }, [areas]);

  return (
    <Canvas camera={{ fov: 90, near: 0.1, far: 7000 }}>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />

      {buildingsData.map((item) =>
        hiddenIds.has(item.buildingId) ? null : (
          <Building
            key={item.buildingId}
            shape={item.shape}
            extrudeSettings={item.extrudeSettings}
            tags={item.tags}
            buildingId={item.buildingId}
            markerPosition={item.markerPosition}
          />
        )
      )}

      <Roads area={realCenter} />
      <pointLight
        position={[-10, -10, -10]}
        decay={0}
        intensity={Math.PI}
      />
      <Car />
      <Export />
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />
      <Environment preset="city" />
    </Canvas>
  );
}
