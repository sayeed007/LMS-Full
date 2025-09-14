import type { Metadata } from "next";
import { Geist, Geist_Mono, Merriweather, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { Toaster } from '@/components/ui/sonner';
// import ToastExample from "@/components/ToastExample";
import ModalExample from "@/components/ModalExample";
import { ModalProviderWithGlobal } from "@/lib/modal-utils";


// Google Fonts
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learning Management System",
  description: "A Leaning Management where you learn and grow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${merriweather.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        {/* Preload the LCP image */}
        {/* <link rel="preload" as="image" href="/icons/RequestDemoPopupLight-min.webp" type="image/webp" /> */}
      </head>


      <body className="min-h-screen bg-body overflow-x-clip">
        <ModalProviderWithGlobal>
          <Header />
          <main>
            {children}

            {/* TOAST EXAMPLE */}
            {/* <ToastExample /> */}

            {/* MODAL EXAMPLE */}
            <ModalExample />

            {/* TOAST */}
            <Toaster
              position="top-right"
              expand={true}
              richColors={true}
              closeButton={true}
              toastOptions={{
                style: {
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                className: 'sonner-toast',
                duration: 3000,
              }}
            />
          </main>
        </ModalProviderWithGlobal>
      </body>
    </html>
  );
}
