import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chess Puzzle Difficulty Classification — IS-212 Data Mining Project",
  description: "Predicting the difficulty class of 50,000 Lichess chess puzzles from board features and metadata. Descriptive Apriori mining plus six classifiers evaluated under one protocol.",
  keywords: ["data mining", "chess", "classification", "Lichess", "machine learning", "Apriori", "Random Forest", "IS-212"],
  authors: [{ name: "Hein Htet Zaw", url: "" }],
  openGraph: {
    title: "Chess Puzzle Difficulty Classification",
    description: "IS-212 Data Mining Project — 50,000 Lichess puzzles, six classifiers, macro F1 0.5909",
    siteName: "Chess Puzzle Project",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chess Puzzle Difficulty Classification",
    description: "IS-212 Data Mining Project — six classifiers on 50,000 Lichess puzzles",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
