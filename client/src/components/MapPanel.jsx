import { useEffect, useMemo, useState } from 'react';
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { decodePolyline } from '../lib/polyline.js';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h} hr ${m} min`;
}

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };

// Renders the route polyline via the imperative Maps JS Polyline API, since
// @vis.gl/react-google-maps does not ship a declarative Polyline component.
function RoutePolyline({ path }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !path || path.length === 0 || !window.google?.maps) return undefined;
    const line = new window.google.maps.Polyline({
      path,
      strokeColor: '#2563eb',
      strokeOpacity: 0.9,
      strokeWeight: 5,
      map,
    });
    return () => line.setMap(null);
  }, [map, path]);
  return null;
}

// Fits the map viewport to the returned route bounds.
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !bounds || !window.google?.maps) return;
    const b = new window.google.maps.LatLngBounds(
      { lat: bounds.southwest.lat, lng: bounds.southwest.lng },
      { lat: bounds.northeast.lat, lng: bounds.northeast.lng },
    );
    map.fitBounds(b, 64);
  }, [map, bounds]);
  return null;
}

export default function MapPanel({ route }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Concatenate per-step polylines for full road-accurate geometry.
  // overview_polyline is a simplified approximation that cuts corners at high zoom.
  const path = useMemo(() => {
    if (!route?.legs) return [];
    return route.legs.flatMap((leg) =>
      leg.steps.flatMap((step) => (step.polyline ? decodePolyline(step.polyline) : [])),
    );
  }, [route?.legs]);

  const markers = useMemo(() => {
    if (!route?.legs?.length) return [];
    let cumSeconds = 0;
    const points = [{
      position: route.legs[0].startLocation,
      label: '1',
      address: route.legs[0].startAddress,
      cumSeconds: 0,
      legDuration: null,
      legDistance: null,
    }];
    route.legs.forEach((leg, i) => {
      cumSeconds += leg.durationSeconds;
      points.push({
        position: leg.endLocation,
        label: String(i + 2),
        address: leg.endAddress,
        cumSeconds,
        legDuration: leg.durationText,
        legDistance: leg.distanceText,
      });
    });
    return points;
  }, [route]);

  const hovered = hoveredIdx !== null ? markers[hoveredIdx] : null;

  return (
    <Map
      mapId="routemapper"
      defaultCenter={DEFAULT_CENTER}
      defaultZoom={4}
      gestureHandling="greedy"
      style={{ width: '100%', height: '100%' }}
    >
      <RoutePolyline path={path} />
      <FitBounds bounds={route?.bounds} />
      {markers.map((m, i) => (
        <AdvancedMarker key={i} position={m.position}>
          <div
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ display: 'contents' }}
          >
            <div
              style={{
                background: '#2563eb',
                border: '2px solid #1e40af',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {m.label}
            </div>
          </div>
        </AdvancedMarker>
      ))}
      {hovered && (
        <InfoWindow
          position={hovered.position}
          disableAutoPan
          onCloseClick={() => setHoveredIdx(null)}
        >
          <div style={{ fontFamily: 'sans-serif', fontSize: 13, maxWidth: 220 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>
              Stop {hovered.label}
            </div>
            <div style={{ color: '#374151', marginBottom: 4 }}>
              {hovered.address}
            </div>
            {hovered.cumSeconds === 0 ? (
              <div style={{ color: '#6b7280', fontSize: 12 }}>Starting point</div>
            ) : (
              <>
                <div style={{ color: '#2563eb', fontSize: 12 }}>
                  +{formatDuration(hovered.cumSeconds)} from start
                </div>
                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                  {hovered.legDuration} &middot; {hovered.legDistance} from previous stop
                </div>
              </>
            )}
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}
