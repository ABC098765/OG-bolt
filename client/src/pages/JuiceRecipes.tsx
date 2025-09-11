import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Star, Clock, Users, Plus, Heart, Filter, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';

// Sample recipe data - will be expanded later
const sampleRecipes = [
  {
    id: 'tropical-immunity',
    title: 'Tropical Immunity Boost',
    description: 'Vitamin C powerhouse with pineapple, orange, and ginger',
    image: '/Fresh_fruit_hero_display_11baa93f.png',
    prepTime: '5 minutes',
    yield: '2 servings',
    difficulty: 'beginner',
    rating: 4.8,
    reviewCount: 124,
    healthBenefits: ['immunity', 'energy'],
    tasteProfile: ['sweet', 'tropical'],
    season: ['winter', 'spring'],
    ingredients: [
      { name: 'Fresh Pineapple', quantity: '1 cup', price: 6.99, productId: 'pineapple' },
      { name: 'Oranges', quantity: '3 medium', price: 4.99, productId: 'orange' },
      { name: 'Fresh Ginger', quantity: '1 inch', price: 2.99, productId: 'ginger' }
    ],
    instructions: [
      'Wash and peel all fruits',
      'Cut pineapple and oranges into chunks',
      'Juice fruits in order: ginger, oranges, pineapple',
      'Stir well and serve immediately'
    ],
    nutritionHighlights: ['High Vitamin C', 'Anti-inflammatory', 'Natural Energy']
  },
  {
    id: 'green-detox',
    title: 'Green Detox Cleanser',
    description: 'Refreshing green blend with apple, cucumber, and spinach',
    image: '/Fresh_fruit_hero_display_11baa93f.png',
    prepTime: '7 minutes',
    yield: '2 servings',
    difficulty: 'intermediate',
    rating: 4.6,
    reviewCount: 89,
    healthBenefits: ['detox', 'digestive'],
    tasteProfile: ['fresh', 'earthy'],
    season: ['spring', 'summer'],
    ingredients: [
      { name: 'Green Apples', quantity: '2 large', price: 5.99, productId: 'apple' },
      { name: 'Cucumber', quantity: '1 large', price: 3.99, productId: 'cucumber' },
      { name: 'Fresh Spinach', quantity: '2 cups', price: 4.99, productId: 'spinach' }
    ],
    instructions: [
      'Wash all ingredients thoroughly',
      'Core apples and cut into pieces',
      'Slice cucumber',
      'Juice vegetables first, then apples',
      'Mix well and serve chilled'
    ],
    nutritionHighlights: ['High Fiber', 'Detoxifying', 'Iron Rich']
  },
  {
    id: 'citrus-energy',
    title: 'Morning Citrus Energy',
    description: 'Energizing blend of oranges, lemons, and carrots',
    image: '/Fresh_fruit_hero_display_11baa93f.png',
    prepTime: '4 minutes',
    yield: '1 serving',
    difficulty: 'beginner',
    rating: 4.9,
    reviewCount: 156,
    healthBenefits: ['energy', 'immunity'],
    tasteProfile: ['citrusy', 'sweet'],
    season: ['all'],
    ingredients: [
      { name: 'Oranges', quantity: '2 large', price: 4.99, productId: 'orange' },
      { name: 'Lemon', quantity: '1 medium', price: 2.99, productId: 'lemon' },
      { name: 'Carrots', quantity: '3 medium', price: 3.99, productId: 'carrot' }
    ],
    instructions: [
      'Wash and peel oranges and carrots',
      'Cut carrots into small pieces',
      'Juice carrots first, then citrus fruits',
      'Stir and enjoy immediately'
    ],
    nutritionHighlights: ['Beta Carotene', 'Vitamin C', 'Natural Sugars']
  }
];

