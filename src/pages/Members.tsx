import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
  UserPlus,
  Mail,
  Shield,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoStockHome from "@/assets/logo-gambar.png";

interface Member {
  id_anggota: number;
  id_pengguna: number;
  id_rumah: number;
  peran: string;
  status: string;
  tanggal_dibuat: string;
  tanggal_dihapus: string | null;
  tanggal_diupdate: string;
  user_id?: string;
}

interface House {
  id_rumah: number;
  nama_rumah: string;
}

const Members = () => {
  const { id } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch houses
  useEffect(() => {
    const fetchHouses = async () => {
      if (!user) return;

      // @ts-ignore - Supabase types may not be up to date
      const { data, error } = await supabase
        .from('rumah')
        .select('*')
        .eq('user_id', user.id)
        .is('tanggal_dihapus', null);

      if (error) {
        console.error('Error fetching houses:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data rumah",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setHouses(data);
        const house = data.find(h => h.id_rumah.toString() === id);
        setCurrentHouse(house || null);
      }
    };

    fetchHouses();
  }, [user, id, toast]);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!user || !id) return;

      setLoading(true);
      
      // @ts-ignore - Supabase types may not be up to date
      const { data, error } = await supabase
        .from('anggota_rumah')
        .select('*')
        .eq('id_rumah', parseInt(id))
        .is('tanggal_dihapus', null)
        .order('tanggal_bergabung', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data anggota",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data) {
        setMembers(data);
      }
      
      setLoading(false);
    };

    fetchMembers();

    // Real-time subscription
    const channel = supabase
      .channel('members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'anggota_rumah',
          filter: `id_rumah=eq.${id}`
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, id, toast]);

  if (!user || !id) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline">Anggota</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "aktif" ? (
      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
        Aktif
      </Badge>
    ) : (
      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
        Menunggu
      </Badge>
    );
  };

  const activeMembers = members.filter(m => m.status === 'aktif');
  const adminMembers = members.filter(m => m.peran === 'admin');
  const pendingMembers = members.filter(m => m.status === 'menunggu');

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
              {/* House Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1 sm:gap-2 text-sm">
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">{currentHouse?.nama_rumah || 'Rumah'}</span>
                    <ChevronDown className="w-4 h-4 hidden sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {houses.map((house) => (
                    <DropdownMenuItem key={house.id_rumah} onClick={() => navigate(`/house/${house.id_rumah}`)}>
                      <Home className="w-4 h-4 mr-2" />
                      {house.nama_rumah}
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
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Kelola Anggota</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Atur anggota dan izin akses untuk {currentHouse?.nama_rumah || 'Rumah'}
                </p>
              </div>
              <Button className="gap-2 w-full sm:w-auto">
                <UserPlus className="w-4 h-4" />
                <span>Undang Anggota</span>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Anggota
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeMembers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {members.length} total termasuk pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Admin
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminMembers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Dengan akses penuh
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Menunggu
                  </CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingMembers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Undangan pending
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Anggota</CardTitle>
                <CardDescription>
                  Anggota yang terdaftar di {currentHouse?.nama_rumah || 'Rumah'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Memuat data anggota...
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Belum ada anggota. Undang anggota pertama Anda!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div 
                        key={member.id_anggota} 
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors gap-3 sm:gap-4"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Anggota #{member.id_pengguna}</p>
                            <p className="text-sm text-muted-foreground">ID Anggota: {member.id_anggota}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Bergabung: {format(new Date(member.tanggal_dibuat), 'dd MMM yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-between sm:justify-end">
                          {getRoleBadge(member.peran)}
                          {getStatusBadge(member.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Role</DropdownMenuItem>
                              <DropdownMenuItem>Kirim Ulang Undangan</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Hapus Anggota
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Members;
