import Local from "passport-local";
import { findUser, validatePassword } from "./user";

export const localStrategy = new Local.Strategy(function (
  username,
  password,
  done,
) {
  console.log(username);
  findUser({ username })
    .then((user) => {
      if (user && validatePassword(user, password)) {
        done(null, user);
      } else {
        done(new Error("Invalid username and password combination"));
      }
    })
    .catch((error) => {
      done(error);
    });
});

export const findUserAndValidatePassword = async ({username, password}) => {
  try {
    const user = await findUser({ username });
    if (user && validatePassword(user, password)) {
      return user;
    } else {
      return null;
    }
  } catch (error) {
    return error;
  }
};
