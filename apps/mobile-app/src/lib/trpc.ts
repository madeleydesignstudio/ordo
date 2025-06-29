// import { createTRPCReact } from '@trpc/react-query'
// import { httpBatchLink } from '@trpc/client'
// import { Platform } from 'react-native'
// import Constants from 'expo-constants'
// import type { AppRouter } from '@ordo/backend/src/trpc/router'

// export const trpc = createTRPCReact<AppRouter>()

// // Get the correct API URL based on platform and environment
// const getApiUrl = () => {
//   // Check for custom API URL in environment variables
//   const customApiUrl = process.env.EXPO_PUBLIC_API_URL
//   if (customApiUrl) {
//     return `${customApiUrl}/trpc`
//   }

//   // In development, use the development server's IP
//   if (__DEV__) {
//     // Get the IP address from Expo's manifest
//     const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0]
    
//     if (Platform.OS === 'android') {
//       // Android emulator uses 10.0.2.2 to reach the host machine
//       return debuggerHost ? `http://${debuggerHost}:8787/trpc` : 'http://10.0.2.2:8787/trpc'
//     } else {
//       // iOS simulator and physical devices use the development machine's IP
//       return debuggerHost ? `http://${debuggerHost}:8787/trpc` : 'http://localhost:8787/trpc'
//     }
//   }

//   // Production URL (replace with your actual production API URL)
//   return 'https://your-production-api.example.com/trpc'
// }

// export const createTRPCClient = (getToken: () => Promise<string | null>) => {
//   const apiUrl = getApiUrl()
  
//   console.log('🚀 Mobile app connecting to API:', apiUrl)
  
//   return trpc.createClient({
//     transformer: undefined,
//     links: [
//       httpBatchLink({
//         url: apiUrl,
//         async headers() {
//           const token = await getToken()
//           return {
//             authorization: token ? `Bearer ${token}` : '',
//           }
//         },
//       }),
//     ],
//   })
// } 

import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@ordo/backend/src/trpc/router'

export const trpc = createTRPCReact<AppRouter>()

export const createTRPCClient = (getToken: () => Promise<string | null>) => {
  // Use ngrok tunnel URL for external access
  const apiUrl = 'https://4567-94-7-8-23.ngrok-free.app/trpc'
  
  console.log('🚀 Mobile app connecting to API:', apiUrl)
  
  return trpc.createClient({
    transformer: undefined,
    links: [
      httpBatchLink({
        url: apiUrl,
        async headers() {
          const token = await getToken()
          return {
            authorization: token ? `Bearer ${token}` : '',
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json',
          }
        },
      }),
    ],
  })
}