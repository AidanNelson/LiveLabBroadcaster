import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// const express = require('express');
// const router = express.Router();
// import { createUser } from "../auth/user";
// import { findUserAndValidatePassword } from "../auth/password-local";
// import { sealData } from "iron-session/edge";
// import { unsealData } from "iron-session/edge";
// const { getUsersDatabase } = require('../db.js');
import { getUsersDatabase } from '../db.js';

// async function createUser({ username, password }) {
//   const salt = crypto.randomBytes(16).toString("hex");
//   const hash = crypto
//     .pbkdf2Sync(password, salt, 1000, 64, "sha512")
//     .toString("hex");
//   const user = {
//     id: uuidv4(),
//     createdAt: Date.now(),
//     username,
//     hash,
//     salt,
//   };


//   const existingUser = await findUser({ username });
//   console.log({ existingUser });

//   if (!existingUser) {
//     // await mongoClient.connect();
//     // const database = mongoClient.db("virtual-venue-db");
//     // const collection = database.collection("users");
//     // const result = await collection.insertOne(user);
//     // console.log("result:", result);
//     const {db} = await getUsersDatabase();
//     db.data.users.push(user);
//     db.write();

//     return { username, createdAt: Date.now() };
//   } else {
//     throw new Error("Error creating new user");
//   }

//   // const docCount = await collection.countDocuments({});

//   // This is an in memory store for users, there is no data persistence without a proper DB
//   // users.push(user)
// }

async function findUser({ username }) {
  console.log('finding');
  const { db } = await getUsersDatabase();
  console.log(db);
  const users = db.data.users;
  const user = users.find((el) => el.username === username)
  console.log('user:',user);
  return user ? user : null;
}


// router.post('/login', async (req, res) => {
//   const body = await req.json();
//   const result = await findUserAndValidatePassword(body);

//   if (result) {
//     const session = JSON.stringify(result);

//     const encryptedSession = await sealData(session, {
//       password: process.env.COOKIE_PASSWORD,
//     });

//     res.status(200).setHeader("Set-Cookie", `vv-session=${encryptedSession}; Path=/api;`);
//     // return new Response("ok", {
//     //   status: 200,
//     //   headers: { "Set-Cookie": `vv-session=${encryptedSession}; Path=/api;` },
//     // });
//   } else {
//     res.status(500).json({ message: "Credentials not accepted." });
//     // return Response.json(
//     //   { message:  },
//     //   { status: 500 },
//     // );
//   }
// });

// router.post('/signup', async (req, res) => {
//   try {
//     const userInfo = await req.json();
//     console.log(userInfo);
//     await createUser(userInfo);
//     res.json({ done: true });
//     // return Response.json({ done: true }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//     // return Response.json({ error: error.message }, { status: 500 });
//   }
// });


// router.post('/logout', async (req, res) => {
//   // if (req.url.length < 0) {
//   //   return new Response("Error"); // dummy check so Next does not over-optimize per https://stackoverflow.com/questions/76269278/api-route-with-nextjs-13-after-build-is-not-working
//   // }
//   res.status(200).setHeader("Set-Cookie", `vv-session=${Math.random()}; Path=/api; expires=Thu, 01 Jan 1970 00:00:00 GMT;`);
//   // return new Response("ok", {
//   //   status: 200,
//   //   headers: {
//   //     "Set-Cookie": `vv-session=${Math.random()}; Path=/api; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
//   //   },
//   // });
// });



// router.get('/user', async (req, res) => {
//   // if (req.url.length < 0) {
//   //   return new Response("Error"); // dummy check so Next does not over-optimize per https://stackoverflow.com/questions/76269278/api-route-with-nextjs-13-after-build-is-not-working
//   // }
//   try {
//     const cookie = req.cookies.get("vv-session");
//     console.log({ cookie, password: process.env.COOKIE_PASSWORD });
//     const decryptedSession = cookie
//       ? await unsealData(cookie.value, {
//         password: process.env.COOKIE_PASSWORD,
//       })
//       : null;
//     console.log("decrypted session: ", JSON.parse(decryptedSession));
//     return Response.json({ user: decryptedSession });
//   } catch (error) {
//     console.error(error);
//     return Response.json(
//       { message: "Authentication token is invalid, please log in" },
//       { status: 500 },
//     );
//   }
// });


// module.exports = router;






// from https://github.com/passport/todos-express-password/blob/master/routes/auth.js
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
// var db = require('../db');


