import React, { useState } from "react";
import { MapPin, Maximize2, IndianRupee, Sparkles, Eye } from "lucide-react";
import { formatPrice } from "../data/properties";
import { getMatchBadge } from "../utils/filter";

export default function PropertyCard({ property, filters, onSelect, isCompare, onToggleCompare }) {
  const [imgError, setImgError] = useState(false);
  const badges = getMatchBadge(property, filters || {});

  return (
    <div
      className={`property-card ${isCompare ? "compare-selected" : ""}`}
      onClick={() => onSelect(property)}
    >
      <div className="card-image-wrap">
        <img
          src={imgError ? `https://picsum.photos/seed/${property.id}/600/400` : property.image}
          alt={property.title}
          className="card-image"
          onError={() => setImgError(true)}
        />
        <div className="card-image-overlay">
          <span className="vr-badge">
            <Eye size={12} />
            360° View
          </span>
          <span className="builder-badge">{property.builder}</span>
        </div>
        <div className="possession-chip">{property.possession}</div>
      </div>

      <div className="card-body">
        <div className="card-header-row">
          <h3 className="card-title">{property.title}</h3>
          <span className="card-price">{formatPrice(property)}</span>
        </div>

        <div className="card-meta">
          <span className="meta-item">
            <MapPin size={13} />
            {property.sector}
          </span>
          <span className="meta-item">
            <Maximize2 size={13} />
            {property.area} sq ft
          </span>
          <span className="meta-item bhk-pill">{property.bhk}BHK</span>
        </div>

        {badges.length > 0 && (
          <div className="match-badges">
            <Sparkles size={12} className="sparkle-icon" />
            {badges.map((b, i) => (
              <span key={i} className="match-badge">{b}</span>
            ))}
          </div>
        )}

        <div className="card-footer">
          <span className="floor-info">{property.floor} floor · {property.facing}</span>
          <button
            className={`compare-btn ${isCompare ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(property);
            }}
          >
            {isCompare ? "✓ Compare" : "+ Compare"}
          </button>
        </div>
      </div>
    </div>
  );
}
