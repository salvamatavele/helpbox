import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PwaRegistrar } from "@/components/pwa-registrar";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { TelegramBottomNav } from "@/components/telegram/bottom-nav";
import { TelegramFab } from "@/components/telegram/fab";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3004";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Helpbox | Apoio & Queixas no Anonimato",
    template: "%s | Helpbox",
  },
  description:
    "Espaço seguro e confidencial de acolhimento psicossocial, escuta ativa e canal de queixas no estrito anonimato com acompanhamento profissional.",
  keywords: [
    "Helpbox",
    "apoio anónimo",
    "queixas",
    "denúncias",
    "assistência social",
    "apoio psicossocial",
    "ouvidoria",
    "canal ético",
    "segurança psicológica",
    "direitos humanos",
  ],
  authors: [{ name: "Helpbox Care & Social Engineering Team" }],
  creator: "Helpbox",
  publisher: "Helpbox",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "pt": "/",
      "en": "/?lang=en",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt",
    alternateLocale: "en",
    url: siteUrl,
    title: "Helpbox | Apoio & Queixas no Anonimato",
    description:
      "A sua voz tem valor. Espaço ético e seguro para apoio psicossocial, queixas e relatos sem rastreamento de IP ou necessidade de identificação.",
    siteName: "Helpbox",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Helpbox - Plataforma de Apoio e Queixas no Anonimato",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helpbox | Apoio & Queixas no Anonimato",
    description:
      "A sua voz tem valor. Apoio social e queixas em total anonimato e acolhimento humanizado.",
    images: [`${siteUrl}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Helpbox",
  },
};

export const viewport: Viewport = {
  themeColor: "#2481cc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// JSON-LD Structured Data for Search Engines
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#app`,
      "name": "Helpbox",
      "url": siteUrl,
      "applicationCategory": "HealthApplication, SocialNetworkingApplication",
      "operatingSystem": "All",
      "description": "Plataforma segura de apoio, queixas e escuta ativa no estrito anonimato.",
      "featureList": [
        "Envio 100% anónimo sem recolha de IP",
        "Código criptográfico único de rastreio",
        "Acolhimento com profissionais de assistência social",
        "Diálogo seguro bidirecional",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "Helpbox",
      "url": siteUrl,
      "logo": `${siteUrl}/favicon.svg`,
      "description": "Espaço ético e confidencial de apoio e queixas no anonimato.",
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Como é garantido o anonimato no Helpbox?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "O Helpbox não recolhe nem armazena endereços IP, geolocalização ou identificadores do navegador. Cada caso recebe um código criptográfico e um PIN único para acompanhamento seguro."
          }
        },
        {
          "@type": "Question",
          "name": "Preciso de me identificar para pedir apoio ou relatar uma queixa?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Não. A identificação é totalmente voluntária. Pode relatar de forma estritamente anónima ou fornecer contactos apenas se desejar retorno direto."
          }
        },
        {
          "@type": "Question",
          "name": "Como posso acompanhar a resposta ao meu caso?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Basta aceder à secção 'Consultar Caso' e introduzir o seu Código de Rastreio (ex: HB-XXXX-XXX) e o PIN de 6 dígitos gerados na submissão."
          }
        }
      ]
    }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <I18nProvider>
          <PwaRegistrar />
          <PwaInstallPrompt />
          <Navbar />
          <main className="flex-1 flex flex-col pb-16 sm:pb-18">{children}</main>
          <Footer />
          <TelegramFab />
          <TelegramBottomNav />
        </I18nProvider>
      </body>
    </html>
  );
}
