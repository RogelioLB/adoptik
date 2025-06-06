import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = 5;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit - 1;
  const { data: fetchedVideos } = await supabase
    .from("videos") // Query the 'videos' table
    .select(
      `
      id,         
      video_url,   
      likes,
      shares,
      animals (    
        id,
        name,        
        age,       
        species,   
        description,
        image_url 
      )
    `
    )
    .range(startIndex, endIndex);
  if (!fetchedVideos) return new Response(JSON.stringify([]), { status: 200 });
  return new Response(
    JSON.stringify(
      fetchedVideos.map((video) => {
        const animalData = video.animals; // Access the joined animal data
        return {
          id: video.id.toString(),
          src: video.video_url || "/videos/default.mp4",
          likes: video.likes || 0,
          comments: 0, // 'videos' table does not have a comments field
          shares: video.shares || 0,
          animalInfo: animalData
            ? {
                id: animalData.id,
                name: animalData.name || "Nombre no disponible",
                // Ensure age is formatted as a string if it's a number
                age:
                  animalData.age !== null && animalData.age !== undefined
                    ? animalData.age.toString() + " años"
                    : "Edad no disponible",
                breed: animalData.species || "Especie no disponible", // Using species as breed
                location: "Ubicación no disponible", // 'animals' table does not have location
                description:
                  animalData.description || "Descripción no disponible",
                image_url: animalData.image_url || "/placeholder-animal.jpg",
              }
            : {
                name: "Información del animal no disponible",
                age: "Edad no disponible",
                breed: "Especie no disponible",
                location: "Ubicación no disponible",
                description: "Descripción no disponible",
                image_url: "/placeholder-animal.jpg",
              },
        };
      })
    ),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
