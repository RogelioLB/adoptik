import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.json();
    const { email, password, username } = formData;

    if (!email || !password || !username) {
      return new Response(
        JSON.stringify({
          error:
            "Correo electrónico, nombre de usuario y contraseña son obligatorios",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if username already exists
    const { data: existingUser, error: usernameError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "El nombre de usuario ya está en uso" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: username,
        },
      },
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      return new Response(JSON.stringify({ error: signUpError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return redirect("/login");
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
