import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import type { Category } from "@shared/schema";

export default function CategoryNav() {
  const [location, setLocation] = useLocation();
  
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Extract current category from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const currentCategoryId = urlParams.get('categoryId');

  const handleCategoryClick = (categoryId?: number) => {
    if (categoryId) {
      setLocation(`/products?categoryId=${categoryId}`);
    } else {
      setLocation('/products');
    }
  };

  if (isLoading) {
    return (
      <nav className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-24 whitespace-nowrap"></div>
              </div>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-slate-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8 overflow-x-auto">
          <Button
            variant="ghost"
            onClick={() => handleCategoryClick()}
            className={`whitespace-nowrap text-sm font-medium transition-colors pb-2 hover:text-primary ${
              !currentCategoryId 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-slate-600'
            }`}
          >
            Semua Kategori
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => handleCategoryClick(category.id)}
              className={`whitespace-nowrap text-sm font-medium transition-colors pb-2 hover:text-primary ${
                currentCategoryId === category.id.toString()
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-600'
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
