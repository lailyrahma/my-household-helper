import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  User,
  LogOut,
  ChevronDown,
  Settings,
  Home,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Reports = () => {
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

  const monthlyStats = [
    { month: "Jan", purchases: 15, consumption: 42, cost: 1250000 },
    { month: "Feb", purchases: 18, consumption: 38, cost: 1450000 },
    { month: "Mar", purchases: 12, consumption: 45, cost: 1180000 },
  ];

  const topConsumption = [
    { item: "Beras", amount: "15 kg", trend: "up", percentage: 12 },
    { item: "Minyak Goreng", amount: "8 botol", trend: "down", percentage: 5 },
    { item: "Sabun Mandi", amount: "12 pcs", trend: "up", percentage: 8 },
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

              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
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
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Laporan & Insight</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Analisis penggunaan dan pengeluaran {currentHouse.name}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Calendar className="w-4 h-4" />
                  <span>Pilih Periode</span>
                </Button>
                <Button className="gap-2 w-full sm:w-auto">
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </Button>
              </div>
            </div>

            {/* Monthly Overview */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Pembelian
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45 item</div>
                  <p className="text-xs text-muted-foreground">
                    +20% dari bulan lalu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Konsumsi Bulanan
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">125 item</div>
                  <p className="text-xs text-muted-foreground">
                    -8% dari bulan lalu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Pengeluaran
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp 3.8jt</div>
                  <p className="text-xs text-muted-foreground">
                    3 bulan terakhir
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Monthly Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Rincian Bulanan</CardTitle>
                  <CardDescription>
                    Pembelian dan konsumsi per bulan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-lg">{stat.month} 2025</p>
                          <p className="text-sm text-muted-foreground">
                            {stat.purchases} pembelian • {stat.consumption} konsumsi
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            Rp {(stat.cost / 1000).toFixed(1)}k
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Consumption */}
              <Card>
                <CardHeader>
                  <CardTitle>Item Paling Banyak Dikonsumsi</CardTitle>
                  <CardDescription>
                    Barang dengan konsumsi tertinggi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topConsumption.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{item.item}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.amount}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.trend === "up" ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={item.trend === "up" ? "text-green-600" : "text-red-600"}>
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
