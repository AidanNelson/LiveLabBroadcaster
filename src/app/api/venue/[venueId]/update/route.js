import { unsealData } from "iron-session/edge";
import { updateVenue } from "../../lib/venues";

export const POST = async (req, { params }) => {
  try {
    const cookie = req.cookies.get("vv-session");
    const decryptedSession = await unsealData(cookie.value, {
      password: "yourasdfasdfasdfasdfasdfasdfasdfasdfasdf-password",
    });

    console.log("UPDATING VENUE ");
    const parsed = JSON.parse(decryptedSession);
    const { id } = parsed;
    console.log("id:", id);
    if (!id) {
      throw new Error("You need to log in to create a venue.");
    }

    const { venueId } = params;
    const { updatedVenueInfo } = await req.json();
    console.log({ venueId, updatedVenueInfo });
    await updateVenue({ venueId, userId: id, updatedVenueInfo });
    return Response.json({ done: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};