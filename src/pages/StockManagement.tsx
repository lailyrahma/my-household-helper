import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");

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

  const stockItems = [
    {
      id: 1,
      name: "Beras",
      category: "Makanan",
      stock: 2,
      unit: "kg",
      threshold: 5,
      status: "Hampir Habis",
      expiry: "2024-12-31",
      estimatedEmpty: "2024-01-15"
    },
    {
      id: 2,
      name: "Minyak Goreng",
      category: "Makanan",
      stock: 1,
      unit: "botol",
      threshold: 2,
      status: "Hampir Habis",
      expiry: "2024-06-30",
      estimatedEmpty: "2024-01-20"
    },
    {
      id: 3,
      name: "Sabun Cuci",
      category: "Kebersihan",
      stock: 0,
      unit: "pcs",
      threshold: 1,
      status: "Habis",
      expiry: null,
      estimatedEmpty: "2024-01-10"
    },
    {
      id: 4,
      name: "Pasta Gigi",
      category: "Kebersihan",
      stock: 3,
      unit: "tube",
      threshold: 2,
      status: "Cukup",
      expiry: "2025-03-15",
      estimatedEmpty: "2024-02-28"
    },
    {
      id: 5,
      name: "Gas Elpiji",
      category: "Listrik",
      stock: 1,
      unit: "tabung",
      threshold: 1,
      status: "Cukup",
      expiry: null,
      estimatedEmpty: "2024-02-15"
    }
  ];

  const categories = ["semua", "Makanan", "Kebersihan", "Listrik", "Sembako", "Alat Tulis"];
  const statuses = ["semua", "Cukup", "Hampir Habis", "Habis"];

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

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "semua" || item.category === filterCategory;
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Stok Barang</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Kelola dan pantau inventaris barang di {currentHouse.name}
                </p>
              </div>
              <Button className="gap-2 w-full sm:w-auto">
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

            {/* Stock Table */}
            <Card>
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
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{item.stock}</span> {item.unit}
                          <div className="text-xs text-muted-foreground">
                            Min: {item.threshold} {item.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.expiry ? (
                            <span className="text-sm">
                              {new Date(item.expiry).toLocaleDateString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(item.estimatedEmpty).toLocaleDateString('id-ID')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StockManagement;