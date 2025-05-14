import { ResponsiveChoropleth } from '@nivo/geo'
import { features } from './world_countries' // You'll need to add this geojson data
import { useMemo } from 'react'

// User location data
type LocationData = {
  id: string // Country code
  value: number // Always 100 for the user's country
}

// Feature type for the GeoJSON data
// type GeoFeature = {
//   type: string
//   id: string
//   properties: {
//     name: string
//   }
//   geometry: {
//     type: string
//     coordinates: Array<any>
//   }
//   data?: {
//     value: number
//   }
// }

interface GeoMapProps {
  data: LocationData[]
}

export function UserLoginMap({ data }: GeoMapProps) {
  // Use a high contrast theme - only the user's country will be visible with a distinct color
  const colors = useMemo(() => ["#cbd5e0", "#4299e1"], [])
  
  // Ensure we have valid features for Nivo to render
  const validFeatures = useMemo(() => {
    // Safety check to ensure features is an array with valid coordinates
    return features && features.length > 0 && 
           features.every(f => 
             f.geometry && 
             f.geometry.coordinates && 
             f.geometry.coordinates[0] && 
             f.geometry.coordinates[0].length > 0)
      ? features
      : [];
  }, []);

  // If no valid features, show a message
  if (validFeatures.length === 0) {
    return (
      <div className="h-[400px] w-full cursor-default flex items-center justify-center">
        <p>Map data unavailable. Please install world-atlas package.</p>
      </div>
    );
  }
  
  return (
    <div className="h-[400px] w-full cursor-default rounded-md border">
      <ResponsiveChoropleth
        data={data}
        features={validFeatures}
        margin={{ top: 10, right: 10, bottom: 60, left: 10 }}
        colors={colors}
        domain={[0, 100]}
        unknownColor="#e2e8f0"
        label="properties.name"
        valueFormat=".2s"
        projectionType="equirectangular"
        projectionScale={100} 
        projectionTranslation={[0.5, 0.5]}
        projectionRotation={[0, 0, 0]}
        enableGraticule={true}
        graticuleLineColor="#a0aec0"
        borderWidth={0.5}
        borderColor="#64748b"
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 50,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            symbolSize: 20,
            itemTextColor: 'hsl(var(--foreground))',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: 'hsl(var(--primary))',
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        // // @ts-expect-error - The props structure is correct but types are not aligning
        // tooltip={(props) => (
        //   <div className="rounded-md bg-background p-2 shadow-md cursor-help">
        //     <strong>{props.feature.properties?.name}</strong>
        //     <div>Logins: {props.feature.data?.value || 0}</div>
        //   </div>
        // )}
      />
    </div>
  )
}
