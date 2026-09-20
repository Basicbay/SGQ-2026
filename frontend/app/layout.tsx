import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthSessionProvider, NotificationProvider } from "@/components/providers";
import { getSystemSettings } from "@/lib/settings";
import NextTopLoader from "nextjs-toploader";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings();
  const siteName = settings.siteName || "Site Name";
  const siteDescription = settings.siteDescription || "Site Description";
  const title = `${siteName} | ${siteDescription}`;
  const description = settings.siteDescription || "";
  const iconUrl = settings.iconUrl || "/favicon.ico";

  return {
    title,
    description,
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
    },
    openGraph: {
      title,
      description,
      images: settings.iconUrl ? [{ url: settings.iconUrl }] : [],
    },
  };
}

const themeScript = `(() => {
  try {
    const theme = localStorage.getItem('sgq-theme') === 'light' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();`;



export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", ibmPlexSansThai.variable, geistMono.variable, "font-sans")}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <NextTopLoader
          color="var(--primary, #10b981)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px var(--primary, #10b981),0 0 5px var(--primary, #10b981)"
          zIndex={99999}
          showAtBottom={false}
        />
        <AuthSessionProvider>
          <NotificationProvider>
            <TooltipProvider delay={150}>
              {children}
            </TooltipProvider>
          </NotificationProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
