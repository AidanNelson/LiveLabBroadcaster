import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

import { getUsersDatabase } from "../db.js";

// from https://github.com/passport/todos-express-password/blob/master/routes/auth.js
var express = require("express");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var crypto = require("crypto");

async function findUser({ username }) {
  const { db } = await getUsersDatabase();
  const users = db.data.users;
  const user = users.find((el) => el.username === username);
  return user ? user : null;
}

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
passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    console.log("verifying:", username, "pass:", password);
    // first check if the user exists
    const user = await findUser({ username });
    // if no user exists in the database, return a message stating this
    if (!user)
      return cb(null, false, { message: "Incorrect username or password." });

    console.log("user:", user);
    // if there is a user, check the passwords
    const hashedPassword = crypto.pbkdf2Sync(
      password,
      user.salt,
      310000,
      64,
      "sha512",
    );
    if (!user.hash === hashedPassword) {
      return cb(null, false, { message: "Incorrect username or password." });
    }
    return cb(null, user);
  }),
);

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

// confirm status for useUser hook
authRouter.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user }); // Return the authenticated user object
  } else {
    // TODO should this be 401 or 200 (i.e. we do get status correctly, but user is not logged in...?)
    res.status(401).json({ user: null }); // User is not authenticated
  }
});

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
authRouter.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err); // Handle errors, if any occur
    }
    if (!user) {
      // If authentication failed, return a 401 response
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If authentication was successful, log the user in
    req.login(user, function (err) {
      if (err) {
        return next(err); // Handle errors during login
      }
      // Return 200 and a JSON response if login is successful
      return res.status(200).json({ done: true, username: user.username });
    });
  })(req, res, next);
});

/* POST /logout
 *
 * This route logs the user out.
 */
authRouter.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

/* POST /signup
 *
 * This route creates a new user account.
 *
 * A desired username and password are submitted to this route via an HTML form,
 * which was rendered by the `GET /signup` route.  The password is hashed and
 * then a new user record is inserted into the database.  If the record is
 * successfully created, the user is logged in.
 */
authRouter.post("/signup", async function (req, res, next) {
  // first check for an existing user and throw an error if so:
  const existingUser = await findUser({ username: req.body.username });
  if (existingUser) return next(new Error("User already exists."));

  // then create hashed password
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(req.body.password, salt, 310000, 64, "sha512");

  // then create and insert user info object into the database
  const user = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    username: req.body.username,
    hash: hash.toString("hex"),
    salt: salt.toString("hex"),
  };
  const { db } = await getUsersDatabase();
  db.data.users.push(user);
  db.write();

  // then login the user with express (using just a subset of their user info)
  req.login({ id: user.id, username: user.username }, function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json({ done: true });
  });
});
