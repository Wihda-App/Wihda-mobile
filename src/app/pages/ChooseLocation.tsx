import MobileContainer from '../components/MobileContainer';
import PageTransition from '../components/PageTransition';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Search, Navigation, Minus, Plus } from 'lucide-react';
import SwipeBack from '../components/SwipeBack';

const DEFAULT_LAT = 36.7538;
const DEFAULT_LNG = 3.0588;
const DEFAULT_ZOOM = 14;

// Nearby places to show as colorful pins on the map
const NEARBY_PLACES = [
  { name: 'Café Amira', lat: 36.7558, lng: 3.0548, color: '#e74c3c', icon: '☕' },
  { name: 'Central Market', lat: 36.7510, lng: 3.0620, color: '#f39c12', icon: '🛒' },
  { name: 'City Park', lat: 36.7570, lng: 3.0630, color: '#27ae60', icon: '🌳' },
  { name: 'Mosque El-Nour', lat: 36.7500, lng: 3.0560, color: '#8e44ad', icon: '🕌' },
  { name: 'School', lat: 36.7555, lng: 3.0530, color: '#2980b9', icon: '🏫' },
  { name: 'Pharmacy', lat: 36.7525, lng: 3.0610, color: '#1abc9c', icon: '💊' },
  { name: 'Bakery', lat: 36.7545, lng: 3.0650, color: '#e67e22', icon: '🍞' },
  { name: 'Library', lat: 36.7580, lng: 3.0570, color: '#3498db', icon: '📚' },
];

function lonToTileX(lon: number, zoom: number) {
  return ((lon + 180) / 360) * Math.pow(2, zoom);
}
function latToTileY(lat: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    Math.pow(2, zoom)
  );
}

