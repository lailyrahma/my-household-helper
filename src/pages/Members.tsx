import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Member {
  id_anggota: number;
  user_id: string;
  nama: string;
  email: string;
  peran: 'admin' | 'anggota';
  status: 'aktif' | 'menunggu';
  tanggal_dibuat: string;
}

const Members = () => {
  const { id } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'anggota'>('anggota');
  const [currentHouse, setCurrentHouse] = useState<any>(null);
  const [houses, setHouses] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'anggota' | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchHouses();
      fetchHouseDetails();
      fetchMembers();
      checkUserRole();
    }
  }, [user, id]);

  const fetchHouses = async () => {
    try {
      // @ts-ignore - Types will regenerate after migration
      const { data, error } = await supabase
        .from('rumah')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setHouses(data || []);
    } catch (error: any) {
      console.error('Error fetching houses:', error);
    }
  };

  const fetchHouseDetails = async () => {
    try {
      // @ts-ignore - Types will regenerate after migration
      const { data, error } = await supabase
        .from('rumah')
        .select('*')
        .eq('id_rumah', parseInt(id!))
        .single();

      if (error) throw error;
      setCurrentHouse(data);
    } catch (error: any) {
      console.error('Error fetching house:', error);
    }
  };

  const checkUserRole = async () => {
    try {
      // @ts-ignore - Types will regenerate after migration
      const { data, error } = await supabase
        .from('anggota_rumah')
        .select('peran')
        .eq('id_rumah', parseInt(id!))
        .eq('user_id', user?.id)
        .eq('status', 'aktif')
        .is('tanggal_dihapus', null)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCurrentUserRole((data as any).peran as 'admin' | 'anggota');
      }
    } catch (error: any) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // @ts-ignore - Types will regenerate after migration
      const { data: membersData, error } = await supabase
        .from('anggota_rumah')
        .select(`
          id_anggota,
          user_id,
          peran,
          status,
          tanggal_dibuat
        `)
        .eq('id_rumah', parseInt(id!))
        .is('tanggal_dihapus', null)
        .order('tanggal_dibuat', { ascending: false });

      if (error) throw error;

      // Fetch user data from pengguna table for each member
      const membersWithDetails = await Promise.all(
        ((membersData as any) || []).map(async (member: any) => {
          // Get auth user to find email
          const { data: authData } = await supabase.auth.admin.getUserById(member.user_id);
          const userEmail = authData?.user?.email || 'Unknown';
          
          // Try to get nama from pengguna table
          const { data: penggunaData } = await supabase
            .from('pengguna')
            .select('nama_pengguna')
            .eq('email_pengguna', userEmail)
            .maybeSingle();

          const userName = penggunaData?.nama_pengguna || userEmail.split('@')[0];

          return {
            id_anggota: member.id_anggota,
            user_id: member.user_id,
            nama: userName,
            email: userEmail,
            peran: member.peran,
            status: member.status,
            tanggal_dibuat: member.tanggal_dibuat,
          };
        })
      );

      setMembers(membersWithDetails);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data anggota",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Email tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user exists in auth.users by email
      const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();
      
      if (searchError) throw searchError;

      const invitedUser = users?.find((u: any) => u.email === inviteEmail);
      
      if (!invitedUser) {
        toast({
          title: "Error",
          description: "Pengguna dengan email tersebut tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      // Check if already a member
      // @ts-ignore - Types will regenerate after migration
      const { data: existingMember } = await supabase
        .from('anggota_rumah')
        .select('id_anggota')
        .eq('id_rumah', parseInt(id!))
        .eq('user_id', invitedUser.id)
        .is('tanggal_dihapus', null)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "Error",
          description: "Pengguna sudah menjadi anggota rumah ini",
          variant: "destructive",
        });
        return;
      }

      // Insert new member with status 'menunggu'
      const newMemberData: any = {
        id_rumah: parseInt(id!),
        user_id: invitedUser.id,
        peran: inviteRole,
        status: 'menunggu',
      };

      // @ts-ignore - Types will regenerate after migration
      const { error: insertError } = await supabase
        .from('anggota_rumah')
        .insert(newMemberData);

      if (insertError) throw insertError;

      toast({
        title: "Berhasil",
        description: "Undangan berhasil dikirim",
      });

      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole('anggota');
      fetchMembers();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengirim undangan",
        variant: "destructive",
      });
    }
  };

  const handleAcceptInvitation = async (memberId: number) => {
    try {
      const { error } = await supabase
        .from('anggota_rumah')
        .update({ status: 'aktif' })
        .eq('id_anggota', memberId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Undangan diterima",
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Gagal menerima undangan",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      const { error } = await supabase
        .from('anggota_rumah')
        .update({ tanggal_dihapus: new Date().toISOString() })
        .eq('id_anggota', memberId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Anggota berhasil dihapus",
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus anggota",
        variant: "destructive",
      });
    }
  };

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
                    <span className="hidden sm:inline">
                      {currentHouse?.nama_rumah || "Rumah Tidak Ditemukan"}
                    </span>
                    <ChevronDown className="w-4 h-4 hidden sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {houses.map((house) => (
                    <DropdownMenuItem 
                      key={house.id_rumah} 
                      onClick={() => navigate(`/house/${house.id_rumah}`)}
                    >
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
                  Atur anggota dan izin akses untuk {currentHouse?.nama_rumah || 'rumah ini'}
                </p>
              </div>
              <Button 
                className="gap-2 w-full sm:w-auto"
                onClick={() => setInviteDialogOpen(true)}
                disabled={currentUserRole !== 'admin'}
              >
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
                  Anggota yang terdaftar di {currentHouse?.nama_rumah || 'rumah ini'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Memuat data anggota...
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Belum ada anggota
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
                            <p className="font-medium">{member.nama}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Bergabung: {new Date(member.tanggal_dibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-between sm:justify-end">
                          {getRoleBadge(member.peran)}
                          {getStatusBadge(member.status)}
                          {member.status === 'menunggu' && member.user_id === user?.id && (
                            <Button 
                              size="sm" 
                              onClick={() => handleAcceptInvitation(member.id_anggota)}
                            >
                              Terima
                            </Button>
                          )}
                          {currentUserRole === 'admin' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                {member.status === 'menunggu' && (
                                  <DropdownMenuItem>Kirim Ulang Undangan</DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDeleteMember(member.id_anggota)}
                                >
                                  Hapus Anggota
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undang Anggota Baru</DialogTitle>
            <DialogDescription>
              Masukkan email pengguna yang ingin Anda undang ke {currentHouse?.nama_rumah || 'rumah ini'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Peran</Label>
              <select
                id="role"
                className="w-full px-3 py-2 border rounded-md"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'anggota')}
              >
                <option value="anggota">Anggota</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleInviteMember}>
              Kirim Undangan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Members;
