import passport from "passport";
// import nextConnect from 'next-connect'
import { localStrategy } from "../../../../auth/password-local";
import { setLoginSession } from "../../../../auth/auth";

const authenticate = (method, req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate(method, { session: false }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    })(req, res);
  });

passport.use(localStrategy);

// export default nextConnect()
//   .use(passport.initialize())
//   .post(async (req, res) => {
//     try {
//       const user = await authenticate('local', req, res)
//       // session is the payload to save in the token, it may contain basic info about the user
//       const session = { ...user }

//       await setLoginSession(res, session)

//       res.status(200).send({ done: true })
//     } catch (error) {
//       console.error(error)
//       res.status(401).send(error.message)
//     }
//   })

import { createEdgeRouter } from "next-connect";

const router = createEdgeRouter();

router
  // A middleware example
  .use(passport.initialize())
  .post(async (req, res) => {
    try {
      const userInfo = await req.json();
      console.log(userInfo);
      const user = await authenticate("local", req, res);
      console.log("OKOK");
      // session is the payload to save in the token, it may contain basic info about the user
      const session = { ...user };

      await setLoginSession(res, session);

      return Response.json({ done: true }, { status: 200 });
    } catch (error) {
      console.error(error);
      return Response.json({ error: error.message }, { status: 401 });
    }
  });

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
