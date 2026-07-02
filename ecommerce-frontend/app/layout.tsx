'use client';

import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartSidebar } from '@/components/cart'; // ⭐ AJOUT
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');
  const isHomePage = pathname === '/';
  const isStudioPage = pathname?.includes('/studio');
  const isShopPage = pathname?.startsWith('/shop/');

  return (
    <html lang="fr">
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <CartProvider>
                {!isAuthPage && !isStudioPage && !isShopPage && <Header />}

                <main className={`flex-grow ${!isAuthPage && !isStudioPage && !isShopPage ? 'pt-16' : ''}`}>
                  {children}
                </main>

                {!isHomePage && !isAuthPage && !isStudioPage && !isShopPage && <Footer />}

                <CartSidebar /> {/* ⭐ AJOUT — dispo sur toutes les pages */}

                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                  }}
                />
              </CartProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}