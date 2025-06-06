import { useState, useEffect, type FormEvent } from "react";
// import type { SupabaseClient } from "@supabase/supabase-js"; // No longer needed directly
import type { Database } from "../../database.types"; // Adjust path as needed

type Animal = Database["public"]["Tables"]["animals"]["Row"];
type Video = Database["public"]["Tables"]["videos"]["Row"];

interface AnimalEditorProps {
  initialAnimalData: Animal | null;
  initialVideosData: Video[];
  animalId: number;
  // supabase: SupabaseClient<Database>; // Supabase client no longer passed as prop
  // Optional: pass user if needed for specific client-side checks, though auth is server-side for page access
  // user: User | null;
}

export default function AnimalEditor({
  initialAnimalData,
  initialVideosData,
  animalId,
}: // supabase, // Removed prop
AnimalEditorProps) {
  const [animal, setAnimal] = useState<Animal | null>(initialAnimalData);
  const [description, setDescription] = useState(
    initialAnimalData?.description || ""
  );
  const [videos, setVideos] = useState<Video[]>(initialVideosData);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);

  const [isLoadingDesc, setIsLoadingDesc] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setAnimal(initialAnimalData);
    setDescription(initialAnimalData?.description || "");
    setVideos(initialVideosData);
  }, [initialAnimalData, initialVideosData]);

  const handleDescriptionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!animal) return;
    setIsLoadingDesc(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("action", "updateDescription");
    formData.append("animalId", animalId.toString());
    formData.append("description", description);

    try {
      const response = await fetch("/api/animales/editAnimal", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar descripción.");
      }

      setSuccessMessage(result.message || "Descripción actualizada con éxito.");
      // Assuming the API returns the updated animal object or at least confirms the new description
      setAnimal((prev) =>
        prev
          ? { ...prev, description: result.animal?.description ?? description }
          : null
      );
    } catch (err: any) {
      setError(err.message || "Ocurrió un error desconocido.");
    }
    setIsLoadingDesc(false);
  };

  const handleVideoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newVideoFile) {
      setError("Por favor, selecciona un archivo de video.");
      return;
    }
    if (!animal) return;

    setIsLoadingVideo(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("action", "uploadVideo");
    formData.append("animalId", animalId.toString());
    formData.append("newVideoFile", newVideoFile);

    try {
      const response = await fetch("/api/animales/editAnimal", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al subir el video.");
      }

      setSuccessMessage(result.message || "Video subido y añadido con éxito.");
      if (result.video) {
        setVideos((prev) => [...prev, result.video as Video]);
      }
      setNewVideoFile(null);
      const fileInput = document.getElementById(
        "new_video_file"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setError(
        err.message || "Ocurrió un error desconocido al subir el video."
      );
    }
    setIsLoadingVideo(false);
  };

  if (!animal) {
    // This case should ideally be handled by the Astro page before rendering this component
    // or the Astro page can show a global error if initialAnimalData is null.
    return (
      <p className="text-red-500">
        No se pudieron cargar los datos del animal.
      </p>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>{" "}
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Éxito:</strong>{" "}
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center md:items-start">
        <div className="w-40 h-40 md:w-48 md:h-48 mb-6 md:mb-0 md:mr-8 flex-shrink-0">
          <img
            src={animal.image_url || "/placeholder-animal.jpg"}
            alt={`Foto de ${animal.name}`}
            className="w-full h-full rounded-full object-cover border-4 border-gray-200 shadow-md"
          />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {animal.name}
          </h1>
          <p className="text-md text-gray-600 mb-1">
            <strong>Especie:</strong> {animal.species || "No especificado"}
          </p>
          <p className="text-md text-gray-600 mb-4">
            <strong>Edad:</strong>{" "}
            {animal.age ? `${animal.age} años` : "No especificada"}
          </p>

          <form onSubmit={handleDescriptionSubmit} className="mb-8">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripción:
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border-2 text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 ease-in-out"
            />
            <button
              type="submit"
              disabled={isLoadingDesc}
              className="mt-3 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50"
            >
              {isLoadingDesc ? "Guardando..." : "Guardar Descripción"}
            </button>
          </form>
        </div>
      </div>

      <hr className="my-8 border-gray-300" />

      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Videos del Animal
        </h2>
        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 ">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-100 p-3 rounded-lg shadow">
                {video.video_url && video.video_url.includes("youtube.com") ? (
                  <iframe
                    className="h-48 rounded-md"
                    src={`https://www.youtube.com/embed/${
                      video.video_url.split("v=")[1]?.split("&")[0] ||
                      video.video_url.split("/").pop()
                    }`}
                    title={`Video de ${animal?.name}`}
                    style={{ border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : video.video_url &&
                  (video.video_url.endsWith(".mp4") ||
                    video.video_url.endsWith(".webm") ||
                    video.video_url.endsWith(".ogg")) ? (
                  <video controls className="w-full rounded-md aspect-[9/16]">
                    <source
                      src={video.video_url}
                      type={`video/${video.video_url.split(".").pop()}`}
                    />
                    Tu navegador no soporta el tag de video.
                  </video>
                ) : (
                  <a
                    href={video.video_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-600 hover:text-yellow-700 underline break-all"
                  >
                    Ver Video (Enlace)
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mb-6">
            No hay videos disponibles para este animal.
          </p>
        )}

        <form
          onSubmit={handleVideoSubmit}
          className="bg-gray-50 p-4 rounded-lg shadow"
        >
          <h3 className="text-xl font-medium text-gray-700 mb-3">
            Subir Nuevo Video
          </h3>
          <label
            htmlFor="new_video_file"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Archivo de Video:
          </label>
          <input
            type="file"
            id="new_video_file"
            name="new_video_file"
            onChange={(e) =>
              setNewVideoFile(e.target.files ? e.target.files[0] : null)
            }
            className="w-full p-2 border-2 border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 transition duration-150 ease-in-out mb-3"
            accept="video/mp4,video/webm,video/ogg,.mkv"
          />
          <p className="text-xs text-gray-500 mb-3">
            Sube un archivo de video (MP4, WebM, Ogg, MKV). El archivo se
            guardará en el almacenamiento del proyecto.
          </p>
          <button
            type="submit"
            disabled={isLoadingVideo}
            className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50"
          >
            {isLoadingVideo ? "Subiendo..." : "Añadir Video"}
          </button>
        </form>
      </div>
    </div>
  );
}
