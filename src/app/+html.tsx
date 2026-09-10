import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * Root HTML document for web export in Expo Router.
 * Configura las etiquetas meta requeridas para el funcionamiento como PWA (Progressive Web App)
 * y la recepción de Web Push notifications en Safari iOS (iPhone) y navegadores de escritorio/Android.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>Kyrara Barber</title>

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Configuración PWA para Apple iOS (iPhone/iPad) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kyrara" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png?v=3" />

        {/* Favicons y PWA Icons */}
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png?v=3" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=3" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon.png?v=3" />

        {/* Color de tema para barra de navegación */}
        <meta name="theme-color" content="#101415" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
