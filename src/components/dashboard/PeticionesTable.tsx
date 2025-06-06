import { useState } from "react";
import PeticionModal from "./PeticionModal";
import { toast } from "react-toastify";

export interface Animal {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: string;
  image_url?: string;
}

export interface Profile {
  id: number;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AdoptionRequest {
  id: number;
  user_id: string;
  animal_id: number;
  status: string;
  created_at: string;
  phone_number?: string;
  address?: string;
  adoption_reason?: string;
  animals: Animal | null;
  profiles: Profile | null;
}

interface PeticionesTableProps {
  peticiones: AdoptionRequest[];
}

const statusOptions = ["En proceso", "Aceptada", "Rechazada"];

export default function PeticionesTable({ peticiones }: PeticionesTableProps) {
  const [selectedRequest, setSelectedRequest] =
    useState<AdoptionRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusChanges, setStatusChanges] = useState<Record<number, string>>(
    {}
  );

  const handleStatusChange = (requestId: number, newStatus: string) => {
    console.log(requestId, newStatus);
    setStatusChanges({
      ...statusChanges,
      [requestId]: newStatus,
    });
  };

  const handleSaveStatus = async (requestId: number) => {
    if (!statusChanges[requestId]) return;

    try {
      const response = await fetch("/api/update-request-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          status: statusChanges[requestId],
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Estado actualizado con éxito");
        // Remove from status changes since it's now saved
        const newStatusChanges = { ...statusChanges };
        delete newStatusChanges[requestId];
        setStatusChanges(newStatusChanges);
      } else {
        toast.error(`Error al actualizar: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado. Inténtalo de nuevo.");
    }
  };

  const openModal = (request: AdoptionRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Solicitante
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Animal
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {peticiones.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay peticiones de adopción registradas.
                  </td>
                </tr>
              ) : (
                peticiones.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.profiles?.name || "Usuario sin nombre"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.profiles?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {request.animals?.image_url && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={request.animals.image_url}
                              alt={request.animals?.name}
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.animals?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.animals?.species}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="block text-black w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 rounded leading-tight focus:outline-none focus:border-blue-500 text-sm"
                        value={statusChanges[request.id] || request.status}
                        onChange={(e) =>
                          handleStatusChange(request.id, e.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => openModal(request)}
                      >
                        Ver detalles
                      </button>
                      {statusChanges[request.id] && (
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-xs"
                          onClick={() => handleSaveStatus(request.id)}
                        >
                          Guardar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <PeticionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          peticion={selectedRequest}
        />
      )}
    </>
  );
}
