import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  User,
  LogOut,
  ChevronDown,
  Settings,
  Home,
  Plus,
  AlertTriangle,
  CheckCircle,
  Info,
  ShoppingCart,
  Package
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoStockHome from "@/assets/logo-gambar.png";

const Notifications = () => {
  const { id } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || !id) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const houses = [
    { id: "1", name: "Rumah A" },
    { id: "2", name: "Kos B" }
  ];

  const currentHouse = houses.find(h => h.id === id) || { name: "Rumah Tidak Ditemukan" };

  const notifications = [
    {
      id: 1,
      type: "warning",
      title: "Stok Beras Menipis",
      message: "Beras tinggal 2 kg, segera isi ulang untuk kebutuhan minggu ini",
      time: "2 jam yang lalu",
      read: false,
      icon: AlertTriangle,
      action: "Lihat Stok"
    },
    {
      id: 2,
      type: "success",
      title: "Belanja Selesai",
      message: "Rani menandai Minyak Goreng (2 botol) sudah dibeli",
      time: "4 jam yang lalu",
      read: false,
      icon: CheckCircle,
      action: "Lihat Detail"
    },
    {
      id: 3,
      type: "warning",
      title: "Prediksi Barang Habis",
      message: "Sabun Mandi diprediksi akan habis dalam 3 hari",
      time: "6 jam yang lalu",
      read: false,
      icon: AlertTriangle,
      action: "Tambah ke Belanja"
    },
    {
      id: 4,
      type: "info",
      title: "Anggota Baru",
      message: "Budi Santoso bergabung sebagai anggota rumah",
      time: "1 hari yang lalu",
      read: true,
      icon: Info,
      action: "Lihat Profil"
    },
    {
      id: 5,
      type: "success",
      title: "Stok Ditambahkan",
      message: "Andi menambahkan Gula Pasir (3 kg) ke inventaris",
      time: "1 hari yang lalu",
      read: true,
      icon: Package,
      action: "Lihat Stok"
    },
    {
      id: 6,
      type: "info",
      title: "Daftar Belanja Baru",
      message: "Sari membuat daftar belanja untuk minggu depan",
      time: "2 hari yang lalu",
      read: true,
      icon: ShoppingCart,
      action: "Lihat Daftar"
    },
  ];

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-orange-500/10 text-orange-600";
      case "success":
        return "bg-green-500/10 text-green-600";
      case "info":
        return "bg-blue-500/10 text-blue-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar houseId={id} />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 flex-1">
                <img
                  src={logoStockHome}
                  alt="Logo StockHome"
                  className="w-8 h-8 object-contain mr-0"
                />
              <h1 className="text-xl font-bold">StockHome</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1 sm:gap-2 text-sm">
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">{currentHouse.name}</span>
                    <ChevronDown className="w-4 h-4 hidden sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {houses.map((house) => (
                    <DropdownMenuItem key={house.id} onClick={() => navigate(`/house/${house.id}`)}>
                      <Home className="w-4 h-4 mr-2" />
                      {house.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Kelola Rumah
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:w-auto sm:px-4 sm:gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">{user.email}</span>
                    <ChevronDown className="w-4 h-4 hidden sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Edit Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Ganti Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 space-y-4 p-4 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Notifikasi</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Semua pemberitahuan dan update untuk {currentHouse.name}
                </p>
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                Tandai Semua Dibaca
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Belum Dibaca
                  </CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{unreadCount}</div>
                  <p className="text-xs text-muted-foreground">
                    notifikasi baru
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Hari Ini
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {notifications.filter(n => n.time.includes('jam')).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    notifikasi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total
                  </CardTitle>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notifications.length}</div>
                  <p className="text-xs text-muted-foreground">
                    semua notifikasi
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications List */}
            <Card>
              <CardHeader>
                <CardTitle>Semua Notifikasi</CardTitle>
                <CardDescription>
                  Daftar lengkap pemberitahuan Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors cursor-pointer ${
                        notification.read 
                          ? 'bg-muted/30 hover:bg-muted/50' 
                          : 'bg-muted/70 hover:bg-muted border-l-4 border-primary'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        <notification.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                          <p className="font-medium text-sm sm:text-base">{notification.title}</p>
                          {!notification.read && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs w-fit">
                              Baru
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">
                          {notification.message}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            {notification.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Notifications;
