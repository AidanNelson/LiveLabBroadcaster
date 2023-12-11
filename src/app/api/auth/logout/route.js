export async function GET(req) {
  if (req.url.length < 0) {
    return new Response("Error"); // dummy check so Next does not over-optimize per https://stackoverflow.com/questions/76269278/api-route-with-nextjs-13-after-build-is-not-working
  }
  return new Response("ok", {
    status: 200,
    headers: {
      "Set-Cookie": `vv-session=${Math.random()}; Path=/api; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
    },
  });
}
