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
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama_barang: "",
    id_kategori: "",
    quantity: 1,
    unit: "",
    note: ""
  });

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

  // Fetch shopping items (items with status "Habis" or "Hampir Habis")
  useEffect(() => {
    const fetchShoppingItems = async () => {
      setLoading(true);
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
      .channel('shopping-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'barang',
        filter: `id_rumah=eq.${id}`
      }, () => {
        fetchShoppingItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, toast]);

  const categoryNames = ["semua", ...categories.map(c => c.nama_kategori)];
  const statuses = ["semua", "Habis", "Hampir Habis"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Habis":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "Hampir Habis":
        return "bg-orange-500/10 text-orange-600 border-orange-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  // Add item handler
  const handleAddItem = async () => {
    if (!formData.nama_barang || !formData.id_kategori || !formData.unit) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib",
        variant: "destructive"
      });
      return;
    }

    // @ts-ignore
    const { error } = await supabase.from('barang').insert({
      id_rumah: parseInt(id),
      user_id: user.id,
      nama_barang: formData.nama_barang,
      id_kategori: parseInt(formData.id_kategori),
      stok: 0,
      satuan: formData.unit,
      ambang_batas: formData.quantity,
      status: "Habis"
    } as any);

    if (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan barang",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Barang berhasil ditambahkan ke daftar belanja"
      });
      
      // Log activity
      try {
        // @ts-ignore
        await supabase.from('aktivitas').insert({
          id_rumah: parseInt(id),
          user_id: user.id,
          aksi: 'Tambah',
          deskripsi: `Menambahkan ${formData.nama_barang} ke daftar belanja`
        } as any);
      } catch (err) {
        console.error('Error logging activity:', err);
      }

      setAddDialogOpen(false);
      setFormData({
        nama_barang: "",
        id_kategori: "",
        quantity: 1,
        unit: "",
        note: ""
      });
    }
  };

  const filteredItems = shoppingItems.filter(item => {
    const matchesSearch = item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "semua" || item.kategori_produk?.nama_kategori === filterCategory;
    const matchesStatus = filterStatus === "semua" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleItemSelect = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleMarkAsBought = async (itemId: number) => {
    const item = shoppingItems.find(i => i.id_barang === itemId);
    if (!item) return;

    // @ts-ignore
    const { error } = await supabase.from('barang').update({
      status: "Cukup",
      stok: item.ambang_batas + 5, // Set stock above threshold
      tanggal_diupdate: new Date().toISOString()
    } as any).eq('id_barang', itemId);

    if (error) {
      console.error('Error marking as bought:', error);
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
          id_barang: itemId,
          user_id: user.id,
          aksi: 'Update',
          deskripsi: `Menandai ${item.nama_barang} sebagai sudah dibeli`
        } as any);
      } catch (err) {
        console.error('Error logging activity:', err);
      }
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    const item = shoppingItems.find(i => i.id_barang === itemId);
    if (!item) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${item.nama_barang}?`)) return;

    // @ts-ignore
    const { error } = await supabase.from('barang').update({
      tanggal_dihapus: new Date().toISOString()
    } as any).eq('id_barang', itemId);

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
        description: "Barang berhasil dihapus"
      });
      
      // Log activity
      try {
        // @ts-ignore
        await supabase.from('aktivitas').insert({
          id_rumah: parseInt(id),
          id_barang: itemId,
          user_id: user.id,
          aksi: 'Hapus',
          deskripsi: `Menghapus ${item.nama_barang} dari daftar belanja`
        } as any);
      } catch (err) {
        console.error('Error logging activity:', err);
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;

    if (action === 'markBought') {
      for (const itemId of selectedItems) {
        await handleMarkAsBought(itemId);
      }
      setSelectedItems([]);
    } else if (action === 'delete') {
      for (const itemId of selectedItems) {
        await handleDeleteItem(itemId);
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
                <Button className="gap-2 w-full sm:w-auto" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                  <span>Tambah Barang</span>
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
                    <div className="text-center py-8 text-muted-foreground">Tidak ada barang yang perlu dibeli</div>
                  ) : (
                    filteredItems.map((item) => (
                      <div key={item.id_barang} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border rounded-lg">
                        <Checkbox
                          checked={selectedItems.includes(item.id_barang)}
                          onCheckedChange={(checked) => handleItemSelect(item.id_barang, checked as boolean)}
                          className="self-start sm:self-center"
                        />
                        
                        <div className="flex-1 space-y-2 sm:space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="font-medium text-base">{item.nama_barang}</h3>
                            <div className="flex gap-2 flex-wrap">
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
                              <span className="text-muted-foreground text-xs">Ambang Batas:</span>
                              <p className="text-sm">{item.ambang_batas} {item.satuan}</p>
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
                            onClick={() => handleMarkAsBought(item.id_barang)}
                            className="flex-1 sm:flex-none gap-1"
                          >
                            <Check className="w-4 h-4" />
                            <span className="text-xs sm:hidden">Beli</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 sm:flex-none gap-1"
                            onClick={() => handleDeleteItem(item.id_barang)}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs sm:hidden">Hapus</span>
                          </Button>
                        </div>
                      </div>
                    ))
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

            {/* Add Item Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Barang ke Daftar Belanja</DialogTitle>
                  <DialogDescription>
                    Tambahkan barang baru yang perlu dibeli
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nama_barang">Nama Barang *</Label>
                    <Input
                      id="nama_barang"
                      value={formData.nama_barang}
                      onChange={(e) => setFormData({...formData, nama_barang: e.target.value})}
                      placeholder="Contoh: Beras"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kategori">Kategori *</Label>
                    <Select value={formData.id_kategori} onValueChange={(value) => setFormData({...formData, id_kategori: value})}>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Jumlah yang Dibutuhkan *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Satuan *</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        placeholder="kg, pcs, dll"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="note">Catatan (Opsional)</Label>
                    <Input
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({...formData, note: e.target.value})}
                      placeholder="Contoh: Merek Ramos"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleAddItem}>
                    Tambah Barang
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