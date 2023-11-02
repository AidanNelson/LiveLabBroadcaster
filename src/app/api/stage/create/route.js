import { createNewStageDocument } from "../lib/stage";
import { getIdFromSession } from "../../cookies";

export const POST = async (req) => {
  try {
    const { id } = await getIdFromSession(req);

    if (!id) {
      throw new Error("You need to log in to perform this action.");
    }

    const { stageId } = await req.json();
    await createNewStageDocument({ stageId, userId: id });
    return Response.json({ done: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
