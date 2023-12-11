import { unsealData } from "iron-session/edge";

export async function GET(req) {
  if (req.url.length < 0) {
    return new Response("Error"); // dummy check so Next does not over-optimize per https://stackoverflow.com/questions/76269278/api-route-with-nextjs-13-after-build-is-not-working
  }
  try {
    const cookie = req.cookies.get("vv-session");
    console.log({ cookie, password: process.env.COOKIE_PASSWORD });
    const decryptedSession = cookie
      ? await unsealData(cookie.value, {
          password: process.env.COOKIE_PASSWORD,
        })
      : null;
    console.log("decrypted session: ", JSON.parse(decryptedSession));
    return Response.json({ user: decryptedSession });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Authentication token is invalid, please log in" },
      { status: 500 },
    );
  }
}