const JuiceRecipes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const { addToCart } = useCart();

  const filteredRecipes = useMemo(() => {
    return sampleRecipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || 
                           recipe.healthBenefits.includes(selectedFilter) ||
                           recipe.tasteProfile.includes(selectedFilter) ||
                           recipe.difficulty === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, selectedFilter]);

  const addAllIngredientsToCart = async (recipe: any) => {
    try {
      console.log('🥤 Adding recipe ingredients to cart:', recipe.title);
      let addedCount = 0;
      
      for (const ingredient of recipe.ingredients) {
        try {
          // For now, use sample product structure - would ideally fetch from Firestore
          // TODO: Replace with real product lookup from catalog
          const product = {
            id: ingredient.productId || `recipe-${ingredient.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: ingredient.name,
            price: ingredient.price,
            displayPrice: `₹${ingredient.price}`,
            image: '/Fresh_fruit_hero_display_11baa93f.png',
            imageUrls: ['/Fresh_fruit_hero_display_11baa93f.png'],
            unit: 'piece',
            amount: ingredient.quantity,
            selectedAmount: ingredient.quantity,
            // Add required fields for cart compatibility
            unitPrice: ingredient.price,
            inStock: true,
            category: 'Fruits'
          };
          
          await addToCart(product);
          addedCount++;
          console.log(`✅ Added ${ingredient.name} to cart`);
        } catch (error) {
          console.error(`❌ Failed to add ${ingredient.name}:`, error);
        }
      }
      
      // Show success feedback
      if (addedCount > 0) {
        console.log(`🛒 Successfully added ${addedCount} items from ${recipe.title} to cart`);
      }
    } catch (error) {
      console.error('❌ Error adding recipe ingredients to cart:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-orange-600 bg-orange-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const totalRecipePrice = (recipe: any) => {
    return recipe.ingredients.reduce((sum: number, ingredient: any) => sum + ingredient.price, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-orange-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Fresh Fruit Juice <span className="text-yellow-300">Combinations</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 max-w-3xl mx-auto mb-8"
          >
            Discover perfect fruit combinations for homemade juices. Premium fruits, perfect blends, healthy goodness.
          </motion.p>
          
          {/* Search and Filter Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search recipes, fruits, or health benefits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all">All Recipes</option>
              <option value="immunity">Immunity Boost</option>
              <option value="energy">Energy</option>
              <option value="detox">Detox</option>
              <option value="beginner">Beginner</option>
              <option value="sweet">Sweet</option>
              <option value="tropical">Tropical</option>
            </select>
          </motion.div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Recipe Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{recipe.rating}</span>
                  <span className="text-sm opacity-75">({recipe.reviewCount})</span>
                </div>
              </div>

              {/* Recipe Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {recipe.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {recipe.description}
                </p>

                {/* Quick Info */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.prepTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.yield}
                  </div>
                </div>

                {/* Health Benefits */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.nutritionHighlights.slice(0, 3).map((benefit, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                      {benefit}
                    </span>
                  ))}
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    ₹{totalRecipePrice(recipe).toFixed(2)}
                  </span>
                  <button
                    onClick={() => addAllIngredientsToCart(recipe)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add All Fruits
                  </button>
                </div>

                {/* View Recipe Link */}
                <button
                  onClick={() => setSelectedRecipe(selectedRecipe === recipe.id ? null : recipe.id)}
                  className="w-full mt-3 text-green-600 dark:text-green-400 font-medium text-sm hover:text-green-700 dark:hover:text-green-300 transition-colors"
                >
                  {selectedRecipe === recipe.id ? 'Hide Recipe' : 'View Full Recipe →'}
                </button>

                {/* Expanded Recipe Details */}
                {selectedRecipe === recipe.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Ingredients:</h4>
                    <ul className="space-y-1 mb-4">
                      {recipe.ingredients.map((ingredient, i) => (
                        <li key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {ingredient.quantity} {ingredient.name}
                          </span>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            ₹{ingredient.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions:</h4>
                    <ol className="space-y-1">
                      {recipe.instructions.map((step, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300">
                          {i + 1}. {step}
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No recipes found. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-green-50 dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Love these combinations?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Get all the fresh fruits you need for perfect homemade juices, delivered fresh to your door.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold text-lg"
          >
            Shop Fresh Fruits
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JuiceRecipes;