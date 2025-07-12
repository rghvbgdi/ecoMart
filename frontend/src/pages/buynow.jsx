import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../apis/product';
import { createOrder } from '../apis/orders';
import { status as checkAuthStatus } from '../apis/auth';

const BuyNow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Also scroll to top after a small delay to ensure content is loaded
    const scrollTimer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    const fetchData = async () => {
      try {
        const authRes = await checkAuthStatus();
        setUser(authRes.user);
        const prod = await getProductById(id);
        setProduct(prod);
        setShippingAddress(authRes.user?.location || '');
      } catch (err) {
        setError('Failed to load product or user info.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Cleanup timer on unmount
    return () => clearTimeout(scrollTimer);
  }, [id]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setOrderPlacing(true);
    setError('');
    try {
      const payload = {
        productId: product._id,
        userId: user.id || user._id,
        shippingAddress: shippingAddress || 'Default Address, India',
      };
      console.log('Order payload:', payload);
      await createOrder(payload);
      setOrderSuccess(true);
      setTimeout(() => navigate('/home'), 2000);
    } catch (err) {
      console.error('Order error:', err, err.response?.data);
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setOrderPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600">Just one step away from your new product!</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Product Details Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-60 object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-xs font-medium text-gray-700">🌍 {product.origin}</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                <span className="text-xl font-bold text-indigo-600">₹{product.price.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                  {product.category}
                </span>
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  Origin: {product.origin}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>
              
              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-700">Free shipping on orders above ₹500</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-700">7-day return policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-700">Authentic product from {product.origin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🛒</span>
              Order Details
            </h3>
            
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  📍 Shipping Address
                </label>
                <textarea
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="2"
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete shipping address..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  💳 Payment Method
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value="💵 Cash on Delivery" 
                    disabled 
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium text-sm"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-green-600 font-semibold text-xs">✓ Available</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pay when your order arrives at your doorstep. No advance payment required!
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-gray-800">Order Summary</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Product Price</span>
                  <span className="font-medium text-sm">₹{product.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Shipping</span>
                  <span className="font-medium text-green-600 text-sm">FREE</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg text-indigo-600">₹{product.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <span className="text-red-700 font-medium text-sm">{error}</span>
                  </div>
                </div>
              )}

              {orderSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span className="text-green-700 font-medium text-sm">Order placed successfully! Redirecting...</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={orderPlacing}
              >
                {orderPlacing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Placing Order...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🚀 Place Order - ₹{product.price.toLocaleString()}
                  </span>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 Your order is secure and protected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyNow;