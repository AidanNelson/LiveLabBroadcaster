import { unsealData } from "iron-session/edge";
import { createVenue } from "../lib/venues";

export const POST = async (req) => {
  try {
    const cookie = req.cookies.get("vv-session");
    const decryptedSession = await unsealData(cookie.value, {
      password: "yourasdfasdfasdfasdfasdfasdfasdfasdfasdf-password",
    });

    console.log("trying to create venue with session: ", decryptedSession);
    const parsed = JSON.parse(decryptedSession);
    const { id } = parsed;
    console.log("id:", id);
    if (!id) {
      throw new Error("You need to log in to create a venue.");
    }

    const { venueId } = await req.json();
    console.log({ venueId });
    await createVenue({ venueId, userId: id });
    return Response.json({ done: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
