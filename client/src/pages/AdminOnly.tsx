import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Settings, Users, Package, BarChart3, LogOut, Plus, Edit, Save, X } from "lucide-react";
import { Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminOnly() {
  const { user, isAuthenticated, isLoading, logoutMutation } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    downloadUrl: "",
    tags: ""
  });
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    isAdmin: false
  });
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Digital Marketplace",
    supportEmail: "support@marketplace.com"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin stats
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    enabled: !!user?.isAdmin,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    enabled: !!user?.isAdmin,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user?.isAdmin,
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const res = await apiRequest("POST", "/api/products", {
        ...productData,
        price: parseFloat(productData.price),
        categoryId: productData.categoryId ? parseInt(productData.categoryId) : null,
        tags: productData.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsAddProductOpen(false);
      setNewProduct({
        title: "",
        description: "",
        price: "",
        categoryId: "",
        imageUrl: "",
        downloadUrl: "",
        tags: ""
      });
      toast({
        title: "Berhasil",
        description: "Produk berhasil ditambahkan!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Gagal menambahkan produk",
        variant: "destructive",
      });
    },
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      const res = await apiRequest("POST", "/api/categories", {
        name: categoryData.name,
        slug: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
        description: categoryData.description
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsAddCategoryOpen(false);
      setNewCategory({ name: "", description: "" });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Gagal menambahkan kategori",
        variant: "destructive",
      });
    },
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest("POST", "/api/register", {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        isAdmin: userData.isAdmin
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsAddUserOpen(false);
      setNewUser({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        isAdmin: false
      });
      toast({
        title: "Berhasil",
        description: "User berhasil ditambahkan!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Gagal menambahkan user",
        variant: "destructive",
      });
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  // Show access denied if not admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Akses Ditolak</CardTitle>
            <p className="text-gray-600">
              Anda tidak memiliki akses admin untuk melihat halaman ini.
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = "/"} 
              className="w-full"
            >
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard content
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Selamat datang, {user.firstName || 'Admin'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button 
                variant="outline" 
                onClick={() => {
                  const userUrl = window.location.origin;
                  window.open(userUrl, "_blank");
                }}
              >
                Lihat Website
              </Button>
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.userCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Produk</p>
                    <p className="text-2xl font-bold text-gray-900">{products?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pesanan</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.orderCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pendapatan</p>
                    <p className="text-2xl font-bold text-gray-900">Rp {(stats?.totalRevenue || 0).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveView("products")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Kelola Produk
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveView("users")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Kelola Pengguna
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveView("reports")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Lihat Laporan
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveView("settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </Button>
              </CardContent>
            </Card>

            {activeView === "dashboard" && (
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Tidak ada aktivitas terbaru untuk ditampilkan.
                  </p>
                </CardContent>
              </Card>
            )}

            {activeView === "products" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Kelola Produk</CardTitle>
                  <Button onClick={() => setActiveView("dashboard")} variant="outline">
                    Kembali ke Dashboard
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Tambah Produk</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Tambah Produk Baru</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Judul</label>
                            <Input
                              value={newProduct.title}
                              onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                              placeholder="Judul produk"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Deskripsi</label>
                            <Textarea
                              value={newProduct.description}
                              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                              placeholder="Deskripsi produk"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Harga (Rp)</label>
                            <Input
                              type="number"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                              placeholder="50000"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Kategori</label>
                            <Select value={newProduct.categoryId} onValueChange={(value) => setNewProduct({...newProduct, categoryId: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat: any) => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Image URL</label>
                            <Input
                              value={newProduct.imageUrl}
                              onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Download URL</label>
                            <Input
                              value={newProduct.downloadUrl}
                              onChange={(e) => setNewProduct({...newProduct, downloadUrl: e.target.value})}
                              placeholder="https://example.com/download.zip"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Tag (pisahkan dengan koma)</label>
                            <Input
                              value={newProduct.tags}
                              onChange={(e) => setNewProduct({...newProduct, tags: e.target.value})}
                              placeholder="template, ui, design"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => addProductMutation.mutate(newProduct)}
                              disabled={addProductMutation.isPending}
                              className="flex-1"
                            >
                              {addProductMutation.isPending ? "Menambahkan..." : "Tambah Produk"}
                            </Button>
                            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                              Batal
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div className="border rounded-lg">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-4">Nama Produk</th>
                            <th className="text-left p-4">Kategori</th>
                            <th className="text-left p-4">Harga</th>
                            <th className="text-left p-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center p-8 text-gray-500">
                                Tidak ada produk. Klik "Tambah Produk" untuk memulai.
                              </td>
                            </tr>
                          ) : (
                            products.map((product: any) => (
                              <tr key={product.id} className="border-b">
                                <td className="p-4">{product.title}</td>
                                <td className="p-4">{product.categoryName || 'Uncategorized'}</td>
                                <td className="p-4">Rp {product.price.toLocaleString('id-ID')}</td>
                                <td className="p-4">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      toast({
                                        title: "Edit Product",
                                        description: `Edit functionality for ${product.title} coming soon!`,
                                      });
                                    }}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === "users" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Kelola Pengguna</CardTitle>
                  <Button onClick={() => setActiveView("dashboard")} variant="outline">
                    Kembali ke Dashboard
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Daftar Pengguna</h3>
                      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                          <Button className="flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>Tambah Pengguna</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Email</label>
                              <Input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                placeholder="user@example.com"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Password</label>
                              <Input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                placeholder="Password"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Nama Depan</label>
                              <Input
                                value={newUser.firstName}
                                onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                                placeholder="Nama depan"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Nama Belakang</label>
                              <Input
                                value={newUser.lastName}
                                onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                                placeholder="Nama belakang"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">No. Telepon</label>
                              <Input
                                value={newUser.phoneNumber}
                                onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                                placeholder="08123456789"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="isAdmin"
                                checked={newUser.isAdmin}
                                onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                                className="w-4 h-4"
                              />
                              <label htmlFor="isAdmin" className="text-sm font-medium">
                                Admin User
                              </label>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => addUserMutation.mutate(newUser)}
                                disabled={addUserMutation.isPending}
                                className="flex-1"
                              >
                                {addUserMutation.isPending ? "Menambahkan..." : "Tambah Pengguna"}
                              </Button>
                              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                                Batal
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="border rounded-lg">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-4">Nama</th>
                            <th className="text-left p-4">Email</th>
                            <th className="text-left p-4">Role</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-4">Demo User</td>
                            <td className="p-4">demo@demo.com</td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm">Pengguna</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>
                            </td>
                            <td className="p-4">
                              <Button variant="outline" size="sm">Edit</Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-4">Admin User</td>
                            <td className="p-4">admin@demo.com</td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Admin</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>
                            </td>
                            <td className="p-4">
                              <Button variant="outline" size="sm">Edit</Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === "reports" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Lihat Laporan</CardTitle>
                  <Button onClick={() => setActiveView("dashboard")} variant="outline">
                    Kembali ke Dashboard
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Laporan Penjualan</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">Rp {(stats?.totalRevenue || 0).toLocaleString('id-ID')}</div>
                          <p className="text-gray-600">Total Pendapatan</p>
                          <Button className="mt-2" variant="outline" size="sm">View Details</Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Pertumbuhan Pengguna</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats?.userCount || 0}</div>
                          <p className="text-gray-600">Total Pengguna</p>
                          <Button className="mt-2" variant="outline" size="sm">View Details</Button>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Opsi Laporan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Export Dimulai",
                              description: "Mengekspor data pengguna...",
                            });
                          }}
                        >
                          Ekspor Pengguna
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Export Dimulai", 
                              description: "Mengekspor data produk...",
                            });
                          }}
                        >
                          Ekspor Produk
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Export Dimulai",
                              description: "Mengekspor data pesanan...",
                            });
                          }}
                        >
                          Ekspor Pesanan
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === "settings" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Pengaturan</CardTitle>
                  <Button onClick={() => setActiveView("dashboard")} variant="outline">
                    Kembali ke Dashboard
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Pengaturan Situs</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Nama Situs</label>
                            <Input
                              value={siteSettings.siteName}
                              onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Email Support</label>
                            <Input
                              type="email"
                              value={siteSettings.supportEmail}
                              onChange={(e) => setSiteSettings({...siteSettings, supportEmail: e.target.value})}
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={() => {
                            toast({
                              title: "Pengaturan Disimpan",
                              description: "Pengaturan situs berhasil diperbarui!",
                            });
                          }}
                          className="flex items-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>Simpan Pengaturan</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Kelola Kategori</h3>
                      <div className="space-y-3">
                        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                          <DialogTrigger asChild>
                            <Button className="flex items-center space-x-2">
                              <Plus className="h-4 w-4" />
                              <span>Tambah Kategori</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Tambah Kategori Baru</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Nama Kategori</label>
                                <Input
                                  value={newCategory.name}
                                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                                  placeholder="Nama kategori"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                                <Textarea
                                  value={newCategory.description}
                                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                                  placeholder="Deskripsi kategori"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => addCategoryMutation.mutate(newCategory)}
                                  disabled={addCategoryMutation.isPending}
                                  className="flex-1"
                                >
                                  {addCategoryMutation.isPending ? "Menambahkan..." : "Tambah Kategori"}
                                </Button>
                                <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                                  Batal
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <div className="space-y-2">
                          {categories.length === 0 ? (
                            <p className="text-gray-500">Belum ada kategori. Tambahkan kategori pertama di atas.</p>
                          ) : (
                            categories.map((category: any) => (
                              <div key={category.id} className="flex justify-between items-center p-3 border rounded">
                                <span>{category.name}</span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Edit Kategori",
                                      description: `Fitur edit untuk ${category.name} segera hadir!`,
                                    });
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Informasi Sistem</h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Total Produk:</strong> {products.length}
                          </div>
                          <div>
                            <strong>Total Pengguna:</strong> {stats?.userCount || 0}
                          </div>
                          <div>
                            <strong>Total Pesanan:</strong> {stats?.orderCount || 0}
                          </div>
                          <div>
                            <strong>Total Pendapatan:</strong> Rp {(stats?.totalRevenue || 0).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}