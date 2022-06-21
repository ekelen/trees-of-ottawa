
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet';

const Bounds = ({bounds}) => {
  return <Rectangle bounds={bounds} pathOptions={{color: "aquamarine"}} />
}

export default function LeafletComponent({center, envelope, trees = [] }) {
  const boundsOption = [[envelope.lat[0], envelope.lon[0]], [envelope.lat[1], envelope.lon[1]]]
  return <MapContainer center={[center.latitude,center.longitude]} zoom={18} scrollWheelZoom={false}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
    {trees.map(t => <Marker position={[t.geometry.y, t.geometry.x]} key={`${t.attributes.SAP_ID}`}>
      <Popup>
        <p><strong>Species:</strong> {t.attributes.SPECIES}</p>
      </Popup>
    </Marker>)}
    <Bounds bounds={boundsOption}/>
    </MapContainer>;
}