function metersPerPixel(lat: number, zoom: number) {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

interface TileCache {
  [key: string]: HTMLImageElement;
}

export default function ChooseLocation() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileCacheRef = useRef<TileCache>({});
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [distance, setDistance] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // Drag state
  const dragRef = useRef<{ startX: number; startY: number; startLat: number; startLng: number } | null>(null);

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f2efe9';
    ctx.fillRect(0, 0, w, h);

    const centerTileX = lonToTileX(lng, zoom);
    const centerTileY = latToTileY(lat, zoom);
    const tileSize = 256;

    const offsetX = w / 2 - (centerTileX % 1) * tileSize;
    const offsetY = h / 2 - (centerTileY % 1) * tileSize;
    const baseTileX = Math.floor(centerTileX);
    const baseTileY = Math.floor(centerTileY);

    const tilesX = Math.ceil(w / tileSize) + 2;
    const tilesY = Math.ceil(h / tileSize) + 2;

    for (let dx = -Math.floor(tilesX / 2); dx <= Math.floor(tilesX / 2); dx++) {
      for (let dy = -Math.floor(tilesY / 2); dy <= Math.floor(tilesY / 2); dy++) {
        const tileX = baseTileX + dx;
        const tileY = baseTileY + dy;
        const x = offsetX + dx * tileSize;
        const y = offsetY + dy * tileSize;
        const key = `${zoom}/${tileX}/${tileY}`;

        if (tileCacheRef.current[key]) {
          ctx.drawImage(tileCacheRef.current[key], x, y, tileSize, tileSize);
        } else {
          // Nicer placeholder with subtle grid
          ctx.fillStyle = '#f5f2ec';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#e8e4dd';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, tileSize, tileSize);

          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = `https://basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tileX}/${tileY}@2x.png`;
          img.onload = () => {
            tileCacheRef.current[key] = img;
            drawMap();
          };
        }
      }
    }

    // Helper: convert lat/lng to pixel position on canvas
    const latLngToPixel = (pLat: number, pLng: number) => {
      const px = w / 2 + (lonToTileX(pLng, zoom) - centerTileX) * tileSize;
      const py = h / 2 + (latToTileY(pLat, zoom) - centerTileY) * tileSize;
      return { x: px, y: py };
    };

    // Draw radius circle
    const mpp = metersPerPixel(lat, zoom);
    const radiusPixels = (distance * 1000) / mpp;

    // Outer glow
    const gradient = ctx.createRadialGradient(w / 2, h / 2, radiusPixels * 0.7, w / 2, h / 2, radiusPixels);
    gradient.addColorStop(0, 'rgba(20, 174, 92, 0.06)');
    gradient.addColorStop(1, 'rgba(20, 174, 92, 0.15)');
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, radiusPixels, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Dashed border for radius
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, radiusPixels, 0, Math.PI * 2);
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(20, 174, 92, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw nearby place pins
    NEARBY_PLACES.forEach((place) => {
      const pos = latLngToPixel(place.lat, place.lng);
      // Only draw if within canvas bounds
      if (pos.x < -30 || pos.x > w + 30 || pos.y < -30 || pos.y > h + 30) return;

      // Pin shadow
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + 18, 8, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fill();

      // Pin body (teardrop shape)
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y + 16);
      ctx.bezierCurveTo(pos.x - 4, pos.y + 6, pos.x - 14, pos.y - 2, pos.x - 14, pos.y - 10);
      ctx.arc(pos.x, pos.y - 10, 14, Math.PI, 0, false);
      ctx.bezierCurveTo(pos.x + 14, pos.y - 2, pos.x + 4, pos.y + 6, pos.x, pos.y + 16);
      ctx.closePath();
      ctx.fillStyle = place.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner white circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 10, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();

      // Emoji icon
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(place.icon, pos.x, pos.y - 9);
    });

    // Draw center pin (your location) - larger and more prominent
    // Pulsing ring effect (static representation)
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 174, 92, 0.1)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 174, 92, 0.2)';
    ctx.fill();

    // Main dot
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#14ae5c';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // "You" label
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const labelW = ctx.measureText('You').width + 10;
    const labelX = w / 2 - labelW / 2;
    const labelY = h / 2 - 28;
    ctx.beginPath();
    ctx.roundRect(labelX, labelY, labelW, 16, 8);
    ctx.fillStyle = '#14ae5c';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('You', w / 2, labelY + 3);

    // Attribution
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('\u00A9 OpenStreetMap \u00A9 CARTO', 4, h - 4);
  }, [lat, lng, zoom, distance]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ w: Math.floor(width * 2), h: Math.floor(height * 2) });
      }
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    drawMap();
  }, [drawMap, canvasSize]);

  // Touch/mouse drag
  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, startLat: lat, startLng: lng };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const mpp = metersPerPixel(lat, zoom);
    const newLat = dragRef.current.startLat + (dy * mpp) / 111320;
    const newLng = dragRef.current.startLng - (dx * mpp) / (111320 * Math.cos((lat * Math.PI) / 180));
    setLat(newLat);
    setLng(newLng);
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setLocating(false);
        },
        () => {
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  };

  const handleApply = () => {
    navigate(-1);
  };

  return (
    <MobileContainer>
      <PageTransition>
      <SwipeBack>
      <div className="flex flex-col size-full bg-white">
        {/* Header */}
        <div className="px-5 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3 h-14">
            <button onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }} className="text-gray-800">
              <ArrowLeft className="size-6" />
            </button>
            <h1 className="text-[18px] font-semibold text-gray-900 font-[Poppins,sans-serif]">Choose Location</h1>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Title */}
          <p className="text-[14px] text-gray-500 mb-4">
            Choose a location to see what's available near you
          </p>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 text-[14px] text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#14ae5c]/30"
            />
          </div>

          {/* Use Current Location */}
          <button
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="flex items-center gap-2 w-full py-3 mb-4 text-[14px] text-[#14ae5c] font-medium active:opacity-70"
          >
            <Navigation className="size-4" />
            {locating ? 'Getting location...' : 'Or use current location'}
          </button>

          {/* Map */}
          <div
            ref={containerRef}
            className="w-full h-[260px] rounded-2xl overflow-hidden mb-5 border border-gray-200 relative touch-none"
          >
            <canvas
              ref={canvasRef}
              width={canvasSize.w || 700}
              height={canvasSize.h || 520}
              className="w-full h-full"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{ touchAction: 'none' }}
            />
            {/* Zoom controls */}
            <div className="absolute right-3 top-3 flex flex-col gap-1">
              <button
                onClick={() => setZoom((z) => Math.min(18, z + 1))}
                className="bg-white shadow rounded-lg size-8 flex items-center justify-center active:bg-gray-100"
              >
                <Plus className="size-4 text-gray-700" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(5, z - 1))}
                className="bg-white shadow rounded-lg size-8 flex items-center justify-center active:bg-gray-100"
              >
                <Minus className="size-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Distance Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-medium text-gray-800">Select Distance</span>
              <span className="text-[14px] font-semibold text-[#14ae5c]">{distance} km</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #14ae5c ${((distance - 0.5) / 9.5) * 100}%, #e5e7eb ${((distance - 0.5) / 9.5) * 100}%)`,
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[11px] text-gray-400">0.5 km</span>
              <span className="text-[11px] text-gray-400">10 km</span>
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            className="w-full bg-[#14ae5c] text-white py-4 rounded-2xl text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            Apply
          </button>
        </div>
      </div>
      </SwipeBack>
      </PageTransition>
    </MobileContainer>
  );
}