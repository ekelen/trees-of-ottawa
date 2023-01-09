import {
  CircleMarker,
  MapContainer,
  Rectangle,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import { getColorForString } from "generate-colors";
import { useEffect, useState } from "react";

const Bounds = ({ bounds }) => {
  return <Rectangle bounds={bounds} pathOptions={{ color: "aquamarine" }} />;
};

export default function LeafletComponent({ center, envelope, trees = [] }) {
  const [treesWithColor, setTreesWithColor] = useState([]);
  const boundsOption = [
    [envelope.lat[0], envelope.lon[0]],
    [envelope.lat[1], envelope.lon[1]],
  ];

  useEffect(() => {
    setTreesWithColor(
      trees.map((t) => ({
        ...t,
        color: getColorForString(t.attributes.SPECIES, {
          brightness: 90,
          saturation: 60,
        }),
      }))
    );
  }, []);

  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={18}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {treesWithColor.map((t, i) => (
        <CircleMarker
          center={[t.geometry.y, t.geometry.x]}
          radius={10}
          key={`${t.attributes.SAP_ID}-${i}`}
          color={`rgb(${t.color.join()})`}
        >
          <Tooltip>
            <p>
              <strong>Species:</strong> {t.attributes.SPECIES}
            </p>
          </Tooltip>
        </CircleMarker>
      ))}
      <Bounds bounds={boundsOption} />
    </MapContainer>
  );
}
