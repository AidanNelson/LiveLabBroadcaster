import { deleteFeature } from "../../lib/stage";
import { getIdFromSession } from "../../../cookies";

export const POST = async (req, { params }) => {
  try {
    const {id} = await getIdFromSession(req);
    
    console.log("id:", id);

    
    if (!id) {
      throw new Error("You need to log in to perform this action.");
    }

    const { stageId } = params;
    const { featureId } = await req.json();
    console.log({ stageId, featureId });


    await deleteFeature({ stageId, userId: id, featureId });


    return Response.json({ done: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
