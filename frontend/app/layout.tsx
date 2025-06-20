import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { jaJP } from "@clerk/localizations";
import { Provider } from "jotai";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartIntern",
  description: "SmartIntern",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={jaJP}>
      <Provider>
        <html lang="ja">
          <body className={`${outfit.className} antialiased`}>
            <StagewiseToolbar
              config={{
                plugins: [],  
              }}
            />
            {children}
          </body>
        </html>
      </Provider>
    </ClerkProvider>
  );
}
