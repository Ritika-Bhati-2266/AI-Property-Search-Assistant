import React, { useState, useRef, useEffect } from "react";
import { Search, Mic, MicOff, Loader2, SlidersHorizontal, BarChart2, X } from "lucide-react";
import PropertyCard from "./components/PropertyCard";
import PropertyModal from "./components/PropertyModal";
import CompareModal from "./components/CompareModal";
import { parseSearchQuery, generateFollowUp } from "./utils/openrouter";
import { filterProperties, rankProperties } from "./utils/filter";
import { properties as allProperties } from "./data/properties";
import "./App.css";

const EXAMPLE_QUERIES = [
  "2BHK in Sector 50 under ₹80 lakhs, good sunlight, near school",
  "3BHK luxury apartment in Sector 54 with pool",
  "Affordable 1BHK near metro in Gurgaon",
  "Spacious 4BHK under 2 crore with golf view",
];

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState(null);
  const [searched, setSearched] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [followUp, setFollowUp] = useState(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Restore query from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) { setQuery(decodeURIComponent(q)); }
  }, []);

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setFollowUp(null);
    setSearched(true);

    // Update URL for shareable link
    const url = new URL(window.location);
    url.searchParams.set("q", encodeURIComponent(q));
    window.history.replaceState({}, "", url);

    try {
      const parsed = await parseSearchQuery(q);
      setFilters(parsed);

    const filtered = filterProperties(parsed);
    const ranked = rankProperties(filtered, parsed);
    let finalResults = ranked;
    if (ranked.length === 0) {
      const relaxed = { ...parsed, sectors: [] };
      const relaxedFiltered = filterProperties(relaxed);
      finalResults = rankProperties(
        relaxedFiltered.length > 0 ? relaxedFiltered : allProperties,
        parsed
      );
    }
    setResults(finalResults);

      // AI follow-up (fire and forget)
      generateFollowUp(q, parsed).then(setFollowUp).catch(() => {});
    } catch (err) {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice search is only supported in Chrome. Please try Chrome.");
      return;
    }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
      setTimeout(() => handleSearch(transcript), 200);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const toggleCompare = (property) => {
    setCompareList((prev) => {
      if (prev.find((p) => p.id === property.id)) return prev.filter((p) => p.id !== property.id);
      if (prev.length >= 2) return [prev[1], property];
      return [...prev, property];
    });
  };

  return (
    <div className="app">
      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-360">360</span>
            <span className="logo-ghar">GHAR</span>
            <span className="logo-tag">AI + VR Real Estate</span>
          </div>
          <div className="header-badge">Gurgaon · NCR</div>
        </div>
      </header>

      {/* ── HERO SEARCH ── */}
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">
            Find your <em>perfect</em> home<br />in Gurgaon
          </h1>
          <p className="hero-sub">Describe what you're looking for in plain English</p>

          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              ref={inputRef}
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. 2BHK in Sector 50 under ₹80L, good sunlight, near school..."
            />
            <button
              className={`voice-btn ${listening ? "active" : ""}`}
              onClick={toggleVoice}
              title={listening ? "Stop listening" : "Voice search"}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              className="search-btn"
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
            >
              {loading ? <Loader2 size={18} className="spin" /> : "Search"}
            </button>
          </div>

          {!searched && (
            <div className="example-queries">
              {EXAMPLE_QUERIES.map((q, i) => (
                <button key={i} className="example-chip" onClick={() => { setQuery(q); handleSearch(q); }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {listening && (
            <div className="listening-indicator">
              <span className="pulse" />
              Listening… speak now
            </div>
          )}
        </div>
      </section>

      {/* ── RESULTS ── */}
      {searched && (
        <section className="results-section">
          <div className="results-inner">
            {error && <div className="error-banner">{error}</div>}

            {followUp && !loading && (
              <div className="followup-bar">
                <span className="followup-icon">💡</span>
                <span>{followUp}</span>
                <button onClick={() => setFollowUp(null)}><X size={14} /></button>
              </div>
            )}

            {filters && !loading && (
              <div className="filter-summary">
                <SlidersHorizontal size={15} />
                <span>
                  {filters.bhk ? `${filters.bhk}BHK · ` : ""}
                  {filters.sectors?.length ? `${filters.sectors.join(", ")} · ` : ""}
                  {filters.maxPrice ? `Under ₹${filters.maxPrice}L · ` : ""}
                  {filters.amenities?.slice(0, 2).join(" · ")}
                  {results.length > 0 ? `  —  ${results.length} properties found` : ""}
                </span>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <Loader2 size={36} className="spin" />
                <p>Searching with AI…</p>
              </div>
            ) : results.length === 0 ? (
              <div className="empty-state">
                <p>No matches found. Try broadening your search.</p>
              </div>
            ) : (
              <div className="property-grid">
                {results.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    filters={filters || {}}
                    onSelect={setSelectedProperty}
                    isCompare={compareList.some((c) => c.id === p.id)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── COMPARE TRAY ── */}
      {compareList.length > 0 && (
        <div className="compare-bar">
          <span className="compare-count">
            <BarChart2 size={16} />
            {compareList.length === 1 ? "Select 1 more to compare" : "Ready to compare"}
          </span>
          <div className="compare-thumbs">
            {compareList.map((p) => (
              <span key={p.id} className="compare-thumb-name">{p.title}</span>
            ))}
          </div>
          {compareList.length === 2 && (
            <button className="compare-go-btn" onClick={() => setShowCompare(true)}>
              Compare Now →
            </button>
          )}
          <button className="compare-clear" onClick={() => setCompareList([])}><X size={16} /></button>
        </div>
      )}

      {/* ── MODALS ── */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          userQuery={query}
          onClose={() => setSelectedProperty(null)}
        />
      )}
      {showCompare && compareList.length === 2 && (
        <CompareModal properties={compareList} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}
