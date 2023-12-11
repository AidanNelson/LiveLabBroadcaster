import { findUserAndValidatePassword } from "../../../../auth/password-local";

import { sealData } from "iron-session/edge";

// endpoint to log in a user
export async function POST(req) {
  const body = await req.json();

  const result = await findUserAndValidatePassword(body);

  if (result) {
    const session = JSON.stringify(result);

    const encryptedSession = await sealData(session, {
      password: process.env.COOKIE_PASSWORD,
    });

    return new Response("ok", {
      status: 200,
      headers: { "Set-Cookie": `vv-session=${encryptedSession}; Path=/api;` },
    });
  } else {
    return Response.json(
      { message: "Credentials not accepted." },
      { status: 500 },
    );
  }
}
