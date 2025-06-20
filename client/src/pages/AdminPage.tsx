import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Settings,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, insertCategorySchema, type InsertProduct, type InsertCategory } from "@shared/schema";

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Redirect if not admin
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Akses Ditolak</CardTitle>
            <CardDescription>
              Anda tidak memiliki akses admin untuk melihat halaman ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()} className="w-full">
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch admin data
  const { data: adminData } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    enabled: !!user?.isAdmin,
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user?.isAdmin,
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
  });

  // Product form
  const productForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      categoryId: undefined,
      sellerId: user?.id,
      imageUrl: "",
      downloadUrl: "",
      tags: [],
    },
  });

  // Category form
  const categoryForm = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Produk berhasil ditambahkan" });
      productForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menambah produk", description: error.message, variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Kategori berhasil ditambahkan" });
      categoryForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menambah kategori", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Produk berhasil dihapus" });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menghapus produk", description: error.message, variant: "destructive" });
    },
  });

  const onCreateProduct = (data: InsertProduct) => {
    createProductMutation.mutate({
      ...data,
      sellerId: user?.id,
      tags: data.tags?.filter(tag => tag.trim() !== "") || [],
    });
  };

  const onCreateCategory = (data: InsertCategory) => {
    createCategoryMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Panel Admin</h1>
                <p className="text-sm text-gray-500">Kelola marketplace Anda</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Selamat datang, {user?.firstName}</span>
              <Button onClick={() => window.location.href = "/"} variant="outline" size="sm">
                Ke Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Produk</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adminData?.productCount || products?.length || 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adminData?.userCount || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adminData?.orderCount || orders?.length || 0}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {(adminData?.totalRevenue || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Produk</TabsTrigger>
            <TabsTrigger value="categories">Kategori</TabsTrigger>
            <TabsTrigger value="orders">Pesanan</TabsTrigger>
            <TabsTrigger value="users">Pengguna</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Product Form */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Tambah Produk</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={productForm.handleSubmit(onCreateProduct)} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Judul Produk</Label>
                      <Input {...productForm.register("title")} placeholder="Nama produk" />
                    </div>

                    <div>
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea {...productForm.register("description")} placeholder="Deskripsi produk" />
                    </div>

                    <div>
                      <Label htmlFor="price">Harga</Label>
                      <Input {...productForm.register("price")} placeholder="50000" type="number" />
                    </div>

                    <div>
                      <Label htmlFor="categoryId">Kategori</Label>
                      <Select onValueChange={(value) => productForm.setValue("categoryId", parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">URL Gambar</Label>
                      <Input {...productForm.register("imageUrl")} placeholder="https://..." />
                    </div>

                    <div>
                      <Label htmlFor="downloadUrl">URL Download</Label>
                      <Input {...productForm.register("downloadUrl")} placeholder="https://..." />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createProductMutation.isPending}
                    >
                      {createProductMutation.isPending ? "Menambah..." : "Tambah Produk"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Products List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Daftar Produk</CardTitle>
                  <CardDescription>Kelola semua produk di marketplace</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products?.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.imageUrl || "/placeholder.jpg"}
                            alt={product.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <h4 className="font-medium">{product.title}</h4>
                            <p className="text-sm text-gray-500">Rp {parseInt(product.price).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Tambah Kategori</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={categoryForm.handleSubmit(onCreateCategory)} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nama Kategori</Label>
                      <Input {...categoryForm.register("name")} placeholder="Nama kategori" />
                    </div>

                    <div>
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea {...categoryForm.register("description")} placeholder="Deskripsi kategori" />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createCategoryMutation.isPending}
                    >
                      {createCategoryMutation.isPending ? "Menambah..." : "Tambah Kategori"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Daftar Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories?.map((category: any) => (
                      <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Pesanan Terbaru</CardTitle>
                <CardDescription>Kelola semua pesanan pelanggan</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pesanan</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.userId}</TableCell>
                        <TableCell>Rp {parseInt(order.totalAmount).toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Pengguna</CardTitle>
                <CardDescription>Kelola akun pengguna dan admin</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Fitur manajemen pengguna akan segera tersedia.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}