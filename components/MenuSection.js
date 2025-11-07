import React from 'react';
import { Pizza, Coffee, Utensils, Star } from 'lucide-react';

const MenuSection = () => {
  const menuItems = {
    pizzas: [
      { id: 1, name: 'Margherita Pizza', price: 12.99, description: 'Fresh mozzarella, tomato sauce, basil', rating: 4.8, image: '🍕' },
      { id: 2, name: 'Pepperoni Pizza', price: 14.99, description: 'Spicy pepperoni, mozzarella, tomato sauce', rating: 4.9, image: '🍕' },
      { id: 3, name: 'BBQ Chicken Pizza', price: 16.99, description: 'BBQ sauce, grilled chicken, red onions', rating: 4.7, image: '🍕' }
    ],
    burgers: [
      { id: 4, name: 'Classic Beef Burger', price: 9.99, description: 'Angus beef, lettuce, tomato, cheese', rating: 4.6, image: '🍔' },
      { id: 5, name: 'Chicken Burger', price: 8.99, description: 'Grilled chicken breast, avocado, mayo', rating: 4.5, image: '🍔' },
      { id: 6, name: 'Veggie Burger', price: 7.99, description: 'Plant-based patty, fresh vegetables', rating: 4.4, image: '🍔' }
    ],
    drinks: [
      { id: 7, name: 'Soft Drinks', price: 2.99, description: 'Coke, Sprite, Fanta, Pepsi', rating: 4.3, image: '🥤' },
      { id: 8, name: 'Fresh Juices', price: 3.99, description: 'Orange, Apple, Pineapple, Mango', rating: 4.6, image: '🧃' },
      { id: 9, name: 'Coffee & Tea', price: 2.49, description: 'Espresso, Latte, Cappuccino, Green Tea', rating: 4.4, image: '☕' }
    ]
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Menu</h2>
        <p className="text-gray-600">Browse our delicious offerings</p>
      </div>

      {/* Pizzas */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Pizza className="text-emerald-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Pizzas</h3>
        </div>
        <div className="space-y-3">
          {menuItems.pizzas.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.image}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="text-yellow-400" size={14} fill="currentColor" />
                      <span className="text-xs text-gray-600">{item.rating}</span>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-emerald-600">${item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Burgers */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="text-emerald-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Burgers</h3>
        </div>
        <div className="space-y-3">
          {menuItems.burgers.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.image}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="text-yellow-400" size={14} fill="currentColor" />
                      <span className="text-xs text-gray-600">{item.rating}</span>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-emerald-600">${item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drinks */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Coffee className="text-emerald-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Drinks</h3>
        </div>
        <div className="space-y-3">
          {menuItems.drinks.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.image}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="text-yellow-400" size={14} fill="currentColor" />
                      <span className="text-xs text-gray-600">{item.rating}</span>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-emerald-600">${item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuSection; 