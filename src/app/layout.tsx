import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

export const viewport: Viewport = {
    themeColor: '#000000',
    viewportFit: 'cover',
};

export const metadata: Metadata = {
    title: 'Xperimental Hub',
    description: 'Servidor de Material Audiovisual',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="es" className="dark" data-theme="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Contrail+One&family=Encode+Sans+SC:wght@400;700&family=Faster+One&family=Limelight&family=Roboto+Condensed:wght@400;700&family=Trocchi&family=Caveat:wght@400;700&family=Cinzel:wght@400;700;900&family=JetBrains+Mono:wght@400;700&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet" />
            </head>
            <body className="font-body antialiased min-h-screen" style={{ backgroundColor: 'var(--sm-bg-base)', color: 'var(--sm-text-primary)' }}>
                <GlobalErrorBoundary>
                    {children}
                </GlobalErrorBoundary>
            </body>
        </html>
    );
}
