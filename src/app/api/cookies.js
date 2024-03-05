import { unsealData } from "iron-session/edge";

export const getIdFromSession = async (request) => {
  const cookie = request.cookies.get("vv-session");

  if (cookie) {

    const decryptedSession = await unsealData(cookie.value, {
      password: process.env.COOKIE_PASSWORD,
    });
    const { id } = JSON.parse(decryptedSession);
    return { id };
  }
};

export const getSessionInfo = async (request) => {
  const cookie = request.cookies.get("vv-session");

  if (cookie) {
    const decryptedSession = await unsealData(cookie.value, {
      password: process.env.COOKIE_PASSWORD,
    });
    const decryptedSessionJSON = JSON.parse(decryptedSession);
    return decryptedSessionJSON;
  }
};