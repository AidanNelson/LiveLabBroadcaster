import { getVenue } from "../../lib/venues";

export const GET = async (req, { params }) => {
  try {
    const { venueId } = params;
    console.log({ venueId });
    const venueInfo = await getVenue({ venueId });
    if (!venueInfo) {
      throw new Error("No venue found");
    }
    return Response.json(venueInfo, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
