import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  BarChart3, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Users, 
  Plus,
  Settings,
  ClipboardList,
  UserCog
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Category, type Order } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

interface AdminDashboardData {
  userCount: number;
  productCount: number;
  orderCount: number;
  totalRevenue: number;
}

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Harga wajib diisi"),
});

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      categoryId: undefined,
      imageUrl: "",
      downloadUrl: "",
      tags: [""],
    },
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Access denied. Admin privileges required.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<AdminDashboardData>({
    queryKey: ["/api/admin/dashboard"],
    retry: false,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    retry: false,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const addProductMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productFormSchema>) => {
      const payload = {
        ...data,
        price: parseFloat(data.price).toString(),
        tags: data.tags.filter(tag => tag.trim() !== ""),
      };
      await apiRequest("POST", "/api/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({
        title: "Berhasil",
        description: "Produk berhasil ditambahkan",
      });
      setIsAddProductOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambahkan produk",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      await apiRequest("PUT", `/api/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Berhasil",
        description: "Status pesanan berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui status pesanan",
        variant: "destructive",
      });
    },
  });

  if (isLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          <div className="w-64 bg-slate-900 h-screen animate-pulse"></div>
          <div className="flex-1 p-6">
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                  <div className="h-16 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Diproses</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const onSubmit = (data: z.infer<typeof productFormSchema>) => {
    addProductMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Admin Sidebar */}
      <div className="w-64 bg-slate-900 text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-slate-400 text-sm">DigitalMarket</p>
        </div>
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            <Button
              variant={activeSection === "dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start text-white hover:bg-slate-800"
              onClick={() => setActiveSection("dashboard")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeSection === "products" ? "secondary" : "ghost"}
              className="w-full justify-start text-white hover:bg-slate-800"
              onClick={() => setActiveSection("products")}
            >
              <Package className="mr-2 h-4 w-4" />
              Produk
            </Button>
            <Button
              variant={activeSection === "orders" ? "secondary" : "ghost"}
              className="w-full justify-start text-white hover:bg-slate-800"
              onClick={() => setActiveSection("orders")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Pesanan
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-800"
            >
              <Users className="mr-2 h-4 w-4" />
              Pengguna
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-800"
            >
              <Settings className="mr-2 h-4 w-4" />
              Pengaturan
            </Button>
          </div>
        </nav>
      </div>

      {/* Admin Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">
              {activeSection === "dashboard" && "Dashboard Admin"}
              {activeSection === "products" && "Kelola Produk"}
              {activeSection === "orders" && "Kelola Pesanan"}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"}
                  alt="Admin Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-slate-700">
                  {user?.firstName || "Admin"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Dashboard Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeSection === "dashboard" && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-slate-600">Total Pesanan</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {dashboardData?.orderCount?.toLocaleString() || "0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-slate-600">Pendapatan</p>
                        <p className="text-2xl font-bold text-slate-900">
                          Rp {dashboardData?.totalRevenue?.toLocaleString() || "0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <Package className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-slate-600">Total Produk</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {dashboardData?.productCount?.toLocaleString() || "0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-slate-600">Pengguna Aktif</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {dashboardData?.userCount?.toLocaleString() || "0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Aksi Cepat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full justify-start">
                          <Plus className="mr-2 h-4 w-4" />
                          Tambah Produk Baru
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Tambah Produk Baru</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Judul Produk</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Deskripsi</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Harga</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Kategori</FormLabel>
                                    <Select
                                      value={field.value?.toString()}
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {categories.map((category) => (
                                          <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="imageUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL Gambar</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="downloadUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL Download</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                                Batal
                              </Button>
                              <Button type="submit" disabled={addProductMutation.isPending}>
                                {addProductMutation.isPending ? "Menyimpan..." : "Simpan"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveSection("orders")}>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Kelola Pesanan
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <UserCog className="mr-2 h-4 w-4" />
                      Kelola Pengguna
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pesanan Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-slate-200 rounded mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">#{order.id.toString().padStart(6, '0')}</p>
                              <p className="text-sm text-slate-600">
                                Rp {parseFloat(order.totalAmount).toLocaleString()}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeSection === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>Kelola Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between">
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-32"></div>
                            <div className="h-3 bg-slate-200 rounded w-48"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                            <div className="h-6 bg-slate-200 rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">#{order.id.toString().padStart(6, '0')}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(order.createdAt!).toLocaleDateString('id-ID')} • 
                            Rp {parseFloat(order.totalAmount).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(order.status)}
                          <Select
                            value={order.status}
                            onValueChange={(value) => 
                              updateOrderStatusMutation.mutate({ orderId: order.id, status: value })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Diproses</SelectItem>
                              <SelectItem value="completed">Selesai</SelectItem>
                              <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
