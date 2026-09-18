import { useEffect, useMemo } from 'react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { decodePolyline } from '../lib/polyline.js';

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
  const path = useMemo(
    () => (route?.overviewPolyline ? decodePolyline(route.overviewPolyline) : []),
    [route?.overviewPolyline],
  );

  const markers = useMemo(() => {
    if (!route?.legs?.length) return [];
    // First leg's start plus each leg's end gives every stop in optimized order.
    const points = [{ position: route.legs[0].startLocation, label: '1' }];
    route.legs.forEach((leg, i) => {
      points.push({ position: leg.endLocation, label: String(i + 2) });
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
    >
      <RoutePolyline path={path} />
      <FitBounds bounds={route?.bounds} />
      {markers.map((m, i) => (
        <AdvancedMarker key={i} position={m.position}>
          <Pin background="#2563eb" borderColor="#1e40af" glyphColor="#fff">{m.label}</Pin>
        </AdvancedMarker>
      ))}
    </Map>
  );
}
