import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Store, Search, ShoppingCart, Bell, User, LogOut, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { CartItem, Product } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

export default function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 w-full">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity min-w-0 flex-shrink-0">
              <Store className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-1 sm:mr-2" />
              <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">DigitalMarket</h1>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-2xl mx-2 lg:mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Cari produk digital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </form>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative p-2">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-primary">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="hidden sm:flex p-2">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2">
                  <img
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"}
                    alt="Profile"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-slate-700 hidden md:block truncate max-w-20">
                    {user?.firstName || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard Saya
                  </DropdownMenuItem>
                </Link>
                {user?.isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Panel Admin
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
