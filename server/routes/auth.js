var express = require("express");
var passport = require("passport");
var LocalStrategy = require("passport-local");


const { createUser, findUser, validatePassword } = require("../users.js");
const { default: next } = require("next");
// const { createUser } = require("@/auth/user");

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
// passport.use(new LocalStrategy(function verify(username, password, cb) {
//   db.get('SELECT * FROM users WHERE username = ?', [ username ], function(err, row) {
//     if (err) { return cb(err); }
//     if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

//     crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
//       if (err) { return cb(err); }
//       if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
//         return cb(null, false, { message: 'Incorrect username or password.' });
//       }
//       return cb(null, row);
//     });
//   });
// }));
passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    console.log('attempting login with', username, password);
    // const user = await findUser({username});
    // if (!user){ return cb}
    findUser({ username })
      .then(async (user) => {
        if (user && await validatePassword(user, password)) {
          console.log('user authenticated', user);
          return cb(null, user);
        } else {
          console.log('invalid username and password combination');
          return cb(new Error("Invalid username and password combination"));
        }
      })
      .catch((error) => {
        console.log(error);
        return cb(error);
      });
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
passport.serializeUser(function (user, done) {
  process.nextTick(function () {
    done(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, done) {
  process.nextTick(function () {
    return done(null, user);
  });
});

var router = express.Router();

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
router.post(
  "/login/password",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res ) => {
    console.log('login successful');
    // If authentication succeeds, this callback will be executed
    res.status(200).json({ message: 'Login successful', user: req.user });
});

/* POST /logout
 *
 * This route logs the user out.
 */
router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json({});
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
router.post("/signup", async function (req, res, next) {
  console.log(req.body);
  const { username, password } = req.body;

  const existingUser = await findUser({ username });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "Could not complete signup.  Please try again." });
  } else {
    const user = await createUser({ username, password });
    // res.status(200).json({ message: "Signup completed successfully." });
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: 'Login successful', user: req.user });
    });
  }
});

module.exports = router;
