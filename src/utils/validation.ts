export function checkHeightFloorMismatch(
  heightMeters: number,
  floorCount: number
): boolean {
  const expectedHeight = floorCount * 3; // rough average, ~3m per floor
  const difference = Math.abs(heightMeters - expectedHeight);
  const tolerance = expectedHeight * 0.3; // allow 30% natural variance

  return difference > tolerance;
}