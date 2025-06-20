import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", { productId: product.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Berhasil",
        description: "Produk berhasil ditambahkan ke keranjang!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Gagal menambahkan produk ke keranjang",
        variant: "destructive",
      });
    },
  });

  const getCategoryBadge = (categoryId: number | null) => {
    if (!categoryId) return null;
    
    // Simple category mapping - in real app this would come from category data
    const categoryMap: { [key: number]: { name: string; color: string } } = {
      1: { name: "Template", color: "bg-primary/10 text-primary" },
      2: { name: "Plugin", color: "bg-purple-100 text-purple-800" },
      3: { name: "Desain", color: "bg-amber-100 text-amber-800" },
      4: { name: "Kursus", color: "bg-green-100 text-green-800" },
      5: { name: "Mobile", color: "bg-blue-100 text-blue-800" },
      6: { name: "Tools", color: "bg-rose-100 text-rose-800" },
    };

    const category = categoryMap[categoryId] || { name: "Digital", color: "bg-slate-100 text-slate-800" };
    
    return (
      <Badge className={`text-xs px-2 py-1 rounded-full font-medium ${category.color}`}>
        {category.name}
      </Badge>
    );
  };

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="flex">
          <img
            src={product.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=150&fit=crop"}
            alt={product.title}
            className="w-48 h-36 object-cover flex-shrink-0"
          />
          <CardContent className="p-6 flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-4">
                {getCategoryBadge(product.categoryId)}
                <h3 className="font-semibold text-slate-900 mt-2 mb-2">{product.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{product.description}</p>
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                  <span className="text-sm text-slate-600 ml-1">
                    {parseFloat(product.rating || "0").toFixed(1)} ({product.ratingCount || 0})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary mb-4">
                  Rp {parseFloat(product.price).toLocaleString()}
                </p>
                <Button
                  onClick={() => addToCartMutation.mutate()}
                  disabled={addToCartMutation.isPending}
                  className="bg-primary hover:bg-blue-600"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {addToCartMutation.isPending ? "Menambahkan..." : "Beli"}
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <img
        src={product.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop"}
        alt={product.title}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          {getCategoryBadge(product.categoryId)}
          <div className="flex items-center">
            <Star className="h-4 w-4 text-amber-400 fill-current" />
            <span className="text-sm text-slate-600 ml-1">
              {parseFloat(product.rating || "0").toFixed(1)}
            </span>
          </div>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            Rp {parseFloat(product.price).toLocaleString()}
          </span>
          <Button
            size="sm"
            onClick={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending}
            className="bg-primary hover:bg-blue-600"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {addToCartMutation.isPending ? "..." : "Beli"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
