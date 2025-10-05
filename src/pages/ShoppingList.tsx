import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

const ShoppingList = () => {
  const { id } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterSource, setFilterSource] = useState("semua");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

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

  const shoppingItems = [
    {
      id: 1,
      name: "Beras",
      category: "Makanan",
      quantity: 5,
      unit: "kg",
      source: "Otomatis",
      status: "Belum Dibeli",
      expiry: "2024-12-31",
      estimatedEmpty: "2024-01-15",
      note: "Merek Ramos"
    },
    {
      id: 2,
      name: "Minyak Goreng",
      category: "Makanan",
      quantity: 2,
      unit: "botol",
      source: "Otomatis",
      status: "Sudah Dibeli",
      expiry: "2024-06-30",
      estimatedEmpty: "2024-01-20",
      note: "Merk Tropical"
    },
    {
      id: 3,
      name: "Sabun Cuci",
      category: "Kebersihan",
      quantity: 3,
      unit: "pcs",
      source: "Manual",
      status: "Belum Dibeli",
      expiry: null,
      estimatedEmpty: null,
      note: "Merek Rinso"
    },
    {
      id: 4,
      name: "Telur Ayam",
      category: "Makanan",
      quantity: 30,
      unit: "butir",
      source: "Otomatis",
      status: "Belum Dibeli",
      expiry: "2024-02-10",
      estimatedEmpty: "2024-01-25",
      note: ""
    }
  ];

  const categories = ["semua", "Makanan", "Kebersihan", "Listrik", "Sembako", "Alat Tulis"];
  const statuses = ["semua", "Belum Dibeli", "Sudah Dibeli"];
  const sources = ["semua", "Otomatis", "Manual"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sudah Dibeli":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "Belum Dibeli":
        return "bg-orange-500/10 text-orange-600 border-orange-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "Otomatis":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "Manual":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const filteredItems = shoppingItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "semua" || item.category === filterCategory;
    const matchesStatus = filterStatus === "semua" || item.status === filterStatus;
    const matchesSource = filterSource === "semua" || item.source === filterSource;
    return matchesSearch && matchesCategory && matchesStatus && matchesSource;
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

  const handleMarkAsBought = (itemId: number) => {
    // TODO: Implement mark as bought functionality
    console.log('Mark as bought:', itemId);
  };

  const handleBulkAction = (action: string) => {
    // TODO: Implement bulk actions
    console.log('Bulk action:', action, selectedItems);
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
                <Button className="gap-2 w-full sm:w-auto">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 whitespace-nowrap text-sm">
                          <Filter className="w-4 h-4" />
                          <span className="hidden sm:inline">Sumber: </span>{filterSource}
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {sources.map((source) => (
                        <DropdownMenuItem 
                          key={source} 
                          onClick={() => setFilterSource(source)}
                        >
                          {source === "semua" ? "Semua Sumber" : source}
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
                  {filteredItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border rounded-lg">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean)}
                        className="self-start sm:self-center"
                      />
                      
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="font-medium text-base">{item.name}</h3>
                          <div className="flex gap-2 flex-wrap">
                            <Badge className={`${getSourceColor(item.source)} text-xs`}>
                              {item.source}
                            </Badge>
                            <Badge className={`${getStatusColor(item.status)} text-xs`}>
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs">Kategori:</span>
                            <p className="text-sm">{item.category}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Jumlah:</span>
                            <p className="font-medium text-sm">{item.quantity} {item.unit}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Kadaluarsa:</span>
                            <p className="text-sm">
                              {item.expiry ? (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.expiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                              ) : '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Estimasi Habis:</span>
                            <p className="text-sm">
                              {item.estimatedEmpty ? (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(item.estimatedEmpty).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                              ) : '-'}
                            </p>
                          </div>
                        </div>
                        
                        {item.note && (
                          <div className="pt-1">
                            <span className="text-muted-foreground text-xs">Catatan:</span>
                            <p className="text-sm">{item.note}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex sm:flex-col gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkAsBought(item.id)}
                          disabled={item.status === "Sudah Dibeli"}
                          className="flex-1 sm:flex-none gap-1"
                        >
                          <Check className="w-4 h-4" />
                          <span className="text-xs sm:hidden">Beli</span>
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 sm:flex-none gap-1">
                          <Edit className="w-4 h-4" />
                          <span className="text-xs sm:hidden">Edit</span>
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 sm:flex-none gap-1">
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs sm:hidden">Hapus</span>
                        </Button>
                      </div>
                    </div>
                  ))}
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
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ShoppingList;