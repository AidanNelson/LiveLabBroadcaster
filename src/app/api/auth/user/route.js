// import { getLoginSession } from '../../../auth/auth'
// import { findUser } from '../../../auth/user'
import {
  localStrategy,
  findUserAndValidatePassword,
} from "../../../../auth/password-local";

import { unsealData } from "iron-session/edge";

export async function GET(req, res) {
  try {
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~");

    // const body = await req.json();
    // console.log('body:',body);
    // const user = await findUserAndValidatePassword(body);

    // if (user){
    // console.log('user is valid:',user);
    // const session = JSON.stringify(user);

    const cookie = req.cookies.get("vv-session");
    console.log({ cookie });
    const decryptedSession = await unsealData(cookie.value, {
      password: "yourasdfasdfasdfasdfasdfasdfasdfasdfasdf-password",
    });
    console.log("decrypted session: ", decryptedSession);

    // }
    // const session = await getLoginSession(req)
    // const user = (session && (await findUser(session))) ?? null

    // res.status(200).json({ user })
    return new Response("", {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).end("Authentication token is invalid, please log in");
  }
}
