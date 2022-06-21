import { NextApiRequest, NextApiResponse } from "next";
import got from "got";

const getCoordinates = async (query: string) => {
  console.log(`[=] query:`, query);
  console.log(`[=] process.env.PS_KEY:`, process.env.PS_KEY);
  const result = (await got(
    `http://api.positionstack.com/v1/forward?access_key=${process.env.PS_KEY}&query=${query}&country=CA`
  ).json()) as Promise<any>;
  console.log(`[=] result:`, result);

  // const test = await got(`https://geocoder.ca/T0H%202N2?json=1`).json();
  // console.log(`[=] test:`, test);
  return result;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  console.log(`[=] request.body:`, request.body);
  console.log(`[=] request.cookies:`, request.cookies);
  console.log(`[=] process.env.PS_KEY:`, process.env.PS_KEY);
  const { query } = JSON.parse(request.body);
  console.log(`[=] query:`, query);
  try {
    const res = await getCoordinates(query);

    console.log(`[=] res:`, res);
    return response.status(200).json(res.data);
  } catch (err: any) {
    console.log(`[=] err:`, err);
    return response.status(err.status || 500).json({
      body: request.body,
      query: request.query,
      cookies: request.cookies,
      error: err.message,
    });
  }
}
