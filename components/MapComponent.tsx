import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { Photo } from '../types';

interface MapComponentProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo | null) => void;
}

// L is globally available from the CDN script
declare const L: any;

const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const DeclutteredMarkers: React.FC<{ photos: Photo[]; onSelectPhoto: (photo: Photo | null) => void; }> = ({ photos, onSelectPhoto }) => {
  const map = useMap();
  const [mapVersion, setMapVersion] = useState(0);

  useMapEvents({
    zoomend: () => setMapVersion(v => v + 1),
    moveend: () => setMapVersion(v => v + 1),
    click: () => {
      onSelectPhoto(null);
    },
  });

  const { markers, lines } = useMemo(() => {
    const PIXEL_THRESHOLD = 30; // Min distance between markers in pixels to be considered overlapping
    const SPREAD_PIXEL_RADIUS = 35; // How far to spread clustered markers

    if (!photos.length) return { markers: [], lines: [] };

    const clusteredPhotos: Photo[][] = [];
    const processedIndices = new Set<number>();

    for (let i = 0; i < photos.length; i++) {
      if (processedIndices.has(i)) continue;

      const cluster: Photo[] = [photos[i]];
      const point1 = map.latLngToContainerPoint([photos[i].coordinates.lat, photos[i].coordinates.lng]);
      
      processedIndices.add(i);

      for (let j = i + 1; j < photos.length; j++) {
        if (processedIndices.has(j)) continue;
        
        const point2 = map.latLngToContainerPoint([photos[j].coordinates.lat, photos[j].coordinates.lng]);

        if (point1.distanceTo(point2) < PIXEL_THRESHOLD) {
          cluster.push(photos[j]);
          processedIndices.add(j);
        }
      }
      clusteredPhotos.push(cluster);
    }
    
    const finalMarkers: { photo: Photo, position: LatLngExpression }[] = [];
    const finalLines: { key: string, positions: LatLngExpression[] }[] = [];

    clusteredPhotos.forEach(cluster => {
      if (cluster.length === 1) {
        finalMarkers.push({ 
          photo: cluster[0], 
          position: [cluster[0].coordinates.lat, cluster[0].coordinates.lng] 
        });
      } else {
        const centerLatLng: LatLngExpression = [cluster[0].coordinates.lat, cluster[0].coordinates.lng];
        const centerPoint = map.latLngToContainerPoint(centerLatLng);
        
        cluster.forEach((photo, index) => {
          const angle = (2 * Math.PI / cluster.length) * index;
          const newX = centerPoint.x + SPREAD_PIXEL_RADIUS * Math.cos(angle);
          const newY = centerPoint.y + SPREAD_PIXEL_RADIUS * Math.sin(angle);
          const newPosition = map.containerPointToLatLng([newX, newY]);
          
          finalMarkers.push({ photo, position: newPosition });
          finalLines.push({
            key: `${photo.id}-line`,
            positions: [centerLatLng, newPosition]
          });
        });
      }
    });

    return { markers: finalMarkers, lines: finalLines };
  }, [photos, map, mapVersion]);

  return (
    <>
      {lines.map(({ key, positions }) => (
        <Polyline 
          key={key} 
          positions={positions} 
          pathOptions={{ color: 'rgba(255, 255, 255, 0.7)', weight: 1.5, dashArray: '5, 5' }} 
        />
      ))}
      {markers.map(({ photo, position }) => (
        <Marker 
          key={photo.id} 
          position={position}
          icon={customIcon}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              onSelectPhoto(photo);
            },
          }}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold m-0">{photo.name}</p>
              <button 
                onClick={(e) => {
                  L.DomEvent.stopPropagation(e);
                  onSelectPhoto(photo);
                }} 
                className="text-blue-500 hover:underline mt-1 text-sm"
              >
                View Photo
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};


const MapComponent: React.FC<MapComponentProps> = ({ photos, onSelectPhoto }) => {
  const TAIWAN_CENTER: LatLngExpression = [23.9738, 120.982];
  const INITIAL_ZOOM = 7;

  return (
    <MapContainer center={TAIWAN_CENTER} zoom={INITIAL_ZOOM} scrollWheelZoom={true} className="h-full w-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DeclutteredMarkers photos={photos} onSelectPhoto={onSelectPhoto} />
    </MapContainer>
  );
};

export default MapComponent;