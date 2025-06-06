import { useState } from "react";

interface AdoptionRequestFormProps {
  animalId: string;
  userId: string;
  animalName: string;
  userName: string;
  userEmail: string;
}

const AdoptionRequestForm = ({
  animalId,
  userId,
  animalName,
  userName,
  userEmail,
}: AdoptionRequestFormProps) => {
  const [formData, setFormData] = useState({
    Number: "",
    Adress: "",
    Age: "",
    curp: "",
    Email: userEmail || "",
    "Family-size": "",
    House: "",
    "Name-and-last-name": userName || "",
    "Type-house": "",
    agreeTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.Number) newErrors.Number = "Número de teléfono es requerido";
    if (!formData.Adress) newErrors.Adress = "Dirección es requerida";
    if (!formData["Name-and-last-name"])
      newErrors["Name-and-last-name"] = "Nombre completo es requerido";
    if (!formData.Age) newErrors.Age = "Edad es requerida";
    if (!formData.House)
      newErrors.House = "Información sobre la vivienda es requerida";
    if (!formData["Type-house"])
      newErrors["Type-house"] = "Tipo de casa es requerido";
    if (!formData.agreeTerms)
      newErrors.agreeTerms = "Debe aceptar los términos para continuar";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Create a new adoption request
      const { data, error } = await supabase
        .from("adoption_requests")
        .insert([
          {
            animal_id: animalId,
            user_id: userId,
            status: "Pendiente",
            Number: formData.Number,
            Adress: formData.Adress,
            Age: parseInt(formData.Age),
            curp: formData.curp,
            Email: formData.Email,
            "Family-size": parseInt(formData["Family-size"]),
            House: formData.House,
            "Name-and-last-name": formData["Name-and-last-name"],
            "Type-house": formData["Type-house"],
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      setSubmitStatus({
        success: true,
        message: "Solicitud enviada correctamente. Te contactaremos pronto.",
      });

      // Reset form data
      setFormData({
        Number: "",
        Adress: "",
        Age: "",
        curp: "",
        Email: userEmail || "",
        "Family-size": "",
        House: "",
        "Name-and-last-name": userName || "",
        "Type-house": "",
        agreeTerms: false,
      });

      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        window.location.href = `/solicitudes?success=true&animalId=${animalId}`;
      }, 3000);
    } catch (error) {
      console.error("Error submitting adoption request:", error);
      setSubmitStatus({
        success: false,
        message: `Error al enviar la solicitud: ${
          error.message || "Inténtalo de nuevo más tarde"
        }`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {submitStatus && (
        <div
          className={`mb-6 p-4 rounded-md ${
            submitStatus.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <p
            className={`font-bold ${
              submitStatus.success ? "text-green-700" : "text-red-700"
            }`}
          >
            {submitStatus.success ? "¡Éxito!" : "Error"}
          </p>
          <p>{submitStatus.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-purple-700 border-b pb-2 mb-4">
            Datos del solicitante
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="Name-and-last-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre completo *
              </label>
              <input
                type="text"
                id="Name-and-last-name"
                name="Name-and-last-name"
                value={formData["Name-and-last-name"]}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition ${
                  errors["Name-and-last-name"]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors["Name-and-last-name"] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors["Name-and-last-name"]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="Email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico *
              </label>
              <input
                type="email"
                id="Email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
              />
            </div>

            <div>
              <label
                htmlFor="Number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Teléfono *
              </label>
              <input
                type="tel"
                id="Number"
                name="Number"
                value={formData.Number}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition ${
                  errors.Number ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ej: 5551234567"
              />
              {errors.Number && (
                <p className="mt-1 text-sm text-red-600">{errors.Number}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="Age"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Edad *
              </label>
              <input
                type="number"
                id="Age"
                name="Age"
                value={formData.Age}
                onChange={handleChange}
                min="18"
                max="99"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition ${
                  errors.Age ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.Age && (
                <p className="mt-1 text-sm text-red-600">{errors.Age}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="curp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              CURP
            </label>
            <input
              type="text"
              id="curp"
              name="curp"
              value={formData.curp}
              onChange={handleChange}
              maxLength="18"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
              placeholder="Clave Única de Registro de Población"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="Adress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dirección *
            </label>
            <input
              type="text"
              id="Adress"
              name="Adress"
              value={formData.Adress}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition ${
                errors.Adress ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.Adress && (
              <p className="mt-1 text-sm text-red-600">{errors.Adress}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-700 border-b pb-2 mb-4">
            Información sobre vivienda
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="House"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Describe tu vivienda (espacio disponible, jardín, etc.) *
              </label>
              <textarea
                id="House"
                name="House"
                value={formData.House}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition ${
                  errors.House ? "border-red-500" : "border-gray-300"
                }`}
              ></textarea>
              {errors.House && (
                <p className="mt-1 text-sm text-red-600">{errors.House}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="Type-house"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo de vivienda *
              </label>
              <select
                id="Type-house"
                name="Type-house"
                value={formData["Type-house"]}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition ${
                  errors["Type-house"] ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccionar...</option>
                <option value="Casa">Casa</option>
                <option value="Departamento">Departamento</option>
                <option value="Casa con jardín">Casa con jardín</option>
                <option value="Casa con patio">Casa con patio</option>
                <option value="Otro">Otro</option>
              </select>
              {errors["Type-house"] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors["Type-house"]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="Family-size"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Número de personas en el hogar
              </label>
              <input
                type="number"
                id="Family-size"
                name="Family-size"
                value={formData["Family-size"]}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                Acepto los términos y condiciones para la adopción *
              </label>
              {errors.agreeTerms && (
                <p className="text-red-600 mt-1">{errors.agreeTerms}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className={`text-purple-500 focus:ring-purple-300 ${
                errors.agreeTerms ? "border-red-500" : ""
              }`}
            />
            <span className="ml-2 text-sm text-gray-700">
              Acepto los términos y condiciones y confirmo que la información
              proporcionada es correcta *
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-1/2 py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-md hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "Enviando..." : "Enviar solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdoptionRequestForm;
