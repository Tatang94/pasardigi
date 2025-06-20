import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

export default function Home() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products?limit=8"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <CategoryNav />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Marketplace Digital #1 di Indonesia
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto animate-slide-up">
              Temukan dan beli produk digital terbaik dari ribuan kreator Indonesia. Template, plugin, desain, dan banyak lagi!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50">
                  Jelajahi Produk
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Panel Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Produk Terpopuler</h2>
            <p className="text-lg text-slate-600">Produk digital paling laris dan mendapat rating tertinggi</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                  <div className="w-full h-48 bg-slate-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-3"></div>
                  <div className="h-6 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">Belum ada produk tersedia.</p>
              <p className="text-slate-500">Silakan periksa kembali nanti.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Lihat Semua Produk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-slate-600">Produk Digital</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">15,000+</div>
              <div className="text-slate-600">Penjual Aktif</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-600 mb-2">1M+</div>
              <div className="text-slate-600">Pembeli Puas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-rose-600 mb-2">4.9/5</div>
              <div className="text-slate-600">Rating Kepuasan</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
