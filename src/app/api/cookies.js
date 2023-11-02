import { unsealData } from "iron-session/edge";

export const getIdfromSession = async (request) => {
  const cookie = request.cookies.get("vv-session");

  if (cookie) {

    const decryptedSession = await unsealData(cookie.value, {
      password: "yourasdfasdfasdfasdfasdfasdfasdfasdfasdf-password",
    });
    const { id } = JSON.parse(decryptedSession);
    return { id };
  }
};
