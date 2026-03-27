import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icons in react-leaflet
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface FacilityMapProps {
  facilityName: string
  latitude?: number
  longitude?: number
}

export function FacilityMap({ facilityName, latitude, longitude }: FacilityMapProps) {
  // Default to Nairobi coordinates if not provided
  const center: [number, number] = [latitude ?? -1.286389, longitude ?? 36.817223]

  const isDefaultLocation = !latitude || !longitude

  return (
    <div className="space-y-3">
      <MapContainer
        center={center}
        zoom={isDefaultLocation ? 12 : 15}
        style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{facilityName}</p>
              {isDefaultLocation && (
                <p className="text-xs text-muted-foreground mt-1">Default location (Nairobi)</p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {isDefaultLocation && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <p className="font-medium">Location data not available</p>
          <p className="text-xs mt-1">Showing default location (Nairobi, Kenya)</p>
        </div>
      )}
    </div>
  )
}
