import React, { useState, useEffect } from "react";
import { X, MapPin, Maximize2, Calendar, Building2, School, Loader2 } from "lucide-react";
import { formatPrice } from "../data/properties";
import { generatePropertySummary } from "../utils/openrouter";

export default function PropertyModal({ property, userQuery, onClose }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!property) return;
    setLoading(true);
    setSummary("");
    generatePropertySummary(property, userQuery)
      .then(setSummary)
      .catch(() => setSummary(`This ${property.bhk}BHK in ${property.sector} matches your search well — featuring ${property.amenities.slice(0,2).join(" and ").toLowerCase()} with possession ${property.possession.toLowerCase()}.`))
      .finally(() => setLoading(false));
  }, [property, userQuery]);

  if (!property) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>

        <div className="modal-image-wrap">
          <img
            src={imgError ? `https://picsum.photos/seed/${property.id}/800/500` : property.image}
            alt={property.title}
            className="modal-image"
            onError={() => setImgError(true)}
          />
          <div className="modal-price-overlay">{formatPrice(property)}</div>
        </div>

        <div className="modal-body">
          <div className="modal-title-row">
            <div>
              <h2 className="modal-title">{property.title}</h2>
              <p className="modal-location"><MapPin size={14} /> {property.sector}, Gurgaon</p>
            </div>
            <span className="modal-bhk">{property.bhk}BHK</span>
          </div>

          <div className="modal-stats">
            <div className="stat"><Maximize2 size={16} /><span>{property.area} sq ft</span></div>
            <div className="stat"><Building2 size={16} /><span>{property.floor} floor</span></div>
            <div className="stat"><Calendar size={16} /><span>Built {property.yearBuilt}</span></div>
            <div className="stat"><School size={16} /><span>{property.nearbySchools[0]}</span></div>
          </div>

          <div className="modal-ai-summary">
            <div className="ai-label"><span className="ai-dot" />AI Match Summary</div>
            {loading ? (
              <div className="ai-loading"><Loader2 size={16} className="spin" /><span>Personalising your match…</span></div>
            ) : (
              <p className="ai-text">{summary}</p>
            )}
          </div>

          <div className="modal-amenities">
            <h4>Amenities</h4>
            <div className="amenity-list">
              {property.amenities.map((a, i) => <span key={i} className="amenity-chip">{a}</span>)}
            </div>
          </div>

          <div className="modal-tags">
            {property.tags.map((t, i) => <span key={i} className="modal-tag">{t}</span>)}
          </div>

          <button className="cta-btn">Schedule 360° Walkthrough</button>
        </div>
      </div>
    </div>
  );
}
