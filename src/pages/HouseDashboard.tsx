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
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HouseDashboard = () => {
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
    { id: 1, house: "Rumah A", message: "Beras tinggal sedikit", type: "warning" },
    { id: 2, house: "Rumah B", message: "Minyak goreng sudah dibeli oleh Rani", type: "success" }
  ];

  const dashboardStats = [
    {
      title: "Total Stok",
      value: "45",
      description: "item tersedia",
      icon: Package,
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      title: "Hampir Habis",
      value: "8",
      description: "item menipis",
      icon: AlertTriangle,
      color: "bg-orange-500/10 text-orange-600"
    },
    {
      title: "Daftar Belanja",
      value: "12",
      description: "item menunggu",
      icon: ShoppingCart,
      color: "bg-green-500/10 text-green-600"
    },
    {
      title: "Anggota Aktif",
      value: "4",
      description: "pengguna",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600"
    }
  ];

  const recentActivities = [
    { user: "Rani", action: "menandai minyak goreng sudah dibeli", time: "2 jam lalu" },
    { user: "Andi", action: "menambahkan sabun mandi ke stok", time: "4 jam lalu" },
    { user: "Sari", action: "membuat daftar belanja baru", time: "1 hari lalu" }
  ];

  const lowStockItems = [
    { name: "Beras", current: 2, unit: "kg", threshold: 5 },
    { name: "Minyak Goreng", current: 1, unit: "botol", threshold: 2 },
    { name: "Sabun Cuci", current: 0, unit: "pcs", threshold: 1 }
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar houseId={id} />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 flex-1">
              <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold gradient-text">StockHome</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* House Selector */}
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

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                      {notifications.length}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Notifikasi</h3>
                  </div>
                  {notifications.map((notif) => (
                    <DropdownMenuItem key={notif.id} className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {notif.house}
                          </Badge>
                        </div>
                        <p className="text-sm">{notif.message}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Menu */}
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
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard {currentHouse.name}</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Kelola inventaris dan pantau aktivitas rumah tangga Anda
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              {dashboardStats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
              {/* Low Stock Items */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Stok Menipis</CardTitle>
                  <CardDescription>
                    Item yang perlu segera diisi ulang
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lowStockItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Minimum: {item.threshold} {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">
                            {item.current} {item.unit}
                          </p>
                          <Badge variant={item.current === 0 ? "destructive" : "secondary"}>
                            {item.current === 0 ? "Habis" : "Menipis"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Aktivitas Terbaru</CardTitle>
                  <CardDescription>
                    Timeline aktivitas anggota rumah
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span>{" "}
                            {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>
                  Akses fitur utama dengan cepat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                  <Button 
                    className="h-20 flex-col gap-2" 
                    variant="outline"
                    onClick={() => navigate(`/house/${id}/stock`)}
                  >
                    <Package className="w-6 h-6" />
                    Kelola Stok
                  </Button>
                  <Button 
                    className="h-20 flex-col gap-2" 
                    variant="outline"
                    onClick={() => navigate(`/house/${id}/shopping`)}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Daftar Belanja
                  </Button>
                  <Button 
                    className="h-20 flex-col gap-2" 
                    variant="outline"
                    onClick={() => navigate(`/house/${id}/members`)}
                  >
                    <Users className="w-6 h-6" />
                    Kelola Anggota
                  </Button>
                  <Button 
                    className="h-20 flex-col gap-2" 
                    variant="outline"
                    onClick={() => navigate(`/house/${id}/reports`)}
                  >
                    <TrendingUp className="w-6 h-6" />
                    Lihat Laporan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default HouseDashboard;