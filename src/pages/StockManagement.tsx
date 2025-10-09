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
  ShoppingCart,
  Package,
  AlertTriangle,
  CheckCircle,
  Home,
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StockManagement = () => {
  const { id } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    nama_barang: "",
    id_kategori: "",
    stok: 0,
    satuan: "",
    ambang_batas: 0,
    tanggal_kedaluwarsa: "",
    tanggal_beli: ""
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

  // Log activity to aktivitas table
  const logActivity = async (aksi: string, deskripsi: string, id_barang?: number) => {
    try {
      // @ts-ignore - aktivitas table not in types yet
      await supabase.from('aktivitas').insert({
        id_rumah: parseInt(id),
        id_barang,
        user_id: user.id,
        aksi,
        deskripsi
      } as any);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

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

  // Fetch stock items with real-time updates
  useEffect(() => {
    const fetchStockItems = async () => {
      setLoading(true);
      // @ts-ignore
      const { data, error } = await supabase
        .from('kategori_produk')
        .select(`
          *,
          kategori_produk (
            id_kategori,
            nama_kategori
          )
        `)
        .eq('id_rumah', parseInt(id))
        .is('tanggal_dihapus', null)
        .order('tanggal_dibuat', { ascending: false });
      
      if (error) {
        console.error('Error fetching stock items:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data stok barang",
          variant: "destructive"
        });
      } else {
        setStockItems(data || []);
      }
      setLoading(false);
    };

    fetchStockItems();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('stock-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'barang',
        filter: `id_rumah=eq.${id}`
      }, () => {
        fetchStockItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, toast]);

  // Add item handler
  const handleAddItem = async () => {
    if (!formData.nama_barang || !formData.id_kategori || !formData.satuan) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib",
        variant: "destructive"
      });
      return;
    }

    // @ts-ignore - barang table fields
    const { error } = await supabase.from('barang').insert({
      id_rumah: parseInt(id),
      user_id: user.id,
      nama_barang: formData.nama_barang,
      id_kategori: parseInt(formData.id_kategori),
      stok: formData.stok,
      satuan: formData.satuan,
      ambang_batas: formData.ambang_batas,
      tanggal_kedaluwarsa: formData.tanggal_kedaluwarsa || null,
      tanggal_beli: formData.tanggal_beli || null,
      status: formData.stok === 0 ? "Habis" : formData.stok <= formData.ambang_batas ? "Hampir Habis" : "Cukup"
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
        description: "Barang berhasil ditambahkan"
      });
      await logActivity('Tambah', `Menambahkan barang baru: ${formData.nama_barang} (${formData.stok} ${formData.satuan})`);
      setAddDialogOpen(false);
      setFormData({
        nama_barang: "",
        id_kategori: "",
        stok: 0,
        satuan: "",
        ambang_batas: 0,
        tanggal_kedaluwarsa: "",
        tanggal_beli: ""
      });
    }
  };

  // Edit item handler
  const handleEditItem = async () => {
    if (!selectedItem) return;

    const newStatus = formData.stok === 0 ? "Habis" : formData.stok <= formData.ambang_batas ? "Hampir Habis" : "Cukup";

    // @ts-ignore
    const { error } = await supabase.from('barang').update({
      nama_barang: formData.nama_barang,
      id_kategori: parseInt(formData.id_kategori),
      stok: formData.stok,
      satuan: formData.satuan,
      ambang_batas: formData.ambang_batas,
      tanggal_kedaluwarsa: formData.tanggal_kedaluwarsa || null,
      tanggal_beli: formData.tanggal_beli || null,
      status: newStatus,
      tanggal_diupdate: new Date().toISOString()
    } as any).eq('id_barang', selectedItem.id_barang);

    if (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Gagal mengupdate barang",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Barang berhasil diupdate"
      });
      await logActivity('Update', `Memperbarui stok ${formData.nama_barang} menjadi ${formData.stok} ${formData.satuan}`, selectedItem.id_barang);
      setEditDialogOpen(false);
      setSelectedItem(null);
    }
  };

  // Delete item handler
  const handleDeleteItem = async (item: any) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${item.nama_barang}?`)) return;

    // @ts-ignore
    const { error } = await supabase.from('barang').update({
      tanggal_dihapus: new Date().toISOString()
    } as any).eq('id_barang', item.id_barang);

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
      await logActivity('Hapus', `Menghapus barang ${item.nama_barang} dari daftar stok`, item.id_barang);
    }
  };

  // Open edit dialog
  const openEditDialog = (item: any) => {
    setSelectedItem(item);
    setFormData({
      nama_barang: item.nama_barang,
      id_kategori: item.id_kategori?.toString() || "",
      stok: item.stok,
      satuan: item.satuan,
      ambang_batas: item.ambang_batas,
      tanggal_kedaluwarsa: item.tanggal_kedaluwarsa || "",
      tanggal_beli: item.tanggal_beli || ""
    });
    setEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Cukup":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "Hampir Habis":
        return "bg-orange-500/10 text-orange-600 border-orange-200";
      case "Habis":
        return "bg-red-500/10 text-red-600 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Cukup":
        return <CheckCircle className="w-4 h-4" />;
      case "Hampir Habis":
        return <AlertTriangle className="w-4 h-4" />;
      case "Habis":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const categoryNames = ["semua", ...categories.map(c => c.nama_kategori)];
  const statuses = ["semua", "Cukup", "Hampir Habis", "Habis"];

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "semua" || item.kategori_produk?.nama_kategori === filterCategory;
    const matchesStatus = filterStatus === "semua" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Stok Barang</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Kelola dan pantau inventaris barang di {currentHouse.name}
                </p>
              </div>
              <Button className="gap-2 w-full sm:w-auto" onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                <span>Tambah Barang</span>
              </Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari barang..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 whitespace-nowrap text-sm">
                          <Filter className="w-4 h-4" />
                          <span className="hidden sm:inline">Kategori: </span>{filterCategory}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {categoryNames.map((category) => (
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

            {/* Stock Table - Desktop */}
            <Card className="hidden md:block">
              <CardHeader>
                <CardTitle>Daftar Stok Barang</CardTitle>
                <CardDescription>
                  Menampilkan {filteredItems.length} dari {stockItems.length} item
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Nama Barang</TableHead>
                      <TableHead className="min-w-[120px]">Kategori</TableHead>
                      <TableHead className="min-w-[100px]">Jumlah</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Kadaluarsa</TableHead>
                      <TableHead className="min-w-[120px]">Estimasi Habis</TableHead>
                      <TableHead className="min-w-[120px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">Tidak ada data</TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id_barang}>
                          <TableCell className="font-medium">{item.nama_barang}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.kategori_produk?.nama_kategori || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{item.stok}</span> {item.satuan}
                            <div className="text-xs text-muted-foreground">
                              Min: {item.ambang_batas} {item.satuan}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{item.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.tanggal_kedaluwarsa ? (
                              <span className="text-sm">
                                {new Date(item.tanggal_kedaluwarsa).toLocaleDateString('id-ID')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.estimasi_habis ? (
                              <span className="text-sm">
                                {new Date(item.estimasi_habis).toLocaleDateString('id-ID')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openEditDialog(item)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteItem(item)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => navigate(`/house/${id}/shopping-list`)}
                                title="Habis Lebih Cepat"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Stock Cards - Mobile */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {filteredItems.length} dari {stockItems.length} item
                </p>
              </div>
              {loading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : filteredItems.length === 0 ? (
                <p className="text-center text-muted-foreground">Tidak ada data</p>
              ) : (
                filteredItems.map((item) => (
                  <Card key={item.id_barang}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{item.nama_barang}</h3>
                          <Badge variant="outline" className="mt-1">{item.kategori_produk?.nama_kategori || 'N/A'}</Badge>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Jumlah</p>
                          <p className="font-medium">{item.stok} {item.satuan}</p>
                          <p className="text-xs text-muted-foreground">Min: {item.ambang_batas} {item.satuan}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Kadaluarsa</p>
                          <p className="font-medium">
                            {item.tanggal_kedaluwarsa ? new Date(item.tanggal_kedaluwarsa).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground text-xs">Estimasi Habis</p>
                          <p className="font-medium">
                            {item.estimasi_habis ? new Date(item.estimasi_habis).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => openEditDialog(item)}>
                          <Edit className="w-4 h-4" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => handleDeleteItem(item)}>
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs">Hapus</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 gap-2"
                          onClick={() => navigate(`/house/${id}/shopping-list`)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-xs">Belanja</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Add Item Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Barang Baru</DialogTitle>
                  <DialogDescription>
                    Isi form dibawah untuk menambahkan barang baru
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
                    <Select 
                      value={formData.id_kategori} 
                      onValueChange={(value) => setFormData({ ...formData, id_kategori: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id_kategori} value={category.id_kategori.toString()}>
                            {category.nama_kategori}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>

                    <div>
                      <Label htmlFor="stok">Jumlah Stok</Label>
                      <Input
                        id="stok"
                        type="number"
                        value={formData.stok}
                        onChange={(e) => setFormData({ ...formData, stok: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="satuan">Satuan *</Label>
                      <Input
                        id="satuan"
                        value={formData.satuan}
                        onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                        placeholder="Contoh: kg, liter, bungkus"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ambang_batas">Ambang Batas</Label>
                      <Input
                        id="ambang_batas"
                        type="number"
                        value={formData.ambang_batas}
                        onChange={(e) => setFormData({ ...formData, ambang_batas: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tanggal_beli">Tanggal Beli</Label>
                      <Input
                        id="tanggal_beli"
                        type="date"
                        value={formData.tanggal_beli}
                        onChange={(e) => setFormData({ ...formData, tanggal_beli: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tanggal_kedaluwarsa">Tanggal Kedaluwarsa</Label>
                      <Input
                        id="tanggal_kedaluwarsa"
                        type="date"
                        value={formData.tanggal_kedaluwarsa}
                        onChange={(e) => setFormData({ ...formData, tanggal_kedaluwarsa: e.target.value })}
                      />
                    </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleAddItem}>
                        Simpan
                      </Button>
                    </DialogFooter>
                    </DialogContent>
                    </Dialog>


            {/* Edit Item Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Barang</DialogTitle>
                  <DialogDescription>
                    Update informasi barang
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit_nama_barang">Nama Barang *</Label>
                    <Input
                      id="edit_nama_barang"
                      value={formData.nama_barang}
                      onChange={(e) => setFormData({...formData, nama_barang: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_kategori">Kategori *</Label>
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
                      <Label htmlFor="edit_stok">Stok *</Label>
                      <Input
                        id="edit_stok"
                        type="number"
                        value={formData.stok}
                        onChange={(e) => setFormData({...formData, stok: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_satuan">Satuan *</Label>
                      <Input
                        id="edit_satuan"
                        value={formData.satuan}
                        onChange={(e) => setFormData({...formData, satuan: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit_ambang_batas">Ambang Batas</Label>
                    <Input
                      id="edit_ambang_batas"
                      type="number"
                      value={formData.ambang_batas}
                      onChange={(e) => setFormData({...formData, ambang_batas: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_tanggal_beli">Tanggal Beli</Label>
                      <Input
                        id="edit_tanggal_beli"
                        type="date"
                        value={formData.tanggal_beli}
                        onChange={(e) => setFormData({...formData, tanggal_beli: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_tanggal_kedaluwarsa">Tanggal Kedaluwarsa</Label>
                      <Input
                        id="edit_tanggal_kedaluwarsa"
                        type="date"
                        value={formData.tanggal_kedaluwarsa}
                        onChange={(e) => setFormData({...formData, tanggal_kedaluwarsa: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleEditItem}>
                    Simpan Perubahan
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

export default StockManagement;
