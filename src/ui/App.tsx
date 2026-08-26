import { css, keyframes } from "@emotion/react";
import { Space, useHiddenStore } from "../three/Space";
import { FullscreenModal } from "../components/FullscreenModal";
import { Title } from "@/components/text/Title";
import { Description } from "@/components/text/Description";
import { Column } from "@/components/flex/Column";
import { MapComponent } from "@/components/map/SelectMap";
import { SearchBar } from "@/components/map/SearchBar";
import { useEffect, useState } from "react";
import {
  Button,
  NextButton,
  PrevButton,
} from "@/components/button/BottomButton";
import { BuildingHeights, Building } from "@/components/map/Processing";
import {
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Download,
  Eye,
  Layers3,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useAreaStore } from "@/state/areaStore";
import { useActionStore } from "@/state/exportStore";
import { Modal } from "@/components/modal/Modal";
import { TopNav } from "@/components/nav/TopNav";
import { getCookie } from "@/utils/cookie";
import instanceFleet from "@/api/axios";
import { MovementHint } from "@/components/controls/MovementHint";
import { StatsPanel } from "@/components/panels/StatsPanel";

const IconSize = css({
  width: "14px",
  height: "14px",
  flexShrink: 0,
});

const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const STEPS = ["front", "processing"] as const;

