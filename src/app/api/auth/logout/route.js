// endpoint to log in a user
export async function GET(req) {
  console.log("Logging out user");
    return new Response('ok', {
      status: 200,
      headers: { 'Set-Cookie': `vv-session=; Path=/api; ; Max-Age: -1` },
    });
  
}