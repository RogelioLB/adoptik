// File: c:/Users/rogel/Documents/adoptik/src/pages/api/animales/editAnimal.ts
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase"; // Adjust path if necessary

export const POST: APIRoute = async ({ request }) => {
  // Optional: Add admin/role check here if not handled by middleware
  // const { data: { session } } = await supabase.auth.getSession();
  // if (!session || session.user.role !== 'admin') { // Example role check
  //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  // }

  const formData = await request.formData();
  const action = formData.get("action")?.toString();
  const animalIdStr = formData.get("animalId")?.toString();

  if (!animalIdStr || isNaN(parseInt(animalIdStr))) {
    return new Response(JSON.stringify({ error: "ID de animal inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const animalId = parseInt(animalIdStr);

  if (action === "updateDescription") {
    const description = formData.get("description")?.toString();
    // Allow empty string for description, but not undefined
    if (description === undefined) {
      return new Response(
        JSON.stringify({ error: "Descripción no proporcionada." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error: updateError } = await supabase
      .from("animals")
      .update({ description })
      .eq("id", animalId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating description via API:", updateError);
      return new Response(
        JSON.stringify({
          error: `Error al actualizar descripción: ${updateError.message}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Descripción actualizada con éxito.",
        animal: data,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } else if (action === "uploadVideo") {
    const newVideoFile = formData.get("newVideoFile") as File;

    if (!newVideoFile || newVideoFile.size === 0) {
      return new Response(
        JSON.stringify({ error: "Archivo de video no proporcionado o vacío." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const bucketName = "animalvideos";
    // Sanitize filename further if necessary, though Supabase handles most of it.
    const fileName = `${animalId}/${Date.now()}_${newVideoFile.name.replace(
      /[^a-zA-Z0-9_.-]/g,
      "_"
    )}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, newVideoFile, {
        cacheControl: "3600",
        upsert: false, // Set to true if you want to allow overwriting existing files with the same name
      });

    if (uploadError) {
      console.error("Error uploading video file via API:", uploadError);
      return new Response(
        JSON.stringify({
          error: `Error al subir el video: ${uploadError.message}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error("Error getting public URL for video via API");
      // Consider deleting the uploaded file from storage if this step fails
      // await supabase.storage.from(bucketName).remove([fileName]);
      return new Response(
        JSON.stringify({
          error:
            "Error al obtener la URL pública del video después de subirlo.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const videoUrlToStore = publicUrlData.publicUrl;
    const { data: newVideoEntry, error: insertError } = await supabase
      .from("videos")
      .insert({ animal_id: animalId, video_url: videoUrlToStore })
      .select()
      .single();

    if (insertError) {
      console.error(
        "Error inserting video URL into database via API:",
        insertError
      );
      // Important: If DB insert fails, the file is already in storage.
      // You might want to implement a cleanup mechanism (e.g., remove the file from storage).
      // await supabase.storage.from(bucketName).remove([fileName]);
      return new Response(
        JSON.stringify({
          error: `Error al guardar la referencia del video en la base de datos: ${insertError.message}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Video subido y añadido con éxito.",
        video: newVideoEntry,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } else {
    return new Response(
      JSON.stringify({ error: "Acción no válida o no proporcionada." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
};
