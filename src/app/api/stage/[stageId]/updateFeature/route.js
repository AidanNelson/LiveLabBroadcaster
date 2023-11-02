import { updateFeature } from "../../lib/stage";
import { getIdfromSession } from "@/app/api/cookies";

export const POST = async (req, { params }) => {
  try {
    const {id} = getIdfromSession(req);
    console.log("id:", id);
    if (!id) {
      throw new Error("You need to log in to perform this action.");
    }

    const { stageId } = params;
    const { updatedFeatureInfo } = await req.json();
    console.log({ stageId, updatedFeatureInfo });
    await updateFeature({ stageId, userId: id, updatedFeatureInfo });
    return Response.json({ done: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
