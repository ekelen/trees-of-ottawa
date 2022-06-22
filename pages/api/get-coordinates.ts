import { NextApiRequest, NextApiResponse } from "next";
import got from "got";

const getCoordinates = async (query: string) => {
  const result: any = await got(
    `http://api.positionstack.com/v1/forward?access_key=${process.env.PS_KEY}&query=${query}&country=CA`
  ).json();

  return { data: result.data.filter((d: any) => d.county === "Ottawa") };
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { query } = JSON.parse(request.body);
  try {
    const res = await getCoordinates(query);

    return response.status(200).json(res.data);
  } catch (err: any) {
    console.log(`[=] error:`, err);
    return response.status(err.status || 500).json({
      body: request.body,
      query: request.query,
      cookies: request.cookies,
      error: err.message,
    });
  }
}
