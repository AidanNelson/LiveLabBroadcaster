import { updateUsername } from "@/auth/user";
import { findUserAndValidatePassword } from "../../../../auth/password-local";
import { getSessionInfo } from "@/app/api/cookies";

export async function PUT(req) {
  if (req.url.length < 0) {
    return new Response("Error"); // dummy check so Next does not over-optimize per https://stackoverflow.com/questions/76269278/api-route-with-nextjs-13-after-build-is-not-working
  }

  const update = await req.json();
  const session = await getSessionInfo(req);

  const user  = await findUserAndValidatePassword({username: session.username, password: update.currentPassword}) 
  console.log(user);

  if (update.username !== user.username){
    updateUsername(user, update.username);
  }


  return new Response("ok", {
    status: 200,
    // headers: {
    //   "Set-Cookie": `vv-session=${Math.random()}; Path=/api; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
    // },
  });
}
