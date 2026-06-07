import React from "react";
import { X, Check, Minus } from "lucide-react";
import { formatPrice } from "../data/properties";

function Row({ label, a, b }) {
  return (
    <div className="compare-row">
      <div className="compare-label">{label}</div>
      <div className={`compare-cell ${a > b || a === b ? "winner" : ""}`}>{a}</div>
      <div className={`compare-cell ${b > a ? "winner" : ""}`}>{b}</div>
    </div>
  );
}

function AmenityRow({ amenity, a, b }) {
  const hasA = a.amenities.includes(amenity);
  const hasB = b.amenities.includes(amenity);
  return (
    <div className="compare-row">
      <div className="compare-label">{amenity}</div>
      <div className={`compare-cell ${hasA ? "winner" : ""}`}>
        {hasA ? <Check size={16} /> : <Minus size={16} className="muted" />}
      </div>
      <div className={`compare-cell ${hasB ? "winner" : ""}`}>
        {hasB ? <Check size={16} /> : <Minus size={16} className="muted" />}
      </div>
    </div>
  );
}

const ALL_AMENITIES = [
  "Natural Light", "School Nearby", "Metro Access", "Swimming Pool",
  "Gym", "Parking", "Power Backup", "Club"
];

export default function CompareModal({ properties, onClose }) {
  if (!properties || properties.length < 2) return null;
  const [a, b] = properties;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="compare-title">Side-by-Side Comparison</h2>

        <div className="compare-header-row">
          <div className="compare-label" />
          <div className="compare-prop-header">
            <img src={a.image} alt={a.title} className="compare-thumb" onError={(e) => e.target.src = `https://picsum.photos/seed/${a.id}/200/120`} />
            <strong>{a.title}</strong>
            <span>{a.sector}</span>
          </div>
          <div className="compare-prop-header">
            <img src={b.image} alt={b.title} className="compare-thumb" onError={(e) => e.target.src = `https://picsum.photos/seed/${b.id}/200/120`} />
            <strong>{b.title}</strong>
            <span>{b.sector}</span>
          </div>
        </div>

        <div className="compare-section-label">Basics</div>
        <div className="compare-row">
          <div className="compare-label">Price</div>
          <div className="compare-cell">{formatPrice(a)}</div>
          <div className="compare-cell">{formatPrice(b)}</div>
        </div>
        <div className="compare-row">
          <div className="compare-label">BHK</div>
          <div className="compare-cell">{a.bhk} BHK</div>
          <div className="compare-cell">{b.bhk} BHK</div>
        </div>
        <div className="compare-row">
          <div className="compare-label">Area</div>
          <div className={`compare-cell ${a.area >= b.area ? "winner" : ""}`}>{a.area} sq ft</div>
          <div className={`compare-cell ${b.area > a.area ? "winner" : ""}`}>{b.area} sq ft</div>
        </div>
        <div className="compare-row">
          <div className="compare-label">Floor</div>
          <div className="compare-cell">{a.floor}</div>
          <div className="compare-cell">{b.floor}</div>
        </div>
        <div className="compare-row">
          <div className="compare-label">Facing</div>
          <div className="compare-cell">{a.facing}</div>
          <div className="compare-cell">{b.facing}</div>
        </div>
        <div className="compare-row">
          <div className="compare-label">Builder</div>
          <div className="compare-cell">{a.builder}</div>
          <div className="compare-cell">{b.builder}</div>
        </div>

        <div className="compare-section-label">Amenities</div>
        {ALL_AMENITIES.map((am) => (
          <AmenityRow key={am} amenity={am} a={a} b={b} />
        ))}

        <div className="compare-actions">
          <button className="cta-btn" onClick={onClose}>Back to Search</button>
        </div>
      </div>
    </div>
  );
}
