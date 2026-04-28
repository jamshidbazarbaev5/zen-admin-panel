import { useEffect, useRef, useState } from 'react';
import { Locate, Loader2 } from 'lucide-react';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

declare global {
  interface Window {
    L?: any;
  }
}

let leafletLoading: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoading) return leafletLoading;

  leafletLoading = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L));
      existing.addEventListener('error', reject);
      if (window.L) resolve(window.L);
      return;
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return leafletLoading;
}

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  height?: number;
}

export function MapPicker({ latitude, longitude, onChange, height = 320 }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser');
      return;
    }
    setLocateError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        onChangeRef.current(lat, lng);
        const map = mapRef.current;
        const L = window.L;
        if (map && L) {
          map.setView([lat, lng], 16);
          if (!markerRef.current) {
            markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
            markerRef.current.on('dragend', () => {
              const p = markerRef.current.getLatLng();
              onChangeRef.current(p.lat, p.lng);
            });
          } else {
            markerRef.current.setLatLng([lat, lng]);
          }
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied'
            : err.message || 'Unable to get current location'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const startLat = typeof latitude === 'number' && !Number.isNaN(latitude) ? latitude : 41.3111;
      const startLng = typeof longitude === 'number' && !Number.isNaN(longitude) ? longitude : 69.2797;

      const map = L.map(containerRef.current).setView([startLat, startLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const hasInitial = typeof latitude === 'number' && typeof longitude === 'number';
      if (hasInitial) {
        markerRef.current = L.marker([startLat, startLng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          onChangeRef.current(pos.lat, pos.lng);
        });
      }

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        if (!markerRef.current) {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current.getLatLng();
            onChangeRef.current(pos.lat, pos.lng);
          });
        } else {
          markerRef.current.setLatLng([lat, lng]);
        }
        onChangeRef.current(lat, lng);
      });

      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.L) return;
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return;
    }
    const L = window.L;
    if (!markerRef.current) {
      markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        onChangeRef.current(pos.lat, pos.lng);
      });
    } else {
      const cur = markerRef.current.getLatLng();
      if (cur.lat !== latitude || cur.lng !== longitude) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          ref={containerRef}
          style={{ height }}
          className="w-full rounded-md border border-border overflow-hidden bg-muted"
        />
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="absolute top-2 right-2 z-[400] flex items-center gap-1.5 px-3 py-2 rounded-md bg-background/95 border border-border shadow-sm text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-60"
          title="Use my current location"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Locate className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {locating ? 'Locating...' : 'My location'}
          </span>
        </button>
      </div>
      {locateError && (
        <p className="text-xs text-red-600 dark:text-red-400">{locateError}</p>
      )}
    </div>
  );
}
