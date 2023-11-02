import { getIdfromSession } from "@/app/api/cookies";
import { updateStage } from "../../lib/stage";

export const POST = async (req, { params }) => {
  try {

    const { id } = getIdfromSession(req);
    if (!id) {
      throw new Error("You need to log in to perform this action.");
    }

    const { stageId } = params;
    const { updatedStageDoc } = await req.json();
    console.log({ stageId, updatedStageDoc });
    await updateStage({ stageId, userId: id, updatedStageDoc });
    return Response.json({ done: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
