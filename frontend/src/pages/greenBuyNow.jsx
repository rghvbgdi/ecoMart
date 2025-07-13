import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGreenProductById, createGreenOrder, getEnvironmentalImpact } from '../apis/green';
import { status as checkAuthStatus } from '../apis/auth';
import Cookies from 'js-cookie';

const GreenBuyNow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [greenProduct, setGreenProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [environmentalImpact, setEnvironmentalImpact] = useState(null);
  const [showEnvironmentalModal, setShowEnvironmentalModal] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await checkAuthStatus();
        setUser(authRes.user);
        setShippingAddress(authRes.user?.location || '');
        
        const product = await getGreenProductById(id);
        setGreenProduct(product);
      } catch (err) {
        setError('Failed to load green product or user info.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setOrderPlacing(true);
    setError('');
    try {
      // Ensure shipping address is provided
      if (!shippingAddress || shippingAddress.trim() === '') {
        setError('Please enter your delivery address');
        setOrderPlacing(false);
        return;
      }

      const orderResponse = await createGreenOrder({
        customerId: user.id || user._id,
        productId: greenProduct.productId._id,
        shippingAddress: shippingAddress.trim(),
      });
      setOrderSuccess(true);
      setOrderId(orderResponse.data.order._id);
      
      try {
        const userLocation = Cookies.get('user_location') || 'Unknown Location';
        const impactData = await getEnvironmentalImpact({
          greenProductId: id,
          userLocation: userLocation
        });
        setEnvironmentalImpact(impactData);
        setShowEnvironmentalModal(true);
      } catch (impactError) {
        console.error('Failed to get environmental impact:', impactError);
        setShowEnvironmentalModal(true);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place green order.');
    } finally {
      setOrderPlacing(false);
    }
  };

  const handleShopMore = () => {
    setShowEnvironmentalModal(false);
    navigate('/home');
  };

  const handleTrackOrder = () => {
    setShowEnvironmentalModal(false);
    if (orderId) {
      navigate(`/track/${orderId}`);
    } else {
      navigate('/myorders');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-green-700 font-medium">Loading Green Rescue...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    </div>
  );
  
  if (!greenProduct) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-600 text-lg font-medium">Green Rescue product not found</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-800">Green Rescue Checkout</h1>
                <p className="text-sm text-green-600">Saving the planet, one rescued order at a time</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Secure Checkout
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product & Shipping */}
          <div className="lg:col-span-2 space-y-6">
            {/* Green Rescue Alert */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-amber-800">🌱 Green Rescue Alert!</h3>
                </div>
                <p className="text-amber-700 text-sm leading-relaxed">
                  This product was originally ordered by someone else but got cancelled. By purchasing this item, you're helping us reduce waste, save transportation emissions, and support sustainable commerce practices!
                </p>
                <div className="flex items-center gap-4 mt-4 text-xs text-amber-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Nearby Location
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reduced Delivery Time
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Zero Waste
                  </span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Product Details</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img 
                    src={greenProduct.productId?.imageUrl} 
                    alt={greenProduct.productId?.name} 
                    className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-md"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{greenProduct.productId?.name}</h3>
                  <p className="text-gray-600 mb-3">{greenProduct.productId?.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-green-600">₹{greenProduct.productId?.price}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {greenProduct.productId?.category}
                    </span>
                  </div>
                  
                  {/* Environmental Benefits */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-sm font-medium text-green-700">Green Coins</span>
                      </div>
                      <p className="text-lg font-bold text-green-600">+{greenProduct.greenCoins}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-700">CO₂ Saved</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{greenProduct.carbonFootprint} kg</p>
                    </div>
                  </div>

                  {/* Warehouse Info */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Warehouse Location</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Lat: {greenProduct.warehouseLocation?.latitude}, Long: {greenProduct.warehouseLocation?.longitude}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Information</h2>
              <form onSubmit={handleOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows="3"
                    value={shippingAddress}
                    onChange={e => setShippingAddress(e.target.value)}
                    placeholder="Enter your complete delivery address..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-gray-700 font-medium">Cash on Delivery</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Delivery
                    </label>
                    <div className="flex items-center gap-3 p-3 border border-green-300 rounded-lg bg-green-50">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-700 font-medium">1-2 Days (Green Rescue)</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-red-700 font-medium">{error}</span>
                    </div>
                  </div>
                )}

                {orderSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-700 font-medium">Green Rescue order placed successfully! 🌱</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item Total</span>
                  <span className="font-medium">₹{greenProduct.productId?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-green-600">₹0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Green Rescue Discount</span>
                  <span className="font-medium text-green-600">-₹25</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-green-600">₹{greenProduct.productId?.price - 25}</span>
                  </div>
                </div>
              </div>

              {/* Environmental Impact Preview */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                <h3 className="text-sm font-bold text-green-800 mb-3">🌍 Your Environmental Impact</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">🌳</div>
                    <div className="text-green-700">Trees Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">💨</div>
                    <div className="text-blue-700">CO₂ Reduced</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">⛽</div>
                    <div className="text-purple-700">Fuel Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600">♻️</div>
                    <div className="text-amber-700">Waste Reduced</div>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleOrder}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={orderPlacing}
              >
                {orderPlacing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Green Rescue...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Complete Green Rescue Order
                  </div>
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-6 flex justify-center items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Eco-Friendly
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Fast Delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Environmental Impact Modal */}
      {showEnvironmentalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-green-200 relative overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Decorative Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="relative text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌱</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Green Rescue Complete! 🎉</h2>
                <p className="text-green-100">Your order is making a real difference</p>
              </div>
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Impact Story */}
                <div>
                  {environmentalImpact && environmentalImpact.environmentalImpact ? (
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-200 h-full flex flex-col">
                      <h3 className="text-lg font-bold text-green-800 mb-3">📖 Your Impact Story</h3>
                      <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line flex-1">
                        {environmentalImpact.environmentalImpact}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-200 h-full flex flex-col">
                      <h3 className="text-lg font-bold text-green-800 mb-3">📖 Your Impact Story</h3>
                      <div className="text-gray-700 text-sm leading-relaxed flex-1">
                        🎉 Thank you for your Green Rescue purchase! By choosing this item, you've helped Walmart reduce waste, minimize carbon emissions, and create a more sustainable future. Your decision to rescue this product means it won't go to waste and contributes to our circular economy goals.
                      </div>
                    </div>
                  )}
                </div>
                {/* Environmental Metrics */}
                <div>
                  {environmentalImpact && environmentalImpact.data && environmentalImpact.data.metrics ? (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center border border-green-200 hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-2">🌳</div>
                        <div className="text-xl font-bold text-green-600">{environmentalImpact.data.metrics.treesEquivalent}</div>
                        <div className="text-sm text-green-700">Trees Equivalent</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200 hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-2">💨</div>
                        <div className="text-xl font-bold text-blue-600">{environmentalImpact.data.metrics.totalCO2Saved} kg</div>
                        <div className="text-sm text-blue-700">CO₂ Saved</div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl text-center border border-amber-200 hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-2">⛽</div>
                        <div className="text-xl font-bold text-amber-600">{environmentalImpact.data.metrics.fuelSaved}L</div>
                        <div className="text-sm text-amber-700">Fuel Saved</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200 hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-2">💰</div>
                        <div className="text-xl font-bold text-purple-600">₹{environmentalImpact.data.metrics.monetaryValue}</div>
                        <div className="text-sm text-purple-700">Environmental Value</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center border border-green-200">
                        <div className="text-2xl mb-2">🌳</div>
                        <div className="text-xl font-bold text-green-600">2-3</div>
                        <div className="text-sm text-green-700">Trees Saved</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
                        <div className="text-2xl mb-2">💨</div>
                        <div className="text-xl font-bold text-blue-600">{greenProduct.carbonFootprint} kg</div>
                        <div className="text-sm text-blue-700">CO₂ Reduced</div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl text-center border border-amber-200">
                        <div className="text-2xl mb-2">⛽</div>
                        <div className="text-xl font-bold text-amber-600">5-8L</div>
                        <div className="text-sm text-amber-700">Fuel Saved</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200">
                        <div className="text-2xl mb-2">♻️</div>
                        <div className="text-xl font-bold text-purple-600">100%</div>
                        <div className="text-sm text-purple-700">Waste Prevented</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Achievement Badge */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="text-lg font-bold text-amber-800 mb-1">Green Hero Achievement Unlocked!</h3>
                <p className="text-sm text-amber-700">You've earned +{greenProduct.greenCoins} Green Coins for this rescue mission</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2 sticky bottom-0 bg-white pt-2 pb-2 z-10">
                <button
                  onClick={handleShopMore}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 transform hover:scale-105"
                  autoFocus
                  tabIndex={0}
                  aria-label="Buy More (Go to Home)"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Buy More
                  </div>
                </button>
                <button
                  onClick={handleTrackOrder}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
                  tabIndex={0}
                  aria-label="Track Order"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Track Order
                  </div>
                </button>
              </div>

              {/* Social Sharing */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-3">Share your Green Rescue achievement:</p>
                <div className="flex justify-center gap-3">
                  <button className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreenBuyNow;