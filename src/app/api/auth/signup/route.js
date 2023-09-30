import { createUser } from "../../../../auth/user";

export async function POST(request) {
  try {
    const userInfo = await request.json();
    console.log(userInfo);
    await createUser(userInfo);
    return Response.json({ done: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
