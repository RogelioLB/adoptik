import React from "react";
import type { AdoptionRequest } from "./PeticionesTable";

interface PeticionModalProps {
  isOpen: boolean;
  onClose: () => void;
  peticion: AdoptionRequest;
}

export default function PeticionModal({
  isOpen,
  onClose,
  peticion,
}: PeticionModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En proceso":
        return "text-yellow-600";
      case "Aceptada":
        return "text-green-600";
      case "Rechazada":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto text-black">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            Detalles de la Petición
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700">
                Información del Solicitante
              </h4>
              <p>
                <span className="font-medium">Nombre:</span>{" "}
                {peticion.profiles?.name || "No disponible"}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {peticion.profiles?.email || "No disponible"}
              </p>
              <p>
                <span className="font-medium">Teléfono:</span>{" "}
                {peticion.phone_number || "No disponible"}
              </p>
              <p>
                <span className="font-medium">Dirección:</span>{" "}
                {peticion.address || "No disponible"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">
                Información del Animal
              </h4>
              <p>
                <span className="font-medium">Nombre:</span>{" "}
                {peticion.animals?.name || "No disponible"}
              </p>
              <p>
                <span className="font-medium">Especie:</span>{" "}
                {peticion.animals?.species || "No disponible"}
              </p>
              <p>
                <span className="font-medium">Raza:</span>{" "}
                {peticion.animals?.breed || "No disponible"}
              </p>
              <p>
                <span className="font-medium">Edad:</span>{" "}
                {peticion.animals?.age || "No disponible"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-700">
              Detalles de la Solicitud
            </h4>
            <p>
              <span className="font-medium">ID de Solicitud:</span> #
              {peticion.id}
            </p>
            <p>
              <span className="font-medium">Fecha de Solicitud:</span>{" "}
              {new Date(peticion.created_at).toLocaleDateString("es-ES")}
            </p>
            <p>
              <span className="font-medium">Estado:</span>
              <span className={getStatusColor(peticion.status)}>
                {peticion.status}
              </span>
            </p>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-700">Motivo de Adopción</h4>
            <p className="text-gray-700">
              {peticion.adoption_reason || "No se proporcionó un motivo"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
