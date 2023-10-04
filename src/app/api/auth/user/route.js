// import { getLoginSession } from '../../../auth/auth'
// import { findUser } from '../../../auth/user'
import { localStrategy, findUserAndValidatePassword } from "../../../../auth/password-local";

import { unsealData } from 'iron-session/edge';

export async function POST(req, res) {
  try {

    const body = await req.json();
    console.log('body:',body);
    const user = await findUserAndValidatePassword(body);
    
    if (user){
      console.log('user is valid:',user);
      const session = JSON.stringify(user);
    
      console.log(req.headers);
      const decryptedSession = await unsealData(req, {
        password: 'yourasdfasdfasdfasdfasdfasdfasdfasdfasdf-password',
      });
      console.log('decrypted session: ',decryptedSession);
  
      
    }
    // const session = await getLoginSession(req)
    // const user = (session && (await findUser(session))) ?? null

    // res.status(200).json({ user })
  } catch (error) {
    console.error(error)
    res.status(500).end('Authentication token is invalid, please log in')
  }
}
