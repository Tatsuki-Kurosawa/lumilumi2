import React from 'react';
import { TrendingUp, Star, Clock, Heart } from 'lucide-react';

interface CategoryNavigationProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  showTrending?: boolean;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({ 
  activeCategory, 
  onCategoryChange,
  showTrending = true 
}) => {
  const categories = [
    { id: 'recommended', label: 'おすすめ', icon: Star },
    { id: 'trending', label: '急上昇', icon: TrendingUp },
    { id: 'latest', label: '新着', icon: Clock },
    { id: 'popular', label: '人気', icon: Heart },
  ];

  const visibleCategories = showTrending ? categories : categories.filter(cat => cat.id !== 'trending');

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 overflow-x-auto py-3">
          {visibleCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;