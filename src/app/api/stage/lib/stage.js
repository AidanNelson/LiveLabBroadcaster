import { getStagesDatabase } from "../../../../../shared/db";

export const createDefaultStageDoc = ({ stageId, userId }) => {
  return {
    stageId,
    creator: userId,
    editors: [userId],
    name: stageId,
    description: "",
    urlSlug: stageId,
    features: [],
    cues: [],
    staticFiles: [],
  };
};

export const getStageDoc = async ({ stageId }) => {
  const { db } = await getStagesDatabase();
  const stageDoc = db.data.stages.find((el) => el.stageId === stageId)
  return stageDoc ? stageDoc : null;
};

export const createNewStageDocument = async ({ stageId, userId }) => {
  const existingVenue = await getStageDoc({ stageId });

  if (!existingVenue) {
    const { db } = await getStagesDatabase();
    const doc = createDefaultStageDoc({stageId, userId});
    db.data.stages.push(doc);
    db.write();
  } else {
    throw new Error(`Stage with ID ${stageId} already exists`);
  }
};

export const updateStage = async ({ stageId, userId, updatedStageDoc }) => {
  const existingStage = await getStageDoc({ stageId });

  if (!existingStage.editors.includes(userId)) {
    throw new Error("User not editor of this venue");
  } else {
    // we can't update the document _id or it will throw an error
    delete updatedStageDoc["_id"];
    
    const { db } = await getStagesDatabase();
    const docIndex = db.data.stages.findIndex((el) => el.stageId === stageId);
    db.data.stages[docIndex] = {...db.data.stages[docIndex], ...updatedStageDoc}
    db.write();
    // const stageDoc = db.data.stages.find((el) => el.stageId === stageId)
    // const stagesCollection = db.collection("stages");
    // stageDoc = {...stageDoc, ...updatedStageDoc};
    // const result = await stagesCollection.replaceOne(
    //   { _id: existingStage._id },
    //   updatedStageDoc,
    // );
  }
};

export const updateFeature = async ({
  stageId,
  userId,
  updatedFeatureInfo,
}) => {
  console.log('updating feature:', {stageId, userId, updatedFeatureInfo})
  const existingStageDoc = await getStageDoc({ stageId });
  console.log({existingStageDoc})

  if (!existingStageDoc.editors.includes(userId)) {
    throw new Error("User not editor of this venue");
  } else {
    const existingFeatureIndex = existingStageDoc.features.findIndex(
      (x) => x.id === updatedFeatureInfo.id,
    );
    console.log({existingFeatureIndex})
    if (existingFeatureIndex >= 0) {
      existingStageDoc.features[existingFeatureIndex] = updatedFeatureInfo;
      console.log(existingStageDoc);
      updateStage({ stageId, userId, updatedStageDoc: existingStageDoc });
    } else {
      //
      throw new Error("Document doesn't exist.")
    }
  }
};
