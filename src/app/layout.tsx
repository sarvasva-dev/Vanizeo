import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "VaniZero | Zero-Prompt Indic AI Assistant",
  description: "The world's first agentic assistant for Bharat. No prompts, just conversation. Powered by Google Gemini 3.1.",
  keywords: ["Google PromptWars", "Indic AI", "Zero-Prompt", "Gemini 3.1", "Hinglish AI"],
  authors: [{ name: "Sarthak Srivastava" }],
  openGraph: {
    title: "VaniZero - The Zero-Prompt Revolution",
    description: "Built with Google Gemini 3.1 for the next billion users.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi-IN" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FBBF24" />
        <link rel="apple-touch-icon" href="/globe.svg" />
        {/* Google Analytics Placeholder */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-MEASUREMENT_ID"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MEASUREMENT_ID', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="bg-black text-white antialiased overflow-x-hidden selection:bg-indic-gold selection:text-black font-sans">
        {/* Modern Grid Background */}
        <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.05)_0%,_transparent_70%)] pointer-events-none" />
        <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
