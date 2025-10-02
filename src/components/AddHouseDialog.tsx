import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AddHouseDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddHouseDialog({ trigger, onSuccess }: AddHouseDialogProps) {
  const [open, setOpen] = useState(false);
  const [namaRumah, setNamaRumah] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!namaRumah.trim()) {
      toast({
        title: "Error",
        description: "Nama rumah/kos harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: "Error",
        description: "Anda harus login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get user's id_pengguna from pengguna table
      const { data: userData, error: userError } = await supabase
        .from('pengguna')
        .select('id_pengguna')
        .eq('email_pengguna', user.email)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error("User not found");

      // Insert new house
      const { data: newHouse, error: insertError } = await supabase
        .from('rumah')
        .insert({
          nama_rumah: namaRumah.trim(),
          id_pengguna: userData.id_pengguna,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('anggota_rumah')
        .insert({
          id_rumah: newHouse.id_rumah,
          id_pengguna: userData.id_pengguna,
          peran: 'admin',
          status: 'aktif',
        });

      if (memberError) throw memberError;

      toast({
        title: "Berhasil",
        description: "Rumah/kos berhasil ditambahkan",
      });

      setNamaRumah("");
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to the new house
        navigate(`/house/${newHouse.id_rumah}`);
      }
    } catch (error: any) {
      console.error('Error adding house:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan rumah/kos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="hero" className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Rumah/Kos Baru
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Rumah/Kos Baru</DialogTitle>
            <DialogDescription>
              Buat rumah atau kos baru untuk mulai mengelola inventaris
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama_rumah">Nama Rumah/Kos</Label>
              <Input
                id="nama_rumah"
                placeholder="Contoh: Rumah Keluarga, Kos Melati"
                value={namaRumah}
                onChange={(e) => setNamaRumah(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
