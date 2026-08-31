import { createClient } from "@supabase/supabase-js";
import { generateFloorUlpin } from "@/utils/ulpin";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getFloorsForBuilding(buildingId: number) {
  const { data, error } = await supabase
    .from("floors")
    .select("*")
    .eq("building_id", buildingId);

  if (error) {
    console.error("Failed to fetch floors:", error);
    return [];
  }

  return data;
}

export async function createFloor(
  buildingId: number,
  floorNumber: number,
  floorUlpin: string
) {
  const { data, error } = await supabase
    .from("floors")
    .insert({
      building_id: buildingId,
      floor_number: floorNumber,
      floor_ulpin: floorUlpin,
    })
    .select();

  if (error) {
    console.error("Failed to create floor:", error);
    return null;
  }

  return data;
}

export async function getOrCreateParcel(
  baseUlpin: string,
  lat: number,
  lng: number
) {
  const { data: existing, error: fetchError } = await supabase
    .from("parcels")
    .select("*")
    .eq("ulpin", baseUlpin)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to look up parcel:", fetchError);
    return null;
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: insertError } = await supabase
    .from("parcels")
    .insert({
      ulpin: baseUlpin,
      lat,
      lng,
      area: null,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to create parcel:", insertError);
    return null;
  }

  return created;
}

export async function getOrCreateBuilding(
  osmId: number,
  buildingName: string,
  floorCount: number,
  parcelId: number
) {
  const { data: existing, error: fetchError } = await supabase
    .from("buildings")
    .select("*")
    .eq("osm_id", osmId)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to look up building:", fetchError);
    return null;
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: insertError } = await supabase
    .from("buildings")
    .insert({
      osm_id: osmId,
      building_name: buildingName,
      floor_count: floorCount,
      parcel_id: parcelId,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to create building:", insertError);
    return null;
  }

  return created;
}

export async function getOrCreateFloors(
  buildingId: number,
  baseUlpin: string,
  floorCount: number,
  flagged: boolean
) {
  const existing = await getFloorsForBuilding(buildingId);

  if (existing.length > 0) {
    return existing;
  }

  const newFloors = Array.from({ length: floorCount }, (_, i) => ({
    building_id: buildingId,
    floor_number: i,
    floor_ulpin: generateFloorUlpin(baseUlpin, buildingId, i),
    flag: flagged,
  }));

  const { data, error } = await supabase
    .from("floors")
    .insert(newFloors)
    .select();

  if (error) {
    console.error("Failed to create floors:", error);
    return [];
  }

  return data;
}