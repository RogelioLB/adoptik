import { MdPets } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { TbLockPassword } from "react-icons/tb";
import { toast, ToastContainer } from "react-toastify";

export default function Login() {
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    if (!email) return toast.error("Correo es obligatorio");
    if (!password) return toast.error("Contraseña es obligatoria");

    const response = await fetch("/api/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      return toast.success("Inicio de sesión exitoso");
    } else {
      switch (await response.text()) {
        case "Invalid login credentials":
          return toast.error("Correo o contraseña incorrectos");
        default:
          return toast.error("Error al iniciar sesión");
      }
    }
  };

  return (
    <>
      <div className="h-screen flex flex-col bg-white">
        <div className="p-16 flex-1">
          <main className="flex flex-col items-center justify-center h-full bg-gray-100 max-w-xl mx-auto text-black shadow-sm shadow-black/30 rounded-xl">
            <form onSubmit={handleLogin}>
              <div className="flex items-center gap-2 bg-white justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <i className="text-2xl">
                    <MdPets />
                  </i>
                </div>
                <h1 className="font-bold text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Adoptik
                </h1>
              </div>
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 pointer-events-auto"></div>
              <div className="absolute right-3 bottom-[20%] flex flex-col gap-5"></div>
              <div className="hidden md:flex fixed top-1/2 left-4 right-4 justify-between z-20 pointer-events-none"></div>

              <h1 className="text-center w-full mb-3 font-bold text-3xl p-4">
                Inicio De Sesion
              </h1>
              <h2 className="font-bold text-sm my-2">Correo</h2>
              <div className="flex items-center shadow-xs shadow-black/30 rounded-xl ">
                <div className="bg-slate-400 p-4 aspect-square h-full text-2xl rounded-tl-xl rounded-bl-xl">
                  <CgProfile />
                </div>
                <input
                  className="p-4 text-sm outline-0 bg-white rounded-br-xl rounded-tr-xl"
                  type="text"
                  placeholder="Ingresa el usuario"
                  name="email"
                />
              </div>
              <h2 className="font-bold text-sm my-2">Contraseña</h2>
              <div className="flex items-center shadow-xs shadow-black/30 rounded-xl">
                <div className="bg-slate-400 p-4 aspect-square h-full text-2xl rounded-tl-xl rounded-bl-xl">
                  <TbLockPassword />
                </div>
                <input
                  className="p-4 text-sm outline-0 bg-white rounded-br-xl rounded-tr-xl"
                  type="password"
                  placeholder="Ingresa la contraseña "
                  name="password"
                />
              </div>

              <button className="p-4 border border-black text-center w-full mt-4 hover:bg-black hover:text-white transition-colors hover:cursor-pointer bg-white rounded-sm">
                Iniciar Sesion
              </button>
              <div className="text-center p-4 text-blue-600">
                <a href="">Crear cuenta</a>
              </div>
            </form>
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
