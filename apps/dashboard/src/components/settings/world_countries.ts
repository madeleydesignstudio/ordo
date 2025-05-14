// This file should export GeoJSON features for world countries
// For a complete GeoJSON dataset, use a package like world-atlas or download from a GeoJSON source

// This is a placeholder file
// To properly implement this, install the world-atlas package:
// pnpm add world-atlas
// Then replace this content with:
//
// import countries from 'world-atlas/countries-110m.json'
// export const features = countries.features
//
// For now, we'll use a minimal valid structure

export const features = [
  {
    "type": "Feature",
    "id": "USA",
    "properties": { "name": "United States" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [-125, 25], [-125, 50], [-65, 50], [-65, 25], [-125, 25]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "CAN", 
    "properties": { "name": "Canada" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [-140, 50], [-140, 70], [-60, 70], [-60, 50], [-140, 50]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "MEX",
    "properties": { "name": "Mexico" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [-120, 15], [-120, 32], [-85, 32], [-85, 15], [-120, 15]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "GBR", 
    "properties": { "name": "United Kingdom" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [-10, 50], [-10, 60], [2, 60], [2, 50], [-10, 50]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "FRA",
    "properties": { "name": "France" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [-5, 42], [-5, 52], [8, 52], [8, 42], [-5, 42]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "DEU",
    "properties": { "name": "Germany" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [6, 47], [6, 55], [15, 55], [15, 47], [6, 47]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "RUS",
    "properties": { "name": "Russia" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [30, 50], [30, 70], [180, 70], [180, 50], [30, 50]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "CHN",
    "properties": { "name": "China" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [80, 20], [80, 45], [130, 45], [130, 20], [80, 20]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "JPN",
    "properties": { "name": "Japan" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [130, 30], [130, 45], [145, 45], [145, 30], [130, 30]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "AUS",
    "properties": { "name": "Australia" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [115, -40], [115, -10], [155, -10], [155, -40], [115, -40]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "BRA",
    "properties": { "name": "Brazil" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [-75, -35], [-75, 5], [-35, 5], [-35, -35], [-75, -35]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "ZAF",
    "properties": { "name": "South Africa" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [15, -35], [15, -20], [35, -20], [35, -35], [15, -35]
      ]]
    }
  },
  {
    "type": "Feature",
    "id": "IND",
    "properties": { "name": "India" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [70, 5], [70, 35], [90, 35], [90, 5], [70, 5]
      ]]
    }
  }
];