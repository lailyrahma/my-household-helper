import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User,
  Mail,
  Lock,
  ArrowLeft,
  Save,
  Smartphone
} from "lucide-react";
import logoStockHome from "@/assets/logo-gambar.png";

const Profile = () => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
                <img
                  src={logoStockHome}
                  alt="Logo StockHome"
                  className="w-8 h-8 object-contain mr-0"
                />
              <h1 className="text-2xl font-bold">StockHome</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Edit Profil</h1>
            <p className="text-muted-foreground">
              Kelola informasi akun dan preferensi Anda
            </p>
          </div>

          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Foto Profil</CardTitle>
              <CardDescription>
                Ubah foto profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <Button variant="outline">Pilih Foto</Button>
                <p className="text-xs text-muted-foreground">
                  Format: JPG, PNG. Maksimal 2MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
              <CardDescription>
                Update informasi pribadi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  placeholder="Masukkan nama lengkap"
                  defaultValue="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input 
                    id="email" 
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Email tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  placeholder="+62 812 3456 7890"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="gap-2 w-full sm:w-auto">
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>
                Perbarui password untuk keamanan akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Password Saat Ini</Label>
                <Input 
                  id="current-password" 
                  type="password"
                  placeholder="Masukkan password saat ini"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  placeholder="Masukkan password baru"
                  minLength={6}
                  maxLength={72}
                />
                <p className="text-xs text-muted-foreground">
                  Kata sandi minimal 6 karakter
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  placeholder="Konfirmasi password baru"
                  minLength={6}
                  maxLength={72}
                />
              </div>

              <Button className="gap-2">
                <Lock className="w-4 h-4" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
              <CardDescription>
                Tindakan permanen yang tidak dapat dibatalkan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Menghapus akun akan menghapus semua data Anda secara permanen.
                </p>
                <Button variant="destructive">
                  Hapus Akun
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
