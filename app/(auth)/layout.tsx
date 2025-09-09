import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import "../globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </>
  );
}
