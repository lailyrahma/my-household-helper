import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";

interface AddHouseDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddHouseDialog({ trigger, onSuccess }: AddHouseDialogProps) {
  const [open, setOpen] = useState(false);
  const [namaRumah, setNamaRumah] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!namaRumah.trim()) {
      toast({
        title: "Error",
        description: "Nama rumah tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current user's email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error("User tidak ditemukan");
      }

      // Get user data from pengguna table
      const { data: userData, error: userError } = await supabase
        .from('pengguna')
        .select('id_pengguna')
        .eq('email_pengguna', user.email)
        .maybeSingle();

      if (userError) throw userError;
      if (!userData) throw new Error("Data pengguna tidak ditemukan");

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

      // Add user as admin member
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
        title: "Berhasil!",
        description: "Rumah baru berhasil ditambahkan",
      });

      setOpen(false);
      setNamaRumah("");
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/house/${newHouse.id_rumah}`);
      }
    } catch (error: any) {
      console.error('Error adding house:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan rumah",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Rumah/Kos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Rumah/Kos Baru</DialogTitle>
          <DialogDescription>
            Buat rumah atau kos baru untuk mengelola stok barang
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Rumah/Kos</Label>
              <Input
                id="nama"
                placeholder="Contoh: Rumah Keluarga, Kos Melati"
                value={namaRumah}
                onChange={(e) => setNamaRumah(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tambah
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
