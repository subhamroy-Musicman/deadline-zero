import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Sidebar from "@/components/Sidebar";
import ParticlesBackground from "@/components/ParticlesBackground";
import CommandPalette from "@/components/CommandPalette";
import AlarmManager from "@/components/AlarmManager";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Deadline Zero - Your Proactive Productivity Companion",
  description: "An AI-powered productivity companion that proactively assists users in planning, prioritizing, and completing tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var state = localStorage.getItem('deadline-zero-storage');
                  var theme = 'cyberpunk';
                  var mode = 'dark';
                  if (state) {
                    var parsed = JSON.parse(state);
                    if (parsed && parsed.state) {
                      theme = parsed.state.theme || theme;
                      mode = parsed.state.mode || mode;
                    }
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.setAttribute('data-mode', mode);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ParticlesBackground />
        <div className="app-container" suppressHydrationWarning>
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <CommandPalette />
        <AlarmManager />
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
