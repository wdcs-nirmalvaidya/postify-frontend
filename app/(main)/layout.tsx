import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-4 ml-64">{children}</div>
      </div>
      <Footer />
    </>
  );
}
