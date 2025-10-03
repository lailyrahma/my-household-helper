import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddItemDialogProps {
  houseId: string;
  onSuccess?: () => void;
}

export function AddItemDialog({ houseId, onSuccess }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nama_barang: "",
    id_kategori: "",
    satuan: "",
    stok: "",
    ambang_batas: "",
    tanggal_beli: "",
    tanggal_kedaluwarsa: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('kategori_produk')
      .select('*')
      .order('nama_kategori');
    
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_barang.trim() || !formData.id_kategori || !formData.satuan || !formData.stok) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("User tidak ditemukan");

      const { data: userData } = await supabase
        .from('pengguna')
        .select('id_pengguna')
        .eq('email_pengguna', user.email)
        .single();

      if (!userData) throw new Error("Data pengguna tidak ditemukan");

      // First create or get katalog item
      const { data: katalogData, error: katalogError } = await supabase
        .from('katalog_produk')
        .insert({
          nama_produk: formData.nama_barang.trim(),
          id_kategori: parseInt(formData.id_kategori),
          satuan: formData.satuan,
        })
        .select()
        .single();

      if (katalogError && katalogError.code !== '23505') throw katalogError;

      const katalogId = katalogData?.id_katalog;

      const { error } = await supabase
        .from('barang')
        .insert({
          id_rumah: parseInt(houseId),
          id_katalog: katalogId || 1,
          id_pengguna: userData.id_pengguna,
          nama_barang: formData.nama_barang.trim(),
          satuan: formData.satuan,
          stok: parseInt(formData.stok),
          ambang_batas: parseInt(formData.ambang_batas) || 0,
          tanggal_beli: formData.tanggal_beli || null,
          tanggal_kedaluwarsa: formData.tanggal_kedaluwarsa || null,
        });

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Barang berhasil ditambahkan",
      });

      setOpen(false);
      setFormData({
        nama_barang: "",
        id_kategori: "",
        satuan: "",
        stok: "",
        ambang_batas: "",
        tanggal_beli: "",
        tanggal_kedaluwarsa: "",
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan barang",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Barang
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Barang Baru</DialogTitle>
          <DialogDescription>
            Tambahkan barang baru ke inventaris
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama_barang">Nama Barang *</Label>
              <Input
                id="nama_barang"
                value={formData.nama_barang}
                onChange={(e) => setFormData({...formData, nama_barang: e.target.value})}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori *</Label>
              <Select
                value={formData.id_kategori}
                onValueChange={(value) => setFormData({...formData, id_kategori: value})}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id_kategori} value={cat.id_kategori.toString()}>
                      {cat.nama_kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stok">Jumlah Stok *</Label>
              <Input
                id="stok"
                type="number"
                min="0"
                value={formData.stok}
                onChange={(e) => setFormData({...formData, stok: e.target.value})}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="satuan">Satuan *</Label>
              <Input
                id="satuan"
                placeholder="kg, pcs, botol, dll"
                value={formData.satuan}
                onChange={(e) => setFormData({...formData, satuan: e.target.value})}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ambang_batas">Ambang Batas</Label>
              <Input
                id="ambang_batas"
                type="number"
                min="0"
                value={formData.ambang_batas}
                onChange={(e) => setFormData({...formData, ambang_batas: e.target.value})}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_beli">Tanggal Pembelian</Label>
              <Input
                id="tanggal_beli"
                type="date"
                value={formData.tanggal_beli}
                onChange={(e) => setFormData({...formData, tanggal_beli: e.target.value})}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="tanggal_kedaluwarsa">Tanggal Kedaluwarsa</Label>
              <Input
                id="tanggal_kedaluwarsa"
                type="date"
                value={formData.tanggal_kedaluwarsa}
                onChange={(e) => setFormData({...formData, tanggal_kedaluwarsa: e.target.value})}
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
