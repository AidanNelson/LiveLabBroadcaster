import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import { getStagesDatabase, updateStageDoc, updateFeature } from "../db.js";

import * as crypto from "node:crypto";
const express = require("express");
export const stageRouter = express.Router();

stageRouter.post("/test", function (req, res, next) {
  console.log(req.user);
  res.status(200).done();
});

stageRouter.post("/create", async function (req, res, next) {
  console.log(req.user);
  const userId = req.user.id;
  const stageId = crypto.randomUUID();

  const { name } = req.body;
  const stage = {
    id: stageId,
    creator: userId,
    editors: [userId],
    name: name,
    description: "",
    urlSlug: stageId,
    features: [],
    cues: [],
    staticFiles: [],
  };

  const { db } = await getStagesDatabase();
  db.data.stages.push(stage);
  db.write();

  res.status(200).json({ id: stageId });
});

stageRouter.post("/:stageId/update", async function (req, res, next) {
  const { stageId } = req.params;
  console.log(req.params);

  const userId = req.user.id;

  const { update } = req.body;

  const err = await updateStageDoc({ stageId, userId, update });
  console.log(err);
  if (err) {
    res.status(500).json({ error: err.message });
  }

  return res.status(200).json({ done: true });
});

stageRouter.post(
  "/:stageId/:featureId/update",
  async function (req, res, next) {
    const { stageId, featureId } = req.params;

    const userId = req.user.id;

    const { update } = req.body;

    const err = await updateFeature({ stageId, featureId, userId, update });
    console.log(err);
    if (err) {
      res.status(500).json({ error: err.message });
    }

    return res.status(200).json({ done: true });
  },
);

// export const updateFeature = async ({
//   stageId,
//   userId,
//   updatedFeatureInfo,
// }) => {
//   console.log('updating feature:', {stageId, userId, updatedFeatureInfo})
//   const existingStageDoc = await getStageDoc({ stageId });
//   console.log({existingStageDoc})

//   if (!existingStageDoc.editors.includes(userId)) {
//     throw new Error("User not editor of this venue");
//   } else {
//     const existingFeatureIndex = existingStageDoc.features.findIndex(
//       (x) => x.id === updatedFeatureInfo.id,
//     );
//     console.log({existingFeatureIndex})
//     if (existingFeatureIndex >= 0) {
//       existingStageDoc.features[existingFeatureIndex] = updatedFeatureInfo;
//       console.log(existingStageDoc);
//       updateStage({ stageId, userId, updatedStageDoc: existingStageDoc });
//     } else {
//       //
//       throw new Error("Document doesn't exist.")
//     }
//   }
// };
