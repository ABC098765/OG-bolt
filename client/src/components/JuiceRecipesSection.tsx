import React from 'react';
import { Link } from 'wouter';
import { Heart, Clock, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const JuiceRecipesSection = () => {
  // Featured recipes for homepage preview
  const featuredRecipes = [
    {
      id: 'tropical-immunity',
      title: 'Tropical Immunity Boost',
      description: 'Vitamin C powerhouse with pineapple, orange & ginger',
      image: '/Fresh_fruit_hero_display_11baa93f.png',
      prepTime: '5 min',
      difficulty: 'Easy',
      fruits: ['🍍', '🍊', '🫚'],
      price: 14.97
    },
    {
      id: 'green-detox',
      title: 'Green Detox Cleanser',
      description: 'Refreshing blend with apple, cucumber & spinach',
      image: '/Fresh_fruit_hero_display_11baa93f.png',
      prepTime: '7 min',
      difficulty: 'Medium',
      fruits: ['🍏', '🥒', '🥬'],
      price: 14.97
    },
    {
      id: 'citrus-energy',
      title: 'Morning Citrus Energy',
      description: 'Energizing oranges, lemons & carrots blend',
      image: '/Fresh_fruit_hero_display_11baa93f.png',
      prepTime: '4 min',
      difficulty: 'Easy',
      fruits: ['🍊', '🍋', '🥕'],
      price: 11.97
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Perfect <span className="text-gradient bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">Juice Combinations</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Turn our fresh fruits into healthy, delicious juices with our curated recipe collection. 
            Each combination is designed for maximum nutrition and incredible taste.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center items-center gap-8 text-gray-600 dark:text-gray-300">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">15+</div>
              <div className="text-sm">Recipes</div>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">5 min</div>
              <div className="text-sm">Average Prep</div>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">100%</div>
              <div className="text-sm">Fresh Fruits</div>
            </div>
          </div>
        </motion.div>

        {/* Featured Recipe Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Recipe Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Fruit Emojis Overlay */}
                <div className="absolute top-4 left-4 flex gap-1">
                  {recipe.fruits.map((fruit, i) => (
                    <span key={i} className="text-2xl bg-white/80 rounded-full w-10 h-10 flex items-center justify-center">
                      {fruit}
                    </span>
                  ))}
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {recipe.difficulty}
                  </span>
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
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.prepTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    4.8
                  </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    ₹{recipe.price}
                  </span>
                  <Link
                    to="/juice-recipes"
                    className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1 transition-colors"
                  >
                    View Recipe
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/juice-recipes"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-orange-500 text-white px-8 py-4 rounded-full hover:from-green-700 hover:to-orange-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Heart className="w-5 h-5" />
            Explore All Juice Recipes
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
            15+ healthy combinations • Fresh ingredients • Easy instructions
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default JuiceRecipesSection;