import { findUserByUserId, getPublicUserInfo } from "@/auth/user";

export const GET = async (req, { params }) => {
  try {
    const { userId } = params;
    
    const userDoc = await findUserByUserId({userId});

    if (!userDoc) {
      throw new Error("User not found.");
    }
    
   const publicUserInfo = getPublicUserInfo({userDoc});

    return Response.json(publicUserInfo, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
