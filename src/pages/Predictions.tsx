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
  TrendingUp,
  AlertTriangle,
  Calendar,
  Package
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Predictions = () => {
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

  const predictions = [
    {
      item: "Beras",
      current: 8,
      unit: "kg",
      avgConsumption: 2.5,
      predictedRunOut: "3 hari lagi",
      confidence: "Tinggi",
      daysLeft: 3,
      urgency: "high"
    },
    {
      item: "Minyak Goreng",
      current: 2,
      unit: "botol",
      avgConsumption: 0.5,
      predictedRunOut: "4 hari lagi",
      confidence: "Tinggi",
      daysLeft: 4,
      urgency: "high"
    },
    {
      item: "Sabun Mandi",
      current: 3,
      unit: "pcs",
      avgConsumption: 0.3,
      predictedRunOut: "10 hari lagi",
      confidence: "Sedang",
      daysLeft: 10,
      urgency: "medium"
    },
    {
      item: "Gula Pasir",
      current: 5,
      unit: "kg",
      avgConsumption: 0.4,
      predictedRunOut: "12 hari lagi",
      confidence: "Sedang",
      daysLeft: 12,
      urgency: "medium"
    },
    {
      item: "Kopi",
      current: 200,
      unit: "gram",
      avgConsumption: 15,
      predictedRunOut: "13 hari lagi",
      confidence: "Tinggi",
      daysLeft: 13,
      urgency: "low"
    },
  ];

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Urgent</Badge>;
      case "medium":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Perhatian</Badge>;
      case "low":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Normal</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    return confidence === "Tinggi" ? (
      <Badge variant="outline" className="border-primary/20">
        <TrendingUp className="w-3 h-3 mr-1" />
        {confidence}
      </Badge>
    ) : (
      <Badge variant="outline">
        {confidence}
      </Badge>
    );
  };

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
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold">Prediksi Barang Habis</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Prediksi kapan barang akan habis berdasarkan pola konsumsi
              </p>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Urgent
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {predictions.filter(p => p.urgency === 'high').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Kurang dari 5 hari
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Perhatian
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {predictions.filter(p => p.urgency === 'medium').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    5-14 hari
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Normal
                  </CardTitle>
                  <Package className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {predictions.filter(p => p.urgency === 'low').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lebih dari 14 hari
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Akurasi
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">
                    Prediksi akurat
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Predictions List */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Prediksi</CardTitle>
                <CardDescription>
                  Barang yang diprediksi akan habis dalam waktu dekat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {predictions.map((prediction, index) => (
                    <div 
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          prediction.urgency === 'high' ? 'bg-red-500/10' :
                          prediction.urgency === 'medium' ? 'bg-orange-500/10' :
                          'bg-green-500/10'
                        }`}>
                          <Package className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            prediction.urgency === 'high' ? 'text-red-600' :
                            prediction.urgency === 'medium' ? 'text-orange-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-base sm:text-lg">{prediction.item}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">
                            Stok: {prediction.current} {prediction.unit} • 
                            Rata-rata: {prediction.avgConsumption} {prediction.unit}/hari
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="font-bold text-base sm:text-lg flex items-center gap-2 justify-end">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            {prediction.predictedRunOut}
                          </p>
                          <div className="flex gap-2 mt-1 flex-wrap justify-end">
                            {getUrgencyBadge(prediction.urgency)}
                            {getConfidenceBadge(prediction.confidence)}
                          </div>
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

export default Predictions;
