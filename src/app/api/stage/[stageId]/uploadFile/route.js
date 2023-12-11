import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { getIdFromSession } from "@/app/api/cookies";

export const POST = async (req) => {
  try {
    const { id } = await getIdFromSession(req);
    if (!id) {
      throw new Error("You need to log in to perform this action.");
    }

    const formData = await req.formData();
    console.log(formData);
    const f = formData.get("files");
    console.log("file:", f);
    if (!f) {
      return Response.json({}, { status: 400 });
    }

    const file = f;
    console.log(`File name: ${file.name}`);
    console.log(`Content-Length: ${file.size}`);

    const destinationDirPath = path.join(process.cwd(), "public/upload");
    console.log({ destinationDirPath });

    const fileArrayBuffer = await file.arrayBuffer();

    if (!existsSync(destinationDirPath)) {
      fs.mkdir(destinationDirPath, { recursive: true });
    }
    await fs.writeFile(
      path.join(destinationDirPath, file.name),
      Buffer.from(fileArrayBuffer),
      { flag: "wx" },
    );

    return Response.json({
      fileName: file.name,
      size: file.size,
      lastModified: new Date(file.lastModified),
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
