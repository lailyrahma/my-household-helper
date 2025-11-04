import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Check,
  Download,
  ShoppingCart,
  Home,
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Calendar,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoStockHome from "@/assets/logo-gambar.png";

const ShoppingList = () => {
  const { id } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [shoppingItems, setShoppingItems] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentShoppingList, setCurrentShoppingList] = useState<any>(null);
  const [addFromStockDialogOpen, setAddFromStockDialogOpen] = useState(false);

  if (!user || !id) {
    navigate('/');
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

  const notifications = [
    { id: 1, house: "Rumah A", message: "Beras tinggal sedikit", type: "warning" },
    { id: 2, house: "Rumah B", message: "Minyak goreng sudah dibeli oleh Rani", type: "success" }
  ];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('kategori_produk')
        .select('*')
        .is('tanggal_dihapus', null);
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  // Get or create active shopping list
  useEffect(() => {
    const getOrCreateShoppingList = async () => {
      // @ts-ignore
      const { data: existingList, error: fetchError } = await supabase
        .from('daftar_belanja')
        .select('*')
        .eq('id_rumah', parseInt(id))
        .eq('status', 'proses')
        .is('tanggal_dihapus', null)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching shopping list:', fetchError);
        return;
      }

      if (existingList) {
        setCurrentShoppingList(existingList);
      } else {
        // Create new shopping list
        // @ts-ignore
        const { data: newList, error: createError } = await supabase
          .from('daftar_belanja')
          .insert({
            id_rumah: parseInt(id),
            status: 'proses',
            tanggal_rencana: new Date().toISOString().split('T')[0]
          } as any)
          .select()
          .single();

        if (createError) {
          console.error('Error creating shopping list:', createError);
        } else {
          setCurrentShoppingList(newList);
        }
      }
    };

    getOrCreateShoppingList();
  }, [id]);

  // Fetch shopping items from rekomendasi_belanja
  useEffect(() => {
    if (!currentShoppingList) return;

    const fetchShoppingItems = async () => {
      setLoading(true);
      // @ts-ignore
      const { data, error } = await supabase
        .from('rekomendasi_belanja')
        .select(`
          *,
          barang (
            id_barang,
            nama_barang,
            satuan,
            stok,
            ambang_batas,
            status,
            tanggal_kedaluwarsa,
            kategori_produk (
              id_kategori,
              nama_kategori
            )
          )
        `)
        .eq('id_daftar', currentShoppingList.id_daftar)
        .is('tanggal_dihapus', null)
        .order('tanggal_dibuat', { ascending: false });
      
      if (error) {
        console.error('Error fetching shopping items:', error);
        toast({
          title: "Error",
          description: "Gagal memuat daftar belanja",
          variant: "destructive"
        });
      } else {
        setShoppingItems(data || []);
      }
      setLoading(false);
    };

    fetchShoppingItems();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('shopping-list-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rekomendasi_belanja',
        filter: `id_daftar=eq.${currentShoppingList.id_daftar}`
      }, () => {
        fetchShoppingItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentShoppingList, toast]);

  // Fetch available items from barang (Habis or Hampir Habis)
  useEffect(() => {
    const fetchAvailableItems = async () => {
      // @ts-ignore
      const { data, error } = await supabase
        .from('barang')
        .select(`
          *,
          kategori_produk (
            id_kategori,
            nama_kategori
          )
        `)
        .eq('id_rumah', parseInt(id))
        .in('status', ['Habis', 'Hampir Habis'])
        .is('tanggal_dihapus', null)
        .order('status', { ascending: true }); // Habis first
      
      if (error) {
        console.error('Error fetching available items:', error);
      } else {
        setAvailableItems(data || []);
      }
    };

    fetchAvailableItems();

    // Subscribe to real-time changes on barang
    const channel = supabase
      .channel('barang-status-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'barang',
        filter: `id_rumah=eq.${id}`
      }, () => {
        fetchAvailableItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const categoryNames = ["semua", ...categories.map(c => c.nama_kategori)];
  const statuses = ["semua", "Habis", "Hampir Habis"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Habis":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "Hampir Habis":
        return "bg-orange-500/10 text-orange-600 border-orange-200";
      case "selesai":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "menunggu":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  // Add item from stock to shopping list
  const handleAddToShoppingList = async (item: any) => {
    if (!currentShoppingList) {
      toast({
        title: "Error",
        description: "Daftar belanja tidak ditemukan",
        variant: "destructive"
      });
      return;
    }

    // Check if item already in shopping list
    const existingItem = shoppingItems.find(si => si.id_barang === item.id_barang);
    if (existingItem) {
      toast({
        title: "Info",
        description: "Barang sudah ada di daftar belanja",
        variant: "default"
      });
      return;
    }

    // @ts-ignore
    const { error } = await supabase.from('rekomendasi_belanja').insert({
      id_daftar: currentShoppingList.id_daftar,
      id_barang: item.id_barang,
      jumlah_disarankan: item.ambang_batas - item.stok,
      metode: 'manual',
      status: 'menunggu'
    } as any);

    if (error) {
      console.error('Error adding to shopping list:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan ke daftar belanja",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: `${item.nama_barang} ditambahkan ke daftar belanja`
      });
      
      // Log activity
      try {
        // @ts-ignore
        await supabase.from('aktivitas').insert({
          id_rumah: parseInt(id),
          id_barang: item.id_barang,
          user_id: user.id,
          aksi: 'Tambah',
          deskripsi: `Menambahkan ${item.nama_barang} ke daftar belanja`
        } as any);
      } catch (err) {
        console.error('Error logging activity:', err);
      }
    }
  };

  const filteredItems = shoppingItems.filter(item => {
    const barang = item.barang;
    if (!barang) return false;
    const matchesSearch = barang.nama_barang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "semua" || barang.kategori_produk?.nama_kategori === filterCategory;
    const matchesStatus = filterStatus === "semua" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredAvailableItems = availableItems.filter(item => {
    const matchesSearch = item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "semua" || item.kategori_produk?.nama_kategori === filterCategory;
    // Check if not already in shopping list
    const notInList = !shoppingItems.some(si => si.id_barang === item.id_barang);
    return matchesSearch && matchesCategory && notInList;
  });

  const handleItemSelect = (rekomendasiId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, rekomendasiId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== rekomendasiId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleMarkAsBought = async (rekomendasiId: number, barangId: number) => {
    const rekomendasi = shoppingItems.find(i => i.id_rekomendasi === rekomendasiId);
    if (!rekomendasi) return;

    // Update rekomendasi status to selesai
    // @ts-ignore
    const { error: rekError } = await supabase.from('rekomendasi_belanja').update({
      status: 'selesai',
      tanggal_diupdate: new Date().toISOString()
    } as any).eq('id_rekomendasi', rekomendasiId);

    // Update barang stock
    const newStock = rekomendasi.barang.ambang_batas + rekomendasi.jumlah_disarankan;
    // @ts-ignore
    const { error: barangError } = await supabase.from('barang').update({
      status: "Cukup",
      stok: newStock,
      tanggal_diupdate: new Date().toISOString()
    } as any).eq('id_barang', barangId);

    if (rekError || barangError) {
      console.error('Error marking as bought:', rekError || barangError);
      toast({
        title: "Error",
        description: "Gagal menandai barang sebagai dibeli",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Barang ditandai sebagai sudah dibeli"
      });
      
      // Log activity
      try {
        // @ts-ignore
        await supabase.from('aktivitas').insert({
          id_rumah: parseInt(id),
          id_barang: barangId,
          user_id: user.id,
          aksi: 'Update',
          deskripsi: `Menandai ${rekomendasi.barang.nama_barang} sebagai sudah dibeli`
        } as any);
      } catch (err) {
        console.error('Error logging activity:', err);
      }
    }
  };

  const handleDeleteItem = async (rekomendasiId: number) => {
    const rekomendasi = shoppingItems.find(i => i.id_rekomendasi === rekomendasiId);
    if (!rekomendasi) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${rekomendasi.barang.nama_barang}?`)) return;

    // @ts-ignore
    const { error } = await supabase.from('rekomendasi_belanja').update({
      tanggal_dihapus: new Date().toISOString()
    } as any).eq('id_rekomendasi', rekomendasiId);

    if (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus barang",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Barang berhasil dihapus dari daftar belanja"
      });
      
      // Log activity
      try {
        // @ts-ignore
        await supabase.from('aktivitas').insert({
          id_rumah: parseInt(id),
          id_barang: rekomendasi.id_barang,
          user_id: user.id,
          aksi: 'Hapus',
          deskripsi: `Menghapus ${rekomendasi.barang.nama_barang} dari daftar belanja`
        } as any);
      } catch (err) {
        console.error('Error logging activity:', err);
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;

    if (action === 'markBought') {
      for (const rekId of selectedItems) {
        const rek = shoppingItems.find(i => i.id_rekomendasi === rekId);
        if (rek) {
          await handleMarkAsBought(rekId, rek.id_barang);
        }
      }
      setSelectedItems([]);
    } else if (action === 'delete') {
      for (const rekId of selectedItems) {
        await handleDeleteItem(rekId);
      }
      setSelectedItems([]);
    }
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

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
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
          </header>

          {/* Main Content */}
          <div className="flex-1 space-y-4 p-4 pt-6">
            {/* Page Header */}
            <div className="flex flex-col gap-3">
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Daftar Belanja</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Kelola barang yang perlu dibeli untuk {currentHouse.name}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </Button>
                <Button className="gap-2 w-full sm:w-auto" onClick={() => setAddFromStockDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                  <span>Tambah dari Stok</span>
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari barang..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 whitespace-nowrap text-sm">
                          <Filter className="w-4 h-4" />
                          <span className="hidden sm:inline">Kategori: </span>{filterCategory}
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {categories.map((category) => (
                        <DropdownMenuItem 
                          key={category} 
                          onClick={() => setFilterCategory(category)}
                        >
                          {category === "semua" ? "Semua Kategori" : category}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 whitespace-nowrap text-sm">
                          <Filter className="w-4 h-4" />
                          <span className="hidden sm:inline">Status: </span>{filterStatus}
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {statuses.map((status) => (
                        <DropdownMenuItem 
                          key={status} 
                          onClick={() => setFilterStatus(status)}
                        >
                          {status === "semua" ? "Semua Status" : status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      {selectedItems.length} item dipilih
                    </span>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBulkAction('markBought')}
                        className="flex-1 sm:flex-none gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">Tandai Dibeli</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBulkAction('delete')}
                        className="flex-1 sm:flex-none gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">Hapus</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shopping List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Daftar Belanja</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Menampilkan {filteredItems.length} dari {shoppingItems.length} item
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-xs sm:text-sm cursor-pointer">
                      Pilih Semua
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Tidak ada barang di daftar belanja. Klik "Tambah dari Stok" untuk menambahkan.
                    </div>
                  ) : (
                    filteredItems.map((rekomendasi) => {
                      const item = rekomendasi.barang;
                      if (!item) return null;
                      return (
                        <div key={rekomendasi.id_rekomendasi} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border rounded-lg">
                          <Checkbox
                            checked={selectedItems.includes(rekomendasi.id_rekomendasi)}
                            onCheckedChange={(checked) => handleItemSelect(rekomendasi.id_rekomendasi, checked as boolean)}
                            className="self-start sm:self-center"
                          />
                          
                          <div className="flex-1 space-y-2 sm:space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <h3 className="font-medium text-base">{item.nama_barang}</h3>
                              <div className="flex gap-2 flex-wrap">
                                <Badge className={`${getStatusColor(rekomendasi.status)} text-xs`}>
                                  {rekomendasi.status}
                                </Badge>
                                <Badge className={`${getStatusColor(item.status)} text-xs`}>
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground text-xs">Kategori:</span>
                                <p className="text-sm">{item.kategori_produk?.nama_kategori || '-'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs">Stok Saat Ini:</span>
                                <p className="font-medium text-sm">{item.stok} {item.satuan}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs">Perlu Dibeli:</span>
                                <p className="font-medium text-sm text-primary">{rekomendasi.jumlah_disarankan} {item.satuan}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs">Kadaluarsa:</span>
                                <p className="text-sm">
                                  {item.tanggal_kedaluwarsa ? (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(item.tanggal_kedaluwarsa).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  ) : '-'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex sm:flex-col gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMarkAsBought(rekomendasi.id_rekomendasi, rekomendasi.id_barang)}
                              disabled={rekomendasi.status === 'selesai'}
                              className="flex-1 sm:flex-none gap-1"
                            >
                              <Check className="w-4 h-4" />
                              <span className="text-xs sm:hidden">Beli</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 sm:flex-none gap-1"
                              onClick={() => handleDeleteItem(rekomendasi.id_rekomendasi)}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-xs sm:hidden">Hapus</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Integration Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Integrasi Belanja</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Belanja barang yang dipilih melalui platform marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Button variant="outline" className="h-16 sm:h-20 flex-col gap-2">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-base">Shopee</span>
                  </Button>
                  <Button variant="outline" className="h-16 sm:h-20 flex-col gap-2">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-base">Tokopedia</span>
                  </Button>
                  <Button variant="outline" className="h-16 sm:h-20 flex-col gap-2">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-base">Toko Terdekat</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add from Stock Dialog */}
            <Dialog open={addFromStockDialogOpen} onOpenChange={setAddFromStockDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Barang dari Stok</DialogTitle>
                  <DialogDescription>
                    Pilih barang yang perlu dibeli dari daftar stok
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {filteredAvailableItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Tidak ada barang dengan status "Habis" atau "Hampir Habis"
                    </div>
                  ) : (
                    filteredAvailableItems.map((item) => (
                      <div key={item.id_barang} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{item.nama_barang}</h3>
                            <Badge className={`${getStatusColor(item.status)} text-xs`}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
                            <div>
                              <span className="text-xs">Kategori:</span>
                              <p className="font-medium text-foreground">{item.kategori_produk?.nama_kategori || '-'}</p>
                            </div>
                            <div>
                              <span className="text-xs">Stok:</span>
                              <p className="font-medium text-foreground">{item.stok} {item.satuan}</p>
                            </div>
                            <div>
                              <span className="text-xs">Perlu:</span>
                              <p className="font-medium text-primary">{item.ambang_batas - item.stok} {item.satuan}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddToShoppingList(item)}
                          className="gap-2 ml-4"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Tambah
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddFromStockDialogOpen(false)}>
                    Tutup
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ShoppingList;