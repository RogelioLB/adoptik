import { useState, useEffect } from "react";

interface AnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  animalInfo?: {
    name: string;
    age: string;
    breed: string;
    location: string;
    description: string;
  };
}

export default function AnimalModal({
  isOpen,
  onClose,
  animalInfo,
}: AnimalModalProps) {
  // Efecto para manejar el cierre con la tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Solo cerrar si se hace clic directamente en el backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto pointer-events-auto"
      onClick={handleBackdropClick}
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full my-8 overflow-hidden shadow-xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {animalInfo?.name || "Información de la Mascota"}
            </h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 rounded-full p-1"
              aria-label="Cerrar modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {animalInfo ? (
            <div className="space-y-4">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="/placeholder-animal.jpg"
                  alt={animalInfo.name}
                  className="w-full h-48 object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Edad</p>
                  <p className="font-medium">{animalInfo.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Raza</p>
                  <p className="font-medium">{animalInfo.breed}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Ubicación</p>
                  <p className="font-medium">{animalInfo.location}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Descripción</p>
                  <p className="mt-1">{animalInfo.description}</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                >
                  ¡Quiero adoptar!
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No hay información disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
