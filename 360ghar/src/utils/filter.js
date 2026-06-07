import { properties, getPriceInLakhs } from "../data/properties";

export function filterProperties(filters) {
  if (!filters || Object.keys(filters).length === 0) return [];

  return properties.filter((p) => {
    const priceInLakhs = getPriceInLakhs(p);

    if (filters.bhk && p.bhk !== filters.bhk) return false;
    if (filters.maxPrice && priceInLakhs > filters.maxPrice) return false;
    if (filters.minPrice && priceInLakhs < filters.minPrice) return false;

    if (filters.sectors && filters.sectors.length > 0) {
      const sectorMatch = filters.sectors.some((s) =>
        p.sector.toLowerCase().includes(s.toLowerCase())
      );
      if (!sectorMatch) return false;
    }

    return true;
  });
}

export function rankProperties(filtered, filters) {
  if (!filtered.length) return filtered;

  return [...filtered].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Score by amenity matches
    const amenityFilters = filters.amenities || [];
    scoreA += amenityFilters.filter((am) =>
      a.amenities.some((pa) => pa.toLowerCase().includes(am.toLowerCase()))
    ).length * 10;
    scoreB += amenityFilters.filter((am) =>
      b.amenities.some((pb) => pb.toLowerCase().includes(am.toLowerCase()))
    ).length * 10;

    // Score by facing
    if (filters.facing) {
      if (a.facing.toLowerCase().includes(filters.facing.toLowerCase())) scoreA += 5;
      if (b.facing.toLowerCase().includes(filters.facing.toLowerCase())) scoreB += 5;
    }

    // Score by keywords
    const keywords = filters.keywords || [];
    const aText = `${a.title} ${a.tags.join(" ")} ${a.amenities.join(" ")}`.toLowerCase();
    const bText = `${b.title} ${b.tags.join(" ")} ${b.amenities.join(" ")}`.toLowerCase();
    keywords.forEach((kw) => {
      if (aText.includes(kw.toLowerCase())) scoreA += 3;
      if (bText.includes(kw.toLowerCase())) scoreB += 3;
    });

    return scoreB - scoreA;
  });
}

export function getMatchBadge(property, filters) {
  const badges = [];

  const amenityFilters = filters.amenities || [];
  amenityFilters.forEach((am) => {
    const match = property.amenities.find((pa) =>
      pa.toLowerCase().includes(am.toLowerCase())
    );
    if (match) badges.push(match);
  });

  if (filters.facing && property.facing.toLowerCase().includes(filters.facing.toLowerCase())) {
    badges.push(`${property.facing} facing`);
  }

  if (property.nearbySchools.length > 0 && amenityFilters.some(a => a.toLowerCase().includes("school"))) {
    if (badges.indexOf("School Nearby") === -1) badges.push(`Near ${property.nearbySchools[0]}`);
    else {
      const idx = badges.indexOf("School Nearby");
      badges[idx] = `Near ${property.nearbySchools[0]}`;
    }
  }

  const priceInLakhs = getPriceInLakhs(property);
  if (filters.maxPrice && priceInLakhs <= filters.maxPrice * 0.9) {
    badges.push("Under budget");
  }

  return badges.slice(0, 3);
}
