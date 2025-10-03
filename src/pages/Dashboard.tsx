import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Home, 
  Users, 
  Package, 
  Plus, 
  Bell, 
  User,
  LogOut,
  ChevronDown,
  Settings,
  Smartphone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const houses = [
    {
      id: 1,
      name: "Rumah A",
      members: 4,
      items: 23,
      status: "active"
    },
    {
      id: 2, 
      name: "Kos B",
      members: 2,
      items: 15,
      status: "active"
    }
  ];

  const notifications = [
    { id: 1, house: "Rumah A", message: "Beras tinggal sedikit", type: "warning" },
    { id: 2, house: "Rumah B", message: "Minyak goreng sudah dibeli oleh Rani", type: "success" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">StockHome</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* House Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Home className="w-4 h-4" />
                  Pilih Rumah
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {houses.map((house) => (
                  <DropdownMenuItem key={house.id}>
                    <Link to={`/house/${house.id}`} className="flex items-center gap-2 w-full">
                      <Home className="w-4 h-4" />
                      {house.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Rumah
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-danger text-danger-foreground">
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
                        <Badge 
                          className={`text-xs ${
                            notif.type === "warning" ? "bg-warning text-warning-foreground" : 
                            "bg-success text-success-foreground"
                          }`}
                        >
                          {notif.type === "warning" ? "Peringatan" : "Info"}
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
                  <Button variant="ghost" className="gap-2">
                    <User className="w-4 h-4" />
                    {user.email}
                    <ChevronDown className="w-4 h-4" />
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Selamat Datang di StockHome</h1>
            <p className="text-muted-foreground text-lg">
              Pilih atau buat rumah/kos untuk mulai mengelola inventaris Anda
            </p>
          </div>

          {/* Houses Grid */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Daftar Rumah/Kos</h2>
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Rumah/Kos Baru
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {houses.map((house) => (
                <Card key={house.id} className="feature-card cursor-pointer hover:shadow-primary transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{house.name}</CardTitle>
                        <CardDescription>
                          Rumah tangga aktif
                        </CardDescription>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20">
                        Aktif
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{house.members} Anggota</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>{house.items} Item</span>
                      </div>
                    </div>
                    <Link to={`/house/${house.id}`}>
                      <Button variant="hero" className="w-full">
                        Masuk
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              {/* Add New House Card */}
              <Card className="feature-card cursor-pointer border-dashed border-2 border-muted-foreground/30 hover:border-primary transition-all duration-300">
                <CardContent className="flex flex-col items-center justify-center p-8 min-h-[200px]">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Tambah Rumah/Kos</h3>
                  <p className="text-muted-foreground text-center text-sm">
                    Buat rumah atau kos baru untuk mulai mengelola inventaris
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{houses.length}</p>
                    <p className="text-sm text-muted-foreground">Total Rumah</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {houses.reduce((total, house) => total + house.members, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Anggota</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {houses.reduce((total, house) => total + house.items, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Item</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{notifications.length}</p>
                    <p className="text-sm text-muted-foreground">Notifikasi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;