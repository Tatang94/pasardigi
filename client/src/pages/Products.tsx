import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, Grid, List } from "lucide-react";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: [
      `/api/products?${new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { categoryId: selectedCategory.toString() }),
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        limit: "20",
      }).toString()}`
    ],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query reactivity
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <CategoryNav />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 w-full">
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 sm:gap-4">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Cari produk digital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button type="submit" className="flex-shrink-0">Cari</Button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Card className="lg:sticky lg:top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Filter Produk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Category Filter */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Kategori</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all-categories"
                        checked={!selectedCategory}
                        onCheckedChange={() => setSelectedCategory(undefined)}
                      />
                      <label htmlFor="all-categories" className="text-sm text-slate-600">
                        Semua Kategori
                      </label>
                    </div>
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategory === category.id}
                          onCheckedChange={() => 
                            setSelectedCategory(selectedCategory === category.id ? undefined : category.id)
                          }
                        />
                        <label htmlFor={`category-${category.id}`} className="text-sm text-slate-600">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Rentang Harga</h4>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000000}
                      step={10000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Rp {priceRange[0].toLocaleString()}</span>
                      <span>Rp {priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                {searchTerm ? `Hasil pencarian: "${searchTerm}"` : "Semua Produk"}
              </h1>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="popular">Terpopuler</SelectItem>
                    <SelectItem value="price-low">Harga Terendah</SelectItem>
                    <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2 justify-center sm:justify-start">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-3 sm:gap-4 lg:gap-6 w-full`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 animate-pulse w-full">
                    <div className="w-full h-40 sm:h-48 bg-slate-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded mb-3"></div>
                    <div className="h-6 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-slate-600 text-base sm:text-lg">
                  {searchTerm ? `Tidak ada produk yang cocok dengan "${searchTerm}"` : "Belum ada produk tersedia."}
                </p>
                <p className="text-slate-500 text-sm sm:text-base">Coba ubah filter atau kata kunci pencarian Anda.</p>
              </div>
            ) : (
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-3 sm:gap-4 lg:gap-6 w-full`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
