export function generateFloorUlpin(
  baseUlpin: string,
  buildingId: number,
  floorNumber: number
): string {
  return `${baseUlpin}-${buildingId}-${floorNumber}`;
}

export function generateBaseUlpin(lat: number, lng: number): string {
  // Not a real government ULPIN, a stand-in generated the same way,
  // deterministically, from the building's own coordinates.
  const latPart = Math.round((lat + 90) * 100000).toString().padStart(7, "0");
  const lngPart = Math.round((lng + 180) * 100000).toString().padStart(7, "0");
  return `${latPart}${lngPart}`;
}