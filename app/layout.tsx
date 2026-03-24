import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "@/utils/context/ChatContext";
import Navbar from "@/components/layout/Navbar";
import { NotificationsProvider } from "@/utils/context/NotificationsContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata = {
  title: "Postify",
  description: "A modern social media platform.",
};

import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ChatProvider>
            <NotificationsProvider>
              <Toaster position="top-center" reverseOrder={false} />
              <main className="flex-1 flex flex-col">{children}</main>
            </NotificationsProvider>
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
