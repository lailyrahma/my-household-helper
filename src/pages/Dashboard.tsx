import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoStockHome from "@/assets/logo-gambar.png"

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHouse, setNewHouse] = useState({ nama_rumah: "", deskripsi: "" });

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      fetchHouses();
    }
  }, [user, navigate]);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      // @ts-ignore - Types will regenerate after migration
      const { data: housesData, error } = await supabase
        .from('rumah')
        .select('*')
        .eq('user_id', user?.id)
        .is('tanggal_dihapus', null)
        .order('tanggal_dibuat', { ascending: false });

      if (error) throw error;

      // Fetch counts separately
      const housesWithCounts = await Promise.all(
        (housesData || []).map(async (house) => {
          const { count: membersCount } = await supabase
            .from('anggota_rumah')
            .select('*', { count: 'exact', head: true })
            .eq('id_rumah', house.id_rumah)
            .is('tanggal_dihapus', null);

          const { count: itemsCount } = await supabase
            .from('barang')
            .select('*', { count: 'exact', head: true })
            .eq('id_rumah', house.id_rumah)
            .is('tanggal_dihapus', null);

          return {
            id: house.id_rumah,
            name: house.nama_rumah,
            description: (house as any).deskripsi,
            status: (house as any).status,
            members: membersCount || 0,
            items: itemsCount || 0,
          };
        })
      );

      setHouses(housesWithCounts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHouse = async () => {
    if (!newHouse.nama_rumah.trim()) {
      toast({
        title: "Error",
        description: "Nama rumah/kos harus diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const newHouseData: any = {
        user_id: user?.id,
        nama_rumah: newHouse.nama_rumah,
        deskripsi: newHouse.deskripsi,
        status: 'aktif'
      };
      
      const { error } = await supabase
        .from('rumah')
        .insert(newHouseData);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Rumah/kos baru berhasil ditambahkan"
      });

      setIsDialogOpen(false);
      setNewHouse({ nama_rumah: "", deskripsi: "" });
      fetchHouses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const notifications = [
    { id: 1, house: "Rumah A", message: "Beras tinggal sedikit", type: "warning" },
    { id: 2, house: "Rumah B", message: "Minyak goreng sudah dibeli oleh Rani", type: "success" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
              <img
                src={logoStockHome}
                alt="Logo StockHome"
                className="w-8 h-8 object-contain mr-2"
              />
            <h1 className="text-2xl font-bold">StockHome</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* House Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1 sm:gap-2 text-sm">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Pilih Rumah</span>
                  <ChevronDown className="w-4 h-4 hidden sm:inline" />
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Selamat Datang di StockHome</h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Pilih atau buat rumah/kos untuk mulai mengelola inventaris Anda
            </p>
          </div>

          {/* Houses Grid */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Daftar Rumah/Kos</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    <span>Tambah Rumah/Kos</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Rumah/Kos Baru</DialogTitle>
                    <DialogDescription>
                      Buat rumah atau kos baru untuk mulai mengelola inventaris
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Rumah/Kos *</Label>
                      <Input
                        id="nama"
                        placeholder="Contoh: Rumah Keluarga"
                        value={newHouse.nama_rumah}
                        onChange={(e) => setNewHouse({ ...newHouse, nama_rumah: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                      <Textarea
                        id="deskripsi"
                        placeholder="Tambahkan deskripsi..."
                        value={newHouse.deskripsi}
                        onChange={(e) => setNewHouse({ ...newHouse, deskripsi: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleCreateHouse} className="w-full" variant="hero">
                      Buat Rumah/Kos
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {houses.map((house) => (
                  <Card key={house.id} className="feature-card cursor-pointer hover:shadow-primary transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">{house.name}</CardTitle>
                          <CardDescription>
                            {house.description || "Rumah tangga aktif"}
                          </CardDescription>
                        </div>
                        <Badge className={house.status === 'aktif' ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                          {house.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
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
                  </DialogTrigger>
                </Dialog>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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