/* Configure password authentication strategy.
 *
 * The `LocalStrategy` authenticates users by verifying a username and password.
 * The strategy parses the username and password from the request and calls the
 * `verify` function.
 *
 * The `verify` function queries the database for the user record and verifies
 * the password by hashing the password supplied by the user and comparing it to
 * the hashed password stored in the database.  If the comparison succeeds, the
 * user is authenticated; otherwise, not.
 */
passport.use(new LocalStrategy(async function verify(username, password, cb) {

  // first check if the user exists
  const user = findUser({ username });
  // if no user exists in the database, return a message stating this
  if (!user) return cb(null, false, { message: 'Incorrect username or password.' });

  // if there is a user, check the passwords
  const hashedPassword = crypto
    .pbkdf2Sync(password, user.salt, 310000, 64, "sha512")
    .toString("hex");

  if (!crypto.timingSafeEqual(user.hash, hashedPassword)) {
    return cb(null, false, { message: 'Incorrect username or password.' });
  }
  return cb(null, user);

  // crypto.pbkdf2(password, user.salt, 310000, 64, 'sha512', function (err, hashedPassword) {
  //   if (err) { return cb(err); }
  //   if (!crypto.timingSafeEqual(user.hashed_password, hashedPassword)) {
  //     return cb(null, false, { message: 'Incorrect username or password.' });
  //   }
  //   return cb(null, user);
  // });


  // db.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
  //   if (err) { return cb(err); }
  //   if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

  //   crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
  //     if (err) { return cb(err); }
  //     if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
  //       return cb(null, false, { message: 'Incorrect username or password.' });
  //     }
  //     return cb(null, row);
  //   });
  // });
}));

/* Configure session management.
 *
 * When a login session is established, information about the user will be
 * stored in the session.  This information is supplied by the `serializeUser`
 * function, which is yielding the user ID and username.
 *
 * As the user interacts with the app, subsequent requests will be authenticated
 * by verifying the session.  The same user information that was serialized at
 * session establishment will be restored when the session is authenticated by
 * the `deserializeUser` function.
 *
 * Since every request to the app needs the user ID and username, in order to
 * fetch todo records and render the user element in the navigation bar, that
 * information is stored in the session.
 */
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});


export const authRouter = express.Router();



/** POST /login/password
 *
 * This route authenticates the user by verifying a username and password.
 *
 * A username and password are submitted to this route via an HTML form, which
 * was rendered by the `GET /login` route.  The username and password is
 * authenticated using the `local` strategy.  The strategy will parse the
 * username and password from the request and call the `verify` function.
 *
 * Upon successful authentication, a login session will be established.  As the
 * user interacts with the app, by clicking links and submitting forms, the
 * subsequent requests will be authenticated by verifying the session.
 *
 * When authentication fails, the user will be re-prompted to login and shown
 * a message informing them of what went wrong.
 *
 * @openapi
 * /login/password:
 *   post:
 *     summary: Log in using a username and password
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: number
 *     responses:
 *       "302":
 *         description: Redirect.
 */
authRouter.post('/login/password', passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureMessage: true
}));

/* POST /logout
 *
 * This route logs the user out.
 */
authRouter.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

/* GET /signup
 *
 * This route prompts the user to sign up.
 *
 * The 'signup' view renders an HTML form, into which the user enters their
 * desired username and password.  When the user submits the form, a request
 * will be sent to the `POST /signup` route.
 */
// router.get('/signup', function(req, res, next) {
//   res.render('signup');
// });

/* POST /signup
 *
 * This route creates a new user account.
 *
 * A desired username and password are submitted to this route via an HTML form,
 * which was rendered by the `GET /signup` route.  The password is hashed and
 * then a new user record is inserted into the database.  If the record is
 * successfully created, the user is logged in.
 */
authRouter.post('/signup', async function (req, res, next) {
  console.log('POST to signup');
  // first check for an existing user and throw an error if so:
  const existingUser = await findUser({ username: req.body.username });
  console.log('existing user: ',existingUser)
  if (existingUser) return next(new Error('User already exists.'));

  console.log('user does not exist!');
  // then create hashed password
  const salt = crypto.randomBytes(16);
  const hash = crypto
    .pbkdf2Sync(req.body.password, salt, 310000, 64, "sha512")
    .toString("hex");

  // then create and insert user info object into the database
  const user = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    username: req.body.username,
    hash,
    salt,
  };
  console.log('trying...');
  const { db } = await getUsersDatabase();
  db.data.users.push(user);
  db.write();
console.log('db:',db);
  console.log('hello');
  // then login the user with express (using just a subset of their user info)
  req.login({ id: user.id, username: user.username }, function (err) {
    console.log('heyo:,',err);
    if (err) { return next(err); }
    console.log('sending response 200')
    res.status(200).json({ done: true });
  });
});
