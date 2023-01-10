import { NextApiRequest, NextApiResponse } from "next";
import got from "got";

type Envelope = [[lon0: number, lat0: number], [lon1: number, lat1: number]];

const createQuery = (envelope: Envelope): string => {
  const str = envelope.flatMap((e) => e).join("%2C");

  const query: string = `https://maps.ottawa.ca/arcgis/rest/services/Forestry/MapServer/0/query?where=1%3D1&outFields=*&geometry=${str}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelContains&outSR=4326&f=json`;
  return query;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { query } = request;
  const envelope = JSON.parse(query.envelope as string);
  const ottawaQuery = createQuery(envelope);
  try {
    const res = await got(ottawaQuery).json();
    return response.status(200).json(res);
  } catch (err: any) {
    return response.status(err.status || 500).json({
      query: request.query,
      cookies: request.cookies,
      error: err.message,
    });
  }
}
