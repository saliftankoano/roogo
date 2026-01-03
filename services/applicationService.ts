import { supabase } from "../lib/supabase";

export interface ApplicationResult {
  success: boolean;
  error?: string;
}

/**
 * Submit an application for a property
 */
export async function submitApplication(
  propertyId: string,
  userId: string
): Promise<ApplicationResult> {
  try {
    // 1. Check if application already exists
    const { data: existing, error: checkError } = await supabase
      .from("applications")
      .select("id")
      .eq("property_id", propertyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) {
      return {
        success: false,
        error: "Vous avez déjà postulé à cette annonce.",
      };
    }

    // 2. Insert application
    const { error: insertError } = await supabase.from("applications").insert({
      property_id: propertyId,
      user_id: userId,
      status: "pending",
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return {
          success: false,
          error: "Vous avez déjà postulé à cette annonce.",
        };
      }
      throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting application:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Une erreur est survenue.",
    };
  }
}

/**
 * Book an open house slot
 */
export async function bookOpenHouseSlot(
  slotId: string,
  userId: string
): Promise<ApplicationResult> {
  try {
    const { error } = await supabase.from("open_house_bookings").insert({
      slot_id: slotId,
      user_id: userId,
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Vous avez déjà réservé ce créneau." };
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error booking slot:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Une erreur est survenue.",
    };
  }
}
