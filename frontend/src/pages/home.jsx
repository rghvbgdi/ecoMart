import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnsoldProducts } from '../apis/product';
import { status as checkAuthStatus } from '../apis/auth';
import { getNearbyGreenProducts } from '../apis/green';
import Cookies from 'js-cookie';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState('Unknown');
  const [userGreenCoins, setUserGreenCoins] = useState(0);
  const [userCarbonSaved, setUserCarbonSaved] = useState(0);
  const [greenDeals, setGreenDeals] = useState([]);
  const [showGreenDealsOnly, setShowGreenDealsOnly] = useState(false);
  const navigate = useNavigate();

  // Category filter hooks and derived variables
  const categories = Array.from(new Set(products.map(p => p.category)));
  const [selectedCategory, setSelectedCategory] = useState('All');
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  // Calculate green coins based on price (10 to 50)
  const calculateGreenCoins = (price) => {
    const minCoins = 10;
    const maxCoins = 50;
    const priceFactor = Math.min(Math.max(price / 100, 0), 1);
    return Math.floor(minCoins + (maxCoins - minCoins) * priceFactor + Math.random() * 10);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let loggedIn = false;
        // Always use city name from cookie
        let currentUserLocation = Cookies.get('user_location') || 'Unknown';
        setUserLocation(currentUserLocation);

        try {
          const authResponse = await checkAuthStatus();
          loggedIn = true;
          setIsLoggedIn(true);
          if (authResponse.data?.user?.greenCoins) {
            setUserGreenCoins(authResponse.data.user.greenCoins);
          }
          if (authResponse.data?.user?.carbonFootprintSaved) {
            setUserCarbonSaved(authResponse.data.user.carbonFootprintSaved);
          }
        } catch (authError) {
          setIsLoggedIn(false);
          console.log('User not logged in or session expired.');
        }

        const allProducts = await getUnsoldProducts();
        setProducts(allProducts);
        const greenDealsRes = await getNearbyGreenProducts(currentUserLocation);
        setGreenDeals(greenDealsRes);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBuyNow = (product) => {
    if (!isLoggedIn) {
      alert('Please log in to purchase products.');
      navigate('/login');
      return;
    }
    navigate(`/buynow/${product._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg font-medium">Loading sustainable products...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-2xl shadow-2xl max-w-md"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"> {/* Light base background */}

      {/* Hero Banner - Green Deals Spotlight (KEPT DARK) */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-800 via-emerald-800 to-teal-800"></div>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Animated background elements - NOW GREEN LEAVES */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-300 text-3xl" // Larger size for leaves
              animate={{
                x: [0, Math.random() * 200 - 100, 0], // More varied horizontal movement
                y: [0, -150, 0], // Float upwards more
                opacity: [0.2, 0.6, 0.2], // Softer opacity changes
                rotate: [0, Math.random() * 360 + 180, 0], // More random rotation
              }}
              transition={{
                duration: 8 + i * 1.5, // Slower, more floaty duration
                repeat: Infinity,
                delay: i * 0.5, // Staggered delay
                ease: "linear", // Consistent movement
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              🍀
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-lime-300 to-green-100 bg-clip-text text-transparent">
              🌱 GREEN DEALS
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-8 text-green-200">
              Exclusive Eco-Friendly Products • Extra Rewards • Save the Planet
            </p>



            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGreenDealsOnly(!showGreenDealsOnly)}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
                  showGreenDealsOnly
                    ? 'bg-green-300 text-green-900 shadow-2xl border-2 border-green-500 hover:bg-green-400'
                    : 'bg-white text-green-800 border-2 border-green-400 hover:bg-green-50 shadow-lg' // Minimalist button colors
                }`}
              >
                {showGreenDealsOnly ? '🌍 Show All Products' : '🌱 View Green Deals Only'}
              </motion.button>
              {/* Removed user location display here */}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'All'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300'
              }`}
              onClick={() => setSelectedCategory('All')}
            >
              All Products ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* GREEN DEALS SECTION - Now LIGHT THEMED */}
        {greenDeals.length > 0 && !showGreenDealsOnly && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-300 rounded-3xl blur opacity-20"></div>
              <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-green-800 mb-2">
                      🌱 PREMIUM GREEN DEALS
                    </h2>
                    <p className="text-green-600 font-medium">Limited time • Extra rewards • Maximum impact</p>
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-2xl font-black text-lg shadow-lg"
                  >
                    🔥 HOT DEALS
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {greenDeals.map((green, idx) => (
                    <motion.div
                      key={green._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                      }}
                      className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-green-200 overflow-hidden group"
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                      {/* Premium Badge */}
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                        PREMIUM
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative">
                            <img
                              src={green.productId?.imageUrl}
                              alt={green.productId?.name}
                              className="w-20 h-20 object-cover rounded-2xl shadow-md"
                            />
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              🌱
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-2">
                              {green.productId?.name}
                            </h3>
                            <p className="text-2xl font-black text-green-600">₹{green.productId?.price}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {/* Benefit Boxes: More minimalist colors */}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-amber-50 text-amber-800 text-sm px-3 py-2 rounded-xl font-bold text-center border border-amber-100"
                          >
                            <div className="text-lg font-black">+{green.greenCoins}</div>
                            <div className="text-xs">Green Coins</div>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-green-50 text-green-800 text-sm px-3 py-2 rounded-xl font-bold text-center border border-green-100"
                          >
                            <div className="text-lg font-black">-{green.carbonFootprint}kg</div>
                            <div className="text-xs">CO₂ Saved</div>
                          </motion.div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-black text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                          onClick={() => navigate(`/greenbuynow/${green._id}`)}
                        >
                          🚀 GET GREEN DEAL
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular Products Grid - Now LIGHT THEMED */}
        {!showGreenDealsOnly && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Products</h2>
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-8xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500">Try selecting a different category</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredProducts.map((product, index) => {
                  const isGreenProduct = product.isGreenDeal || product.greenProduct?.status;

                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      whileHover={{ scale: 1.03 }}
                      className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 border-2 overflow-hidden group cursor-pointer ${
                        isGreenProduct
                          ? 'border-green-200 hover:border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleBuyNow(product)}
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gray-100">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Green Product Badge */}
                        {isGreenProduct && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                          >
                            🌱 ECO
                          </motion.div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Price and Category */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xl font-black text-gray-900">₹{product.price}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                        </div>

                        {/* Green Benefits: More minimalist colors */}
                        {isGreenProduct && (
                          <div className="flex items-center gap-1 text-xs mb-3">
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-bold border border-amber-100"
                            >
                              +{calculateGreenCoins(product.price)} coins
                            </motion.span>
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold border border-green-100"
                            >
                              -2kg CO₂
                            </motion.span>
                          </div>
                        )}

                        {/* Action Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-full py-2 px-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-md ${
                            isGreenProduct
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyNow(product);
                          }}
                        >
                          {isGreenProduct ? '🌱 Buy Green' : '🛒 Buy Now'}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Green Deals Only View - Now LIGHT THEMED */}
        {showGreenDealsOnly && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-green-800 mb-2">
                🌱 EXCLUSIVE GREEN DEALS
              </h2>
              <p className="text-green-600 font-medium">
                Premium eco-friendly products with maximum rewards
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {greenDeals.map((green, idx) => (
                <motion.div
                  key={green._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-green-200 overflow-hidden group"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                  {/* Premium Badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-black px-4 py-2 rounded-full transform rotate-12 shadow-lg">
                    PREMIUM
                  </div>

                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <div className="relative inline-block">
                        <img
                          src={green.productId?.imageUrl}
                          alt={green.productId?.name}
                          className="w-32 h-32 object-cover rounded-3xl shadow-lg mx-auto"
                        />
                        <div className="absolute -top-3 -right-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                          🌱
                        </div>
                      </div>
                    </div>

                    <h3 className="font-black text-gray-800 text-xl mb-2 text-center line-clamp-2">
                      {green.productId?.name}
                    </h3>
                    <p className="text-3xl font-black text-green-600 text-center mb-6">
                      ₹{green.productId?.price}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Benefit Boxes: More minimalist colors */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-amber-50 text-amber-800 text-center px-4 py-3 rounded-2xl font-bold border border-amber-100"
                      >
                        <div className="text-2xl font-black">+{green.greenCoins}</div>
                        <div className="text-xs">Green Coins</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-green-50 text-green-800 text-center px-4 py-3 rounded-2xl font-bold border border-green-100"
                      >
                        <div className="text-2xl font-black">-{green.carbonFootprint}kg</div>
                        <div className="text-xs">CO₂ Saved</div>
                      </motion.div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-black text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                      onClick={() => navigate(`/greenbuynow/${green._id}`)}
                    >
                      🚀 GET GREEN DEAL
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Footer (KEPT DARK) */}
      <footer className="bg-gradient-to-r from-gray-950 to-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                🌱 EcoMart
              </h3>
              <p className="text-gray-300 text-lg font-medium">
                Revolutionizing e-commerce with sustainable rewards
              </p>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-black text-green-400 mb-2">50k+</div>
                  <div className="text-gray-400 font-medium">Kg CO₂ Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-amber-400 mb-2">1M+</div>
                  <div className="text-gray-400 font-medium">Green Coins</div>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="text-lg font-bold text-green-400 mb-2">
                🏆 Winner Material
              </div>
              <p className="text-gray-300 font-medium">
                Sustainable • Rewarding • Innovative
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 EcoMart. Making sustainability profitable for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;