function App() {
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
  const [areaData, setAreaData] = useState<{ lat: number; lng: number }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [step, setStep] = useState(0);
  const [isWarnModal, setIsWarnModal] = useState(false);
  const [isFleetLogin, setIsFleetLogin] = useState(false);
  const [isFleetModal, setIsFleetModal] = useState(false);
  const [spaceList, setSpaceList] = useState<
    { id: string; title: string }[]
  >([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isFetchingBuildings, setIsFetchingBuildings] = useState(false);
  const [hasFetchedBuildings, setHasFetchedBuildings] = useState(false);

  const setCenter = useAreaStore((state) => state.setCenter);
  const appendAreas = useAreaStore((state) => state.appendAreas);
  const setExportType = useActionStore((state) => state.setExportType);
  const setFleet = useActionStore((state) => state.setFleet);

  const hiddenIds = useHiddenStore((s) => s.hiddenIds);
  const showAll = useHiddenStore((s) => s.showAll);

  const checkIsBig = (): boolean => {
    if (areaData.length < 2) return false;
    const a = areaData[0].lat - areaData[1].lat;
    const b = areaData[0].lng - areaData[1].lng;
    return a + b > 0.1;
  };

  const triggerExport = () => {
    window.riosExportModel?.("glb");
  };

  const getFleetSpaces = async () => {
    const getSpace: { data: { spaces: { id: string; title: string }[] } } =
      await instanceFleet.get("space");
    setSpaceList(
      getSpace.data.spaces.map((item) => ({
        ...item,
        key: item.id,
      }))
    );
  };

  const putGlbOnFleetSpace = (spaceId: string) => {
    setFleet(spaceId, "fleet");
    setExportType("fleet");
    window.riosExportModel?.("fleet");
  };

  const loadFleetSpace = () => {
    getFleetSpaces();
    setIsFleetModal(true);
  };

  const checkFleetLogin = () => {
    try {
      const isCookie = getCookie("token");
      if (isCookie) {
        setIsFleetLogin(true);
      }
    } catch {
      // silently ignore cookie errors
    }
  };

  const handleDone = (data: { lat: number; lng: number }[]) => {
    setAreaData(data);
    setCenter(data);
    setIsNextButtonDisabled(false);
    setBuildings([]);
    setHasFetchedBuildings(false);
  };

  const handleRemove = () => {
    setAreaData([]);
    setIsNextButtonDisabled(true);
    setBuildings([]);
    setHasFetchedBuildings(false);
  };

  const requestBuildings = async () => {
    if (areaData.length < 2) return;
    setIsFetchingBuildings(true);

    const south = areaData[1].lat;
    const west = areaData[1].lng;
    const north = areaData[0].lat;
    const east = areaData[0].lng;
    const query = `[out:json][timeout:25];(way["building"]( ${south},${west},${north},${east} );relation["building"]( ${south},${west},${north},${east} ););out body geom;`;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const data = await response.json();
      const blds: Building[] = data.elements.map(
        (element: {
          id: number;
          tags: { [key: string]: string | undefined };
          geometry?: { lat: number; lon: number }[];
        }) => ({
          id: element.id,
          tags: element.tags,
          geometry: element.geometry
            ? element.geometry.map((pt) => ({ lat: pt.lat, lng: pt.lon }))
            : undefined,
        })
      );
      setBuildings(blds);
      appendAreas(blds);
      setHasFetchedBuildings(true);
    } catch (error) {
      console.error("Error fetching building data:", error);
    } finally {
      setIsFetchingBuildings(false);
    }
  };

  const handleClickNextStep = async () => {
    if (step === 0 && checkIsBig()) {
      setIsWarnModal(true);
      return;
    }
    if (step === 1 && !hasFetchedBuildings) {
      await requestBuildings();
      return;
    }
    setStep(step + 1);
  };

  const handleClickPrevStep = () => {
    setStep(step - 1);
  };

  const handleClickExport = () => {
    setExportType("glb");
    triggerExport();
  };

  useEffect(() => {
    checkFleetLogin();
  }, []);

  return (
    <div
      css={css({
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      })}
    >
      <TopNav step={step} />

      {/* Step 0: Map Selection */}
      <FullscreenModal isOpen={STEPS[step] === "front"}>
        <Column gap="1rem" css={css({ flex: 1, minHeight: 0 })}>
          <Column gap="0.5rem">
            <Title>Generate 3D Map</Title>
            <Description>
              Select a region on the map to generate an interactive 3D model.
              Search for any location or draw a bounding box to begin.
            </Description>
          </Column>
          <SearchBar
            onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
          />
          <MapComponent
            onRemove={handleRemove}
            onDone={handleDone}
            flyTarget={selectedLocation}
          />

          <div
            css={css({
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: "0.5rem",
              marginTop: "auto",
              paddingBottom: "0.5rem",
            })}
          >
            <NextButton
              isShow={step !== 2}
              disabled={isNextButtonDisabled || isFetchingBuildings}
              onClick={handleClickNextStep}
            >
              {isFetchingBuildings ? (
                <>
                  <Loader2
                    css={[
                      IconSize,
                      css({ animation: `${spinAnimation} 1s linear infinite` }),
                    ]}
                  />
                  Fetching...
                </>
              ) : (
                <>
                  Next Step <ChevronRight css={IconSize} />
                </>
              )}
            </NextButton>
          </div>
        </Column>
      </FullscreenModal>

      {/* Step 1: Processing */}
      <FullscreenModal isOpen={STEPS[step] === "processing"}>
        <Column gap="1rem" css={css({ flex: 1, minHeight: 0 })}>
          <Column gap="0.5rem">
            <Title>Processing</Title>
            <Description>
              Click Next Step to fetch building information. Once loaded, click
              Next Step again to view the 3D scene.
            </Description>

            <BuildingHeights
              buildings={buildings}
              loading={isFetchingBuildings}
            />
          </Column>

          <div
            css={css({
              display: "flex",
              justifyContent: "space-between",
              gap: "0.75rem",
              paddingTop: "0.5rem",
              marginTop: "auto",
              paddingBottom: "0.5rem",
            })}
          >
            <PrevButton isShow={step !== 0} onClick={handleClickPrevStep}>
              <ChevronLeft css={IconSize} /> Back
            </PrevButton>

            <NextButton
              isShow={step !== 2}
              disabled={isNextButtonDisabled || isFetchingBuildings}
              onClick={handleClickNextStep}
            >
              {isFetchingBuildings ? (
                <>
                  <Loader2
                    css={[
                      IconSize,
                      css({ animation: `${spinAnimation} 1s linear infinite` }),
                    ]}
                  />
                  Fetching...
                </>
              ) : (
                <>
                  Next Step <ChevronRight css={IconSize} />
                </>
              )}
            </NextButton>
          </div>
        </Column>
      </FullscreenModal>

      {step === 2 && (
        <div
          css={css({
            position: "fixed",
            right: "1.5rem",
            bottom: "1.5rem",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            alignItems: "flex-end",
          })}
        >
          {isFleetLogin && (
            <button
              onClick={loadFleetSpace}
              css={css({
                color: "#111827",
                backgroundColor: "rgba(255, 255, 255, 0.88)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(17,24,39,0.08)",
                padding: "0.65rem 0.95rem",
                borderRadius: "999px",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                transition:
                  "transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
                ":hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  transform: "translateY(-1px)",
                },
              })}
            >
              <CloudUpload css={IconSize} /> Send to Fleet
            </button>
          )}

          <button
            onClick={handleClickExport}
            css={css({
              color: "#ffffff",
              backgroundColor: "rgba(37, 99, 235, 0.96)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(37,99,235,0.18)",
              padding: "0.72rem 1rem",
              borderRadius: "999px",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              transition:
                "transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 14px 30px rgba(37, 99, 235, 0.22)",
              ":hover": {
                backgroundColor: "rgba(29, 78, 216, 0.98)",
                transform: "translateY(-1px)",
              },
            })}
          >
            <Download css={IconSize} /> Export as GLB
          </button>
        </div>
      )}

      {/* Show All Buildings (visible when buildings are hidden) */}
      {step === 2 && hiddenIds.size > 0 && (
        <button
          onClick={showAll}
          css={css({
            position: "absolute",
            zIndex: 9999,
            right: "2rem",
            bottom: "5rem",
            color: "#111827",
            backgroundColor: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(17,24,39,0.08)",
            padding: "0.65rem 0.95rem",
            borderRadius: "999px",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer",
            transition:
              "transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
            ":hover": {
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              transform: "translateY(-1px)",
            },
          })}
        >
          <Eye css={IconSize} /> Reveal hidden ({hiddenIds.size})
        </button>
      )}

      {/* Stats Panel (3D view) */}
      <StatsPanel
        buildings={buildings}
        area={areaData.length >= 2 ? areaData : null}
        isVisible={step === 2}
      />

      {/* Movement hint (car mode) */}
      <MovementHint isVisible={step === 2} />

      {/* Warning Modal */}
      <Modal isOpen={isWarnModal} onClose={() => setIsWarnModal(false)}>
        <Column gap="0.85rem">
          <div
            css={css({
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
            })}
          >
            <div
              css={css({
                width: "2rem",
                height: "2rem",
                borderRadius: "999px",
                display: "grid",
                placeItems: "center",
                background: "rgba(245, 158, 11, 0.12)",
                color: "#d97706",
              })}
            >
              <AlertTriangle size={14} />
            </div>
            <Title>The area is too big</Title>
          </div>
          <Description>Do you want to proceed?</Description>
          <Button
            isShow={step !== 2}
            disabled={isNextButtonDisabled}
            onClick={() => {
              setStep(step + 1);
              setIsWarnModal(false);
            }}
          >
            Continue <ChevronRight css={IconSize} />
          </Button>
        </Column>
      </Modal>

      {/* Fleet Modal */}
      <Modal isOpen={isFleetModal} onClose={() => setIsFleetModal(false)}>
        <Column gap="0.85rem">
          <Title>Select Fleet Space</Title>
          <Description>Pick a destination space for the exported GLB file.</Description>
          {spaceList.map((item) => (
            <Button
              key={item.id}
              isShow={true}
              onClick={() => putGlbOnFleetSpace(item.id)}
            >
              <Layers3 css={IconSize} /> {item.title}
            </Button>
          ))}
        </Column>
      </Modal>

      {/* 3D Scene */}
      <Space />
    </div>
  );
}

export default App;
