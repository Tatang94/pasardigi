import { Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Store className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-xl font-bold">DigitalMarket</h3>
            </div>
            <p className="text-slate-400 mb-4">
              Marketplace digital terpercaya untuk kreator dan pembeli Indonesia
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Kategori</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Template & Tema</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Plugin & Tools</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Desain Grafis</a></li>
              <li><a href="#" className="hover:text-white transition-colors">E-book & Kursus</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cara Berbelanja</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cara Menjual</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Tentang</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 DigitalMarket. Semua hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
