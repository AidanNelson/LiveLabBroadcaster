export async function GET(req) {
  return new Response("ok", {
    status: 200,
    headers: {
      "Set-Cookie": `vv-session=${Math.random()}; Path=/api; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
    },
  });
}
