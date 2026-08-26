import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { LatLng, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { css } from "@emotion/react";
import { Hand, SquareMousePointer, Trash2 } from "lucide-react";

const IconSize = css({
  width: "14px",
  height: "14px",
});

function FlyToLocation({
  position,
}: {
  position: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

function RectangleSelector({
  isDrag = true,
  drawBounds,
  onChange,
  onDrawChange,
}: {
  isDrag: boolean;
  drawBounds: LatLngBounds | null;
  onChange: (bounds: LatLngBounds) => void;
  onDrawChange: (bounds: LatLngBounds) => void;
}) {
  const [firstPoint, setFirstPoint] = useState<LatLng | null>(null);
  const lastLatlngRef = useRef<LatLng | null>(null);

  const adjustLng = (latlng: LatLng): LatLng => {
    const adjustedLng = ((((latlng.lng + 180) % 360) + 360) % 360) - 180;
    return new L.LatLng(latlng.lat, adjustedLng);
  };

  const map = useMapEvents({
    mousedown(e) {
      if (!isDrag) {
        setFirstPoint(e.latlng);
      }
    },
    mousemove(e) {
      if (firstPoint) {
        lastLatlngRef.current = adjustLng(e.latlng);
        onDrawChange(new L.LatLngBounds(firstPoint, e.latlng));
        onChange(
          new L.LatLngBounds(adjustLng(firstPoint), adjustLng(e.latlng))
        );
      }
    },
    mouseup(e) {
      if (firstPoint) {
        onDrawChange(new L.LatLngBounds(firstPoint, e.latlng));
        onChange(
          new L.LatLngBounds(adjustLng(firstPoint), adjustLng(e.latlng))
        );
        setFirstPoint(null);
      }
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    const handleTouchStart = (e: TouchEvent) => {
      if (!isDrag && e.touches.length > 0) {
        const touch = e.touches[0];
        const latlng = map.mouseEventToLatLng(touch as unknown as MouseEvent);
        setFirstPoint(latlng);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (firstPoint && e.touches.length > 0) {
        const touch = e.touches[0];
        const latlng = map.mouseEventToLatLng(touch as unknown as MouseEvent);
        lastLatlngRef.current = latlng;
        onDrawChange(new L.LatLngBounds(firstPoint, latlng));
        onChange(new L.LatLngBounds(adjustLng(firstPoint), adjustLng(latlng)));
      }
    };

    const handleTouchEnd = () => {
      if (firstPoint) {
        const latlng = lastLatlngRef.current || firstPoint;
        onDrawChange(new L.LatLngBounds(firstPoint, latlng));
        onChange(new L.LatLngBounds(adjustLng(firstPoint), adjustLng(latlng)));
        setFirstPoint(null);
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [map, isDrag, firstPoint, onChange]);

  useEffect(() => {
    if (map) {
      isDrag ? map.dragging.enable() : map.dragging.disable();
    }
  }, [isDrag, map]);

  return drawBounds ? (
    <Rectangle
      bounds={drawBounds}
      pathOptions={{
        color: "rgba(37, 99, 235, 0.95)",
        weight: 2,
        fillColor: "rgba(37, 99, 235, 0.14)",
        fillOpacity: 0.18,
      }}
    />
  ) : null;
}

export function MapComponent({
  onRemove,
  onDone,
  flyTarget,
}: {
  onDone: (e: { lat: number; lng: number }[]) => void;
  onRemove: () => void;
  flyTarget: { lat: number; lng: number } | null;
}) {
  const [isDrag, setIsDrag] = useState(true);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [drawBounds, setDrawBounds] = useState<LatLngBounds | null>(null);

  const handleClickSwitchDrag = () => {
    setIsDrag(!isDrag);
  };

  const handleClickRemoveBox = () => {
    onRemove();
    setBounds(null);
    setDrawBounds(null);
    setIsDrag(true);
  };

  const handleChangeDone = (e: LatLngBounds) => {
    setBounds(e);
    onDone([e.getNorthEast(), e.getSouthWest()]);
  };

  const handleChangeDraw = (e: LatLngBounds) => {
    setDrawBounds(e);
    onDone([e.getNorthEast(), e.getSouthWest()]);
  };

  return (
    <div
      css={css({
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid rgba(17, 24, 39, 0.08)",
        boxShadow: "0 26px 60px rgba(15, 23, 42, 0.14)",
        background: "rgba(255, 255, 255, 0.55)",
      })}
    >
      <div
        css={css({
          position: "absolute",
          zIndex: 9999,
          right: "1rem",
          top: "1rem",
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
          flexWrap: "wrap",
        })}
      >
        <button
          css={css({
            display: bounds == null || isDrag ? "none" : "inline-flex",
            color: "#ffffff",
            backgroundColor: "rgba(239, 68, 68, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(239, 68, 68, 0.22)",
            padding: "0.65rem 0.95rem",
            borderRadius: "999px",
            cursor: "pointer",
            transition:
              "transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 12px 24px rgba(239, 68, 68, 0.18)",
            ":hover": {
              backgroundColor: "rgba(220, 38, 38, 0.98)",
              transform: "translateY(-1px)",
            },
          })}
          onClick={handleClickRemoveBox}
        >
          <Trash2 css={IconSize} /> Remove Box
        </button>

        <button
          css={css({
            color: isDrag ? "#ffffff" : "#111827",
            backgroundColor: isDrag
              ? "rgba(37, 99, 235, 0.94)"
              : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${
              isDrag ? "rgba(37,99,235,0.2)" : "rgba(17,24,39,0.08)"
            }`,
            padding: "0.65rem 0.95rem",
            borderRadius: "999px",
            cursor: "pointer",
            transition:
              "transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: isDrag
              ? "0 12px 24px rgba(37, 99, 235, 0.18)"
              : "0 12px 24px rgba(15, 23, 42, 0.08)",
            ":hover": {
              backgroundColor: isDrag
                ? "rgba(29, 78, 216, 0.98)"
                : "rgba(255,255,255,0.98)",
              transform: "translateY(-1px)",
            },
          })}
          onClick={handleClickSwitchDrag}
        >
          {isDrag ? <SelectBox /> : <Hand css={IconSize} />}
          <span>{isDrag ? "Draw Box" : "Back to Drag"}</span>
        </button>
      </div>

      <MapContainer
        center={[40.8, -73.95]}
        zoom={13}
        minZoom={2}
        maxZoom={19}
        style={{
          height: "clamp(380px, 56vh, 620px)",
          width: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <RectangleSelector
          drawBounds={drawBounds}
          isDrag={isDrag}
          onChange={handleChangeDone}
          onDrawChange={handleChangeDraw}
        />
        <FlyToLocation position={flyTarget} />
      </MapContainer>
    </div>
  );
}

function SelectBox() {
  return (
    <>
      <SquareMousePointer css={IconSize} />
    </>
  );
}
