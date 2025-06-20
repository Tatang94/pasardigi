import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ShoppingBag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { CartItem, Product } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

export default function Cart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus dari keranjang",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus produk dari keranjang",
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/orders");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Berhasil",
        description: "Pesanan berhasil dibuat! Silakan lakukan pembayaran.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal membuat pesanan",
        variant: "destructive",
      });
    },
  });

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.product.price), 0);
  const adminFee = 5000;
  const total = subtotal + adminFee;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-xl">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-slate-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded"></div>
                        <div className="h-3 bg-slate-200 rounded w-32"></div>
                        <div className="h-6 bg-slate-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white p-6 rounded-xl h-fit">
                <div className="space-y-4">
                  <div className="h-6 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Keranjang Belanja</h1>

        {cartItems.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Keranjang Anda Kosong</h2>
              <p className="text-slate-600 mb-6">Belum ada produk yang ditambahkan ke keranjang</p>
              <Link href="/products">
                <Button>Mulai Belanja</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Item dalam Keranjang ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                        <img
                          src={item.product.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&h=100&fit=crop"}
                          alt={item.product.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{item.product.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{item.product.description}</p>
                          <p className="text-lg font-bold text-primary mt-2">
                            Rp {parseFloat(item.product.price).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCartMutation.mutate(item.productId)}
                          disabled={removeFromCartMutation.isPending}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal ({cartItems.length} item)</span>
                      <span className="font-semibold">Rp {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Biaya Admin</span>
                      <span className="font-semibold">Rp {adminFee.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-slate-900">Total</span>
                        <span className="text-lg font-bold text-primary">Rp {total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      className="w-full"
                      onClick={() => createOrderMutation.mutate()}
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? "Memproses..." : "Lanjut ke Pembayaran"}
                    </Button>
                    <Link href="/products">
                      <Button variant="outline" className="w-full">
                        Lanjut Belanja
                      </Button>
                    </Link>
                  </div>

                  {/* Payment Methods Preview */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-3">Metode Pembayaran Tersedia:</p>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="bg-slate-100 px-2 py-1 rounded font-medium">OVO</div>
                      <div className="bg-slate-100 px-2 py-1 rounded font-medium">GoPay</div>
                      <div className="bg-slate-100 px-2 py-1 rounded font-medium">DANA</div>
                      <div className="bg-slate-100 px-2 py-1 rounded font-medium">Bank</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
