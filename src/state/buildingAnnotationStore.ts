import { create } from "zustand";

export type BuildingAnnotationColor =
  | "red"
  | "amber"
  | "blue"
  | "green"
  | "violet";

export interface BuildingAnnotation {
  buildingId: number;
  title: string;
  notes: string;
  color: BuildingAnnotationColor;
}

interface BuildingAnnotationStore {
  annotations: Record<number, BuildingAnnotation>;
  upsertAnnotation: (annotation: BuildingAnnotation) => void;
  removeAnnotation: (buildingId: number) => void;
}

export const ANNOTATION_COLORS: Record<BuildingAnnotationColor, string> = {
  red: "#ef4444",
  amber: "#f59e0b",
  blue: "#2563eb",
  green: "#16a34a",
  violet: "#7c3aed",
};

export const useBuildingAnnotationStore = create<BuildingAnnotationStore>(
  (set) => ({
    annotations: {},
    upsertAnnotation: (annotation) =>
      set((state) => ({
        annotations: {
          ...state.annotations,
          [annotation.buildingId]: annotation,
        },
      })),
    removeAnnotation: (buildingId) =>
      set((state) => {
        const { [buildingId]: _removed, ...annotations } = state.annotations;
        return { annotations };
      }),
  })
);
