import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import {
  getStagesDatabase,
  updateStageDoc,
  updateFeature,
  getStageInfoFromSlug,
} from "../db.js";

import * as crypto from "node:crypto";
const express = require("express");
export const stageRouter = express.Router();

stageRouter.get("/idFromSlug/:urlSlug", async function (req, res, next) {
  const { urlSlug } = req.params;
  const info = await getStageInfoFromSlug({ urlSlug });
  if (info) {
    res.status(200).json({ stageId: info.id });
  } else {
    res.status(500).json({ error: "No stage found." });
  }
});
stageRouter.post("/create", async function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ error: "You need to log in to perform this action." });
  }
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
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ error: "You need to log in to perform this action." });
  }

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
    if (!req.isAuthenticated()) {
      return res
        .status(401)
        .json({ error: "You need to log in to perform this action." });
    }
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

// import { existsSync } from "fs";
// import fs from "fs/promises";
// import path from "path";
// import { getIdFromSession } from "@/app/api/cookies";

// export const POST = async (req) => {
//   try {
//     const { id } = await getIdFromSession(req);
//     if (!id) {
//       throw new Error("You need to log in to perform this action.");
//     }

//     const formData = await req.formData();
//     console.log(formData);
//     const f = formData.get("files");
//     console.log("file:", f);
//     if (!f) {
//       return Response.json({}, { status: 400 });
//     }

//     const file = f;
//     console.log(`File name: ${file.name}`);
//     console.log(`Content-Length: ${file.size}`);

//     const destinationDirPath = path.join(process.cwd(), "public/upload");
//     console.log({ destinationDirPath });

//     const fileArrayBuffer = await file.arrayBuffer();

//     if (!existsSync(destinationDirPath)) {
//       fs.mkdir(destinationDirPath, { recursive: true });
//     }
//     await fs.writeFile(
//       path.join(destinationDirPath, file.name),
//       Buffer.from(fileArrayBuffer),
//       { flag: "wx" },
//     );

//     return Response.json({
//       fileName: file.name,
//       size: file.size,
//       lastModified: new Date(file.lastModified),
//     });
//   } catch (error) {
//     console.error(error);
//     return Response.json({ error: error.message }, { status: 500 });
//   }
// };
