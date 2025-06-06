import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("Name-and-last-name");
  const age = formData.get("Age");
  const curp = formData.get("curp");
  const address = formData.get("Adress");
  const number = formData.get("Number");
  const email = formData.get("Email");
  const familySize = formData.get("Family-size");
  const house = formData.get("vivienda");
  const typeHouse = formData.get("tipov");
  const agreeTerms = formData.get("agreeTerms");
  const animalId = formData.get("animalId");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data, error } = await supabase.from("adoption_requests").insert([
    {
      "Name-and-last-name": name,
      Age: age,
      curp,
      Adress: address,
      Number: number,
      Email: email,
      "Family-size": familySize,
      House: house,
      "Type-house": typeHouse,
      agreeTerms: agreeTerms,
      user_id: session?.user.id,
      animal_id: Number(animalId),
    },
  ]);

  //Redirect to form with error message
  if (error) {
    return new Response("", {
      status: 302,
      headers: {
        Location: `/formulario/${animalId}?error=${error.message}`,
      },
    });
  }

  return new Response("", {
    status: 302,
    headers: {
      Location: `/formulario/exito?animalId=${animalId}`,
    },
  });
};
