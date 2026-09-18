import { useEffect, useMemo, useState } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { decodePolyline } from '../lib/polyline.js';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h} hr ${m} min`;
}

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };

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

function StopMarker({ marker, isHovered }) {
  return (
    <div style={{ position: 'relative', cursor: 'pointer' }}>
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        {marker.label}
      </div>

      {isHovered && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            padding: '8px 10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 13,
            minWidth: 180,
          }}
        >
          <div style={{ fontWeight: 700, color: '#111827', marginBottom: 2 }}>
            Stop {marker.label}
          </div>
          <div style={{ color: '#374151', marginBottom: 4, whiteSpace: 'normal', maxWidth: 240 }}>
            {marker.address}
          </div>
          {marker.cumSeconds === 0 ? (
            <div style={{ color: '#6b7280', fontSize: 12 }}>Starting point</div>
          ) : (
            <>
              <div style={{ color: '#2563eb', fontSize: 12, fontWeight: 600 }}>
                +{formatDuration(marker.cumSeconds)} from start
              </div>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                {marker.legDuration} &middot; {marker.legDistance} from prev
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MapPanel({ route }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

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

  return (
    <Map
      mapId="routemapper"
      defaultCenter={DEFAULT_CENTER}
      defaultZoom={4}
      gestureHandling="greedy"
      style={{ width: '100%', height: '100%' }}
      onClick={() => setHoveredIdx(null)}
    >
      <RoutePolyline path={path} />
      <FitBounds bounds={route?.bounds} />
      {markers.map((m, i) => (
        <AdvancedMarker
          key={i}
          position={m.position}
          zIndex={hoveredIdx === i ? 100 : 1}
          onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
        >
          <StopMarker marker={m} isHovered={hoveredIdx === i} />
        </AdvancedMarker>
      ))}
    </Map>
  );
}
