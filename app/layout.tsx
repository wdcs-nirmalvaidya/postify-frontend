import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "@/utils/context/ChatContext";
import Navbar from "@/components/layout/Navbar";
import { NotificationsProvider } from "@/utils/context/NotificationsContext";

export const metadata = {
  title: "Postify",
  description: "A modern social media platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <ChatProvider>
          <NotificationsProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <Navbar />
            <main>{children}</main>
          </NotificationsProvider>
        </ChatProvider>
      </body>
    </html>
  );
}
