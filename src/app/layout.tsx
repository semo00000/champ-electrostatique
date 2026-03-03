import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";
import { ProgressProvider } from "@/lib/progress/context";
import { SubscriptionProvider } from "@/lib/subscription/context";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { LevelUpToast } from "@/components/gamification/LevelUpToast";
import { ThemeTransition } from "@/components/layout/ThemeTransition";
import { LangTransition } from "@/components/layout/LangTransition";
import { getCurriculum } from "@/lib/curriculum";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

export const metadata: Metadata = {
  title: {
    default: "BAC Sciences - Plateforme Educative Interactive",
    template: "%s | BAC Sciences",
  },
  description:
    "Cours interactifs, simulations GPU, exercices et quiz pour le Baccalaureat marocain. Sciences Mathematiques et Sciences Physiques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const curriculum = getCurriculum();

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexArabic.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <ProgressProvider>
                <SubscriptionProvider>
                <Header />
                <div className="flex pt-[var(--spacing-header)]">
                  <Sidebar curriculum={curriculum} />
                  <main className="flex-1 md:ms-[var(--spacing-sidebar)] min-h-[calc(100vh-var(--spacing-header))] overflow-y-auto pb-16 md:pb-0">
                    <div className="max-w-[var(--spacing-content-max)] mx-auto px-4 md:px-8 py-6">
                      {children}
                    </div>
                  </main>
                </div>
                <MobileNav />
                <LevelUpToast />
                <ThemeTransition />
                <LangTransition />
                </SubscriptionProvider>
              </ProgressProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
