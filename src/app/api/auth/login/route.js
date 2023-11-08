import { findUserAndValidatePassword } from "../../../../auth/password-local";


import { sealData } from 'iron-session/edge';

// endpoint to log in a user
export async function POST(req) {


  const body = await req.json();
  console.log('body:',body);
  const user = await findUserAndValidatePassword(body);
  
  if (user){
    console.log('user is valid:',user);
    const session = JSON.stringify(user);
  
    const encryptedSession = await sealData(session, {
      password: process.env.COOKIE_PASSWORD,
    });
  
    console.log('encrypted session:',encryptedSession);
    return new Response('ok', {
      status: 200,
      headers: { 'Set-Cookie': `vv-session=${encryptedSession}; Path=/api;` },
    });
  }
  
}