import type { Metadata } from "next";
import { Syne, Nunito_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-syne",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Gerador de Apresentações — Ybera",
  description: "Preencha um briefing e receba uma apresentação no padrão visual Ybera.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${syne.variable} ${nunitoSans.variable} ${dmMono.variable} antialiased`}>
        {/* Aplica o tema salvo antes da pintura — evita flash de tema errado */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("tema")==="light")document.documentElement.dataset.tema="light"}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
