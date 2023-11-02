
import { getIdfromSession } from "@/app/api/cookies";

export const POST = async (req) => {
  try {
   const {id} = getIdfromSession(req);
   
    if (!id) {
      throw new Error("You need to log in to add a feature.");
    }

    const { stageId } = await req.json();

    await createFeature({ stageId, userId: id });
    return Response.json({ done: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
