import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Bell, 
  ShoppingCart, 
  Users, 
  Store, 
  FileText,
  ArrowRight,
  Check,
  Star,
  AlertTriangle,
  Calendar,
  Smartphone
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import problemImage from "@/assets/problem-illustration.jpg";
import solutionImage from "@/assets/solution-illustration.jpg";

const Landing = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Prediksi Kebutuhan",
      description: "Analisis pola konsumsi untuk memprediksi kapan stok akan habis dengan akurasi tinggi"
    },
    {
      icon: Bell,
      title: "Reminder Otomatis", 
      description: "Notifikasi cerdas sebelum stok habis, tidak akan pernah kehabisan barang penting lagi"
    },
    {
      icon: ShoppingCart,
      title: "Daftar Belanja Pintar",
      description: "Daftar belanja otomatis berdasarkan stok yang menipis dan pola konsumsi Anda"
    },
    {
      icon: Users,
      title: "Kolaborasi Multi-User",
      description: "Koordinasi sempurna antar anggota rumah tangga atau penghuni kos"
    },
    {
      icon: Store,
      title: "Integrasi Marketplace",
      description: "Belanja langsung melalui Shopee, Tokopedia dan platform e-commerce lainnya"
    },
    {
      icon: FileText,
      title: "Laporan Konsumsi",
      description: "Analisis detail pengeluaran dan insight untuk mengoptimalkan budget rumah tangga"
    }
  ];

  const problems = [
    "Sering kehabisan barang penting di saat genting?",
    "Belanja dobel karena kurang koordinasi?", 
    "Catatan stok masih manual dan sering hilang?"
  ];

  const solutions = [
    "Mengingatkan stok sebelum habis",
    "Membantu koordinasi antar anggota rumah tangga/kos",
    "Membuat daftar belanja otomatis",
    "Memberikan laporan konsumsi"
  ];

  const freeFeatures = [
    "Catatan stok barang dasar",
    "Reminder maksimal 5 item", 
    "Daftar belanja manual",
    "1 user per akun"
  ];

  const premiumFeatures = [
    "Semua fitur Free",
    "Reminder tanpa batas",
    "Daftar belanja otomatis & pintar",
    "Kolaborasi multi-user", 
    "Integrasi marketplace",
    "Laporan konsumsi detail",
    "Akses prioritas tips & seminar"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">StockHome</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  🏠 Sistem Inventaris Cerdas
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="gradient-text">StockHome</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Sistem manajemen inventaris rumah tangga yang cerdas dengan fitur berikut ini 
                  <span className="text-primary font-semibold"> notifikasi otomatis</span>, 
                  <span className="text-accent font-semibold"> daftar belanja pintar</span>, dan 
                  <span className="text-secondary font-semibold"> analisis konsumsi</span>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 relative z-20">
                <Link to="/login">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Daftar Sekarang
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-primary transition-all duration-500">
                <img 
                  src={heroImage} 
                  alt="Smart home inventory management system"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Bell className="w-8 h-8 text-secondary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src={problemImage} 
                alt="Common household inventory problems"
                className="w-full h-auto rounded-2xl shadow-card"
              />
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-warning/10 text-warning border-warning/20">
                  ⚠️ Masalah Umum
                </Badge>
                <h2 className="text-4xl font-bold">
                  Masalah yang Sering Dihadapi
                </h2>
              </div>
              <div className="space-y-4">
                {problems.map((problem, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-card rounded-xl shadow-card">
                    <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    </div>
                    <p className="text-lg text-card-foreground">{problem}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-success/10 text-success border-success/20">
                  ✅ Solusi Cerdas
                </Badge>
                <h2 className="text-4xl font-bold">
                  StockHome Hadir untuk Mengatasi Semua Masalah Anda
                </h2>
              </div>
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-card rounded-xl shadow-card">
                    <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <p className="text-lg text-card-foreground">{solution}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src={solutionImage} 
                alt="StockHome smart solutions"
                className="w-full h-auto rounded-2xl shadow-card"
              />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-success rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8 text-success-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-accent/10 text-accent border-accent/20">
              🚀 Fitur Unggulan
            </Badge>
            <h2 className="text-4xl font-bold">Fitur-Fitur Canggih StockHome</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Teknologi terdepan untuk mengelola inventaris rumah tangga Anda dengan efisien
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-secondary/10 text-secondary border-secondary/20">
              💎 Paket Berlangganan
            </Badge>
            <h2 className="text-4xl font-bold">Pilih Paket yang Tepat untuk Anda</h2>
            <p className="text-xl text-muted-foreground">
              Mulai gratis atau nikmati fitur lengkap dengan Premium
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 relative">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">Free</h3>
                  <p className="text-3xl font-bold text-primary mt-2">Gratis</p>
                  <p className="text-muted-foreground">Untuk memulai</p>
                </div>
                <div className="space-y-3">
                  {freeFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link to="/register" className="block">
                  <Button variant="hero-outline" size="lg" className="w-full">
                    Mulai Gratis
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 relative border-primary/50 shadow-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  ⭐ Terpopuler
                </Badge>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">Premium</h3>
                  <p className="text-3xl font-bold text-primary mt-2">Rp 20.000</p>
                  <p className="text-muted-foreground">per bulan</p>
                </div>
                <div className="space-y-3">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <span className={index === 0 ? "font-semibold" : ""}>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link to="/register" className="block">
                  <Button variant="hero" size="lg" className="w-full">
                    Pilih Premium
                    <Star className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Mulai Atur Stok Rumah Tangga dengan Lebih Cerdas
            </h2>
            <p className="text-xl opacity-90">
              Bergabunglah dengan ribuan keluarga yang sudah merasakan kemudahan 
              mengelola inventaris rumah tangga dengan StockHome
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                  Daftar Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-80">
            Copyright © 2025 StockHome. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;