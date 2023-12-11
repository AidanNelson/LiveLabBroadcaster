import { getStageDocument } from "../../lib/stage";

export const GET = async (req, { params }) => {
  try {
    const { stageId } = params;
    console.log({ stageId });
    const stageDocument = await getStageDocument({ stageId });
    if (!stageDocument) {
      throw new Error("No stage found.");
    }
    return Response.json(stageDocument, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
