// import { Contact } from '~/components/content-manager/columns';
// import { auth } from '../server/auth';

// interface GooglePerson {
//   resourceName?: string;
//   names?: Array<{
//     givenName?: string;
//     familyName?: string;
//     displayName?: string;
//   }>;
//   emailAddresses?: Array<{
//     value?: string;
//   }>;
//   phoneNumbers?: Array<{
//     value?: string;
//   }>;
//   organizations?: Array<{
//     name?: string;
//   }>;
// }

// /**
//  * Fetches Google contacts for the authenticated user
//  * Uses the Better-Auth Google OAuth integration
//  */
// export async function getGoogleContacts(headers: Headers): Promise<Contact[]> {
//   try {
//     // On the server side, check if user is authenticated
//     const session = await auth.api.getSession({
//       headers,
//     });

//     if (!session) {
//       throw new Error('User is not authenticated');
//     }

//     let accessToken: string;

//     // Attempt to get the token in a way that works in both server and browser contexts
//     try {
//       // For server-side, use a direct API call that avoids Buffer usage
//       const tokenEndpoint = `${import.meta.env.VITE_BASE_URL}/api/auth/token?provider=google`;
//       const response = await fetch(tokenEndpoint, {
//         method: 'GET',
//         headers: {
//           'Cookie': headers.get('cookie') || '',
//         },
//       });
      
//       if (!response.ok) {
//         throw new Error('Token endpoint failed');
//       }
      
//       const data = await response.json();
//       accessToken = data.access_token || data.accessToken;
//     } catch (e) {
//       console.error('Error getting token via API:', e);
//       throw new Error('Failed to retrieve Google access token');
//     }

//     if (!accessToken) {
//       throw new Error('No Google access token available');
//     }

//     // Fetch contacts from Google People API
//     const response = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations&pageSize=100&sortOrder=LAST_MODIFIED_DESCENDING', {
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch Google contacts: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
//     const connections = data.connections || [];

//     // Map Google contacts to our Contact model
//     return connections.map((person: GooglePerson): Contact => {
//       const name = person.names?.[0] || {};
//       const email = person.emailAddresses?.[0]?.value || '';
//       const phone = person.phoneNumbers?.[0]?.value || '';
//       const company = person.organizations?.[0]?.name || '';

//       return {
//         id: person.resourceName || '',
//         firstName: name.givenName || '',
//         lastName: name.familyName || '',
//         email,
//         phone,
//         company,
//         status: getStatusFromEmail(email),
//       };
//     });
//   } catch (error) {
//     // Log the error for debugging
//     console.error('Error fetching Google contacts:', error);
    
//     // Return empty array instead of mock data
//     return [];
//   }
// }

// /**
//  * Determine status based on email domain
//  */
// function getStatusFromEmail(email: string): Contact['status'] {
//   if (!email) return 'inactive';
  
//   if (email.includes('gmail.com')) return 'active';
//   if (email.includes('hotmail.com') || email.includes('outlook.com')) return 'lead';
//   return 'customer';
// } 