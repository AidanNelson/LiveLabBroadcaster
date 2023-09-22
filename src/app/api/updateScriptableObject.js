import { NextResponse } from "next/server";

const Datastore = require("nedb");

export async function GET() {
  const db = new Datastore({ filename: "./mydb.txt" });
  db.loadDatabase(function (err) {
    // Callback is optional
    // Now commands will be executed
  });
  const res = {};
  const data = await res.json();

  return NextResponse.json(data);
}
