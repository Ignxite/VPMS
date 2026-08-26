import { create } from "zustand";

type ActionStore = {
  fleetSpaceId: string;
  exportType: "glb" | "fleet";

  setExportType: (exportType: "glb" | "fleet") => void;
  setFleet: (fleetSpaceId: string, exportType: "glb" | "fleet") => void;
};

export const useActionStore = create<ActionStore>((set) => ({
  fleetSpaceId: "",
  exportType: "glb",
  setExportType: (exportType) => set(() => ({ exportType })),
  setFleet: (fleetSpaceId, exportType) =>
    set(() => ({ fleetSpaceId: fleetSpaceId, exportType: exportType })),
}));
