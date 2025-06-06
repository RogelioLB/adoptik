// src/pages/api/update-request-status.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No estás autorizado para realizar esta acción",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verify admin role
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (!userProfile || userProfile.role !== "Admin") {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "No tienes permisos de administrador para realizar esta acción",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get request body
    const body = await request.json();
    const { requestId, status } = body;

    if (!requestId || !status) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Faltan datos requeridos",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate status
    const validStatuses = ["En proceso", "Aceptada", "Rechazada"];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Estado no válido",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update request status
    const { data, error } = await supabase
      .from("adoption_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // If approved, update animal availability status
    if (status === "Aceptada") {
      // First get the animal id from the request
      const { data: requestData } = await supabase
        .from("adoption_requests")
        .select("animal_id")
        .eq("id", requestId)
        .single();

      if (requestData && requestData.animal_id) {
        // Update the animal to be unavailable
        await supabase
          .from("animals")
          .update({ status: null })
          .eq("id", requestData.animal_id);

        // Reject all other pending requests for this animal
        await supabase
          .from("adoption_requests")
          .update({ status: "Rechazada" })
          .eq("animal_id", requestData.animal_id)
          .neq("id", requestId)
          .eq("status", "En proceso");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Estado actualizado correctamente",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating request status:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error del servidor al procesar la solicitud",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
