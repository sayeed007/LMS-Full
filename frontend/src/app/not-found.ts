// METHOD 1: Client-side redirect
// For Pages Router: pages/404.js
// For App Router: app/not-found.js

// import { useEffect } from 'react';
// import { useRouter } from 'next/router'; // For Pages Router
// import { useRouter } from 'next/navigation'; // For App Router

// export default function Custom404() {
//     const router = useRouter();

//     useEffect(() => {
//         // Redirect to home page immediately
//         router.replace('/');
//     }, [router]);

//     // Optional: Show loading state while redirecting
//     return (
//         <div style={{
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             height: '100vh'
//         }}>
//             <p>Redirecting...</p>
//         </div>
//     );
// }

// METHOD 2: Server-side redirect (Pages Router only)
// Alternative approach for pages/404.js

// export async function getServerSideProps() {
//     return {
//         redirect: {
//             destination: '/',
//             permanent: false,
//         },
//     };
// }

// METHOD 3: App Router with server-side redirect
// For app/not-found.js (App Router)

import { redirect } from 'next/navigation';

export default function NotFound() {
    redirect('/dashboard');
}