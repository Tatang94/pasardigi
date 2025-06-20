import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, ShoppingCart, Users, Award } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Store className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-xl font-bold text-primary">DigitalMarket</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.href = '/auth?tab=login'}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                Masuk
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth?tab=register'}
                className="bg-primary hover:bg-blue-600"
              >
                Daftar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 animate-fade-in">
            Marketplace Digital #1 di Indonesia
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto animate-slide-up">
            Temukan dan beli produk digital terbaik dari ribuan kreator Indonesia. 
            Template, plugin, desain, dan banyak lagi!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/auth'}
              className="bg-primary hover:bg-blue-600"
            >
              Mulai Belanja
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = '/auth'}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Mulai Jual
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Mengapa Memilih DigitalMarket?
            </h2>
            <p className="text-lg text-slate-600">
              Platform terpercaya untuk kreator dan pembeli digital
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Belanja Mudah</h3>
                <p className="text-slate-600">
                  Interface yang intuitif dan proses checkout yang cepat untuk pengalaman belanja terbaik
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Komunitas Kreatif</h3>
                <p className="text-slate-600">
                  Bergabung dengan ribuan kreator Indonesia dan temukan inspirasi baru setiap hari
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Kualitas Terjamin</h3>
                <p className="text-slate-600">
                  Semua produk melalui proses kurasi ketat untuk memastikan kualitas terbaik
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-slate-300">Produk Digital</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">15,000+</div>
              <div className="text-slate-300">Penjual Aktif</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-400 mb-2">1M+</div>
              <div className="text-slate-300">Pembeli Puas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-rose-400 mb-2">4.9/5</div>
              <div className="text-slate-300">Rating Kepuasan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Store className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-bold">DigitalMarket</h3>
              </div>
              <p className="text-slate-400">
                Marketplace digital terpercaya untuk kreator dan pembeli Indonesia
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kategori</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Template & Tema</li>
                <li>Plugin & Tools</li>
                <li>Desain Grafis</li>
                <li>E-book & Kursus</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Pusat Bantuan</li>
                <li>Cara Berbelanja</li>
                <li>Cara Menjual</li>
                <li>Hubungi Kami</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tentang</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Tentang Kami</li>
                <li>Karir</li>
                <li>Syarat & Ketentuan</li>
                <li>Kebijakan Privasi</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 DigitalMarket. Semua hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
