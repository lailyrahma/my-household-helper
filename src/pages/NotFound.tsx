import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold">Halaman Tidak Ditemukan</h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <a href="/" className="inline-flex">
            <Button variant="hero" size="lg">
              Kembali ke Beranda
            </Button>
          </a>
          <a href="/dashboard" className="inline-flex">
            <Button variant="hero-outline" size="lg">
              Ke Dashboard
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
