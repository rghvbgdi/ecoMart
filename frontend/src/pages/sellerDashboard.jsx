import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../apis/product';
import { status as checkAuthStatus, logout as logoutAPI } from '../apis/auth';
  // NEW (correct)
  import { getCancelledOrders } from '../apis/orders';
  import { getGreenOrders } from '../apis/green';
  import { getNormalOrders } from '../apis/orders';
  import { getSoldGreenProducts } from '../apis/green';
  import { getSoldProducts } from '../apis/product';
 
import { CheckCircle, Leaf, XCircle, HelpCircle } from 'lucide-react';

const SellerDashboard = () => {
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [greenOrders, setGreenOrders] = useState([]);
  const [soldGreenProducts, setSoldGreenProducts] = useState([]);
  const [soldNormalProducts, setSoldNormalProducts] = useState([]);
  const [greenStats, setGreenStats] = useState({ co2: 0, coins: 0, revenue: 0 });
  const [normalStats, setNormalStats] = useState({ count: 0, revenue: 0 });
  const [activeNormalOrders, setActiveNormalOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check login status and role
        const authResponse = await checkAuthStatus();
        if (authResponse.user && authResponse.user.role === 'seller') {
          setIsSeller(true);
          // Fetch all products
          const allProducts = await getAllProducts();
          setSellerProducts(allProducts);
          // Fetch cancelled, green, sold green, sold normal, and normal orders
          const [cancelled, green, soldGreen, soldNormal, normalOrders] = await Promise.all([
            getCancelledOrders(),
            getGreenOrders(),
            getSoldGreenProducts(),
            getSoldProducts(),
            getNormalOrders()
          ]);
          setCancelledOrders(cancelled);
          setGreenOrders(green);
          setSoldGreenProducts(soldGreen);
          setSoldNormalProducts(soldNormal);
          setActiveNormalOrders(normalOrders);
          // Calculate green stats
          let co2 = 0, coins = 0, greenRevenue = 0;
          soldGreen.forEach(gp => {
            co2 += gp.carbonFootprint || 0;
            coins += gp.greenCoins || 0;
            greenRevenue += gp.productId?.price || 0;
          });
          setGreenStats({ co2, coins, revenue: greenRevenue });
          // Calculate normal stats
          let normalRevenue = 0;
          soldNormal.forEach(p => { normalRevenue += p.price || 0; });
          setNormalStats({ count: soldNormal.length, revenue: normalRevenue });
        } else {
          setError('Access Denied: You must be a seller to view this page.');
          navigate('/login');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch seller data.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-emerald-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-red-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Access Error</h3>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-amber-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-2v-2m0 0V9m0 2h2m-2 0H8" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h3>
            <p className="text-slate-600">You do not have seller privileges.</p>
          </div>
        </div>
      </div>
    );
  }

  const statsData = [
    { label: 'Total Products', value: sellerProducts.length, color: 'bg-gradient-to-br from-emerald-500 to-teal-600', icon: '📦' },
    { label: 'Green Orders', value: greenOrders.length, color: 'bg-gradient-to-br from-green-500 to-emerald-600', icon: '🌱' },
    { label: 'Cancelled Orders', value: cancelledOrders.length, color: 'bg-gradient-to-br from-red-500 to-pink-600', icon: '❌' },
    { label: 'Normal Orders', value: activeNormalOrders.length, color: 'bg-gradient-to-br from-blue-500 to-indigo-600', icon: '⚡' }
  ];

  const handleLogout = async () => {
    try {
      await logoutAPI();
      navigate('/login');
    } catch (err) {
      alert('Logout failed. Please try again.');
    }
  };

  // Before rendering the product grid, sort sellerProducts by status
  const sortedSellerProducts = [...sellerProducts].sort((a, b) => {
    // Helper to get status rank: 0 = green rescue, 1 = sold, 2 = unsold
    const getStatusRank = (product) => {
      const isSoldNormal = soldNormalProducts.some(p => p._id === product._id);
      const isSoldGreen = soldGreenProducts.some(gp => gp.productId && gp.productId._id === product._id);
      if (isSoldGreen) return 0;
      if (isSoldNormal) return 1;
      return 2;
    };
    return getStatusRank(a) - getStatusRank(b);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Seller Dashboard
              </h1>
              <p className="text-slate-600 mt-1">Manage your products and track your business</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/add-product')}
                className="flex items-center gap-2 px-6 py-3 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-base"
                style={{ minWidth: '140px' }}
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Product</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-base"
                style={{ minWidth: '140px' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsData.map((stat, index) => (
            <div key={index} className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-white/80">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- Sustainability Highlights Section --- */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2 justify-center">
            <span>🌱 Sustainability Highlights</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
            {[
              { emoji: '🪴', label: 'CO₂ Saved', value: `${greenStats.co2} kg` },
              { emoji: '🪙', label: 'Green Coins Earned', value: greenStats.coins },
              { emoji: '💸', label: 'Green Revenue', value: `₹${greenStats.revenue}` },
              { emoji: '🌿', label: 'Green Products Sold', value: soldGreenProducts.length }
            ].map((item, index) => (
              <div key={index} className="group relative flex flex-col items-center justify-center p-8 rounded-3xl shadow-2xl border border-green-200/40 bg-white/30 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-green-200/80" style={{ minHeight: '180px' }}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-200/40 via-white/10 to-emerald-100/30 opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-5xl mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
                  <div className="text-lg font-semibold text-green-900 mb-1 text-center drop-shadow-sm">{item.label}</div>
                  <div className="text-3xl font-extrabold text-green-700 text-center drop-shadow-md">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* --- End Sustainability Highlights --- */}

        {/* --- Normal Sales Section --- */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2 justify-center">
            <span>🛒 Normal Sales</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
            {[
              { emoji: '📦', label: 'Normal Products Sold', value: normalStats.count },
              { emoji: '💰', label: 'Normal Revenue', value: `₹${normalStats.revenue}` }
            ].map((item, index) => (
              <div key={index} className="group relative flex flex-col items-center justify-center p-8 rounded-3xl shadow-2xl border border-blue-200/40 bg-white/30 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-200/80" style={{ minHeight: '180px' }}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-200/40 via-white/10 to-indigo-100/30 opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-5xl mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
                  <div className="text-lg font-semibold text-blue-900 mb-1 text-center drop-shadow-sm">{item.label}</div>
                  <div className="text-3xl font-extrabold text-blue-700 text-center drop-shadow-md">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* --- End Normal Sales Section --- */}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Cancelled Orders */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Cancelled Orders</h2>
                <p className="text-slate-600 text-sm">Recent order cancellations</p>
              </div>
            </div>
            
            {cancelledOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-500">No cancelled orders</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cancelledOrders.map(order => (
                  <div key={order._id} className="group relative bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50 rounded-2xl p-4 hover:shadow-md transition-all duration-300 transform hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-100/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-red-800 text-sm">#{order._id.slice(-8)}</span>
                        <span className="text-xs text-slate-500">{order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : '-'}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-red-700 bg-red-100/70 px-2 py-1 rounded-lg inline-block mr-2">
                          {order.product?.productId}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Green Orders */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Green Orders</h2>
                <p className="text-slate-600 text-sm">Eco-friendly deals</p>
              </div>
            </div>
            
            {greenOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-slate-500">No green orders yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {greenOrders.map(order => (
                  <div key={order._id} className="group relative bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 rounded-2xl p-4 hover:shadow-md transition-all duration-300 transform hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-800 text-sm">#{order._id.slice(-8)}</span>
                        <span className="text-xs text-slate-500">
                          Expires: {order.greenOrder?.expiresAt ? new Date(order.greenOrder.expiresAt).toLocaleDateString() : '-'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-green-700 bg-green-100/70 px-2 py-1 rounded-lg inline-block mr-2">
                          {order.product?.productId}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-800">Your Products</h2>
                <p className="text-slate-600 text-sm">Manage your product inventory</p>
              </div>
            </div>
          </div>

          {/* Product Status Legend */}
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-slate-200/50"><CheckCircle className="w-4 h-4 text-green-600" /> <span className="text-sm font-medium">Sold (Normal)</span></div>
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-slate-200/50"><HelpCircle className="w-4 h-4 text-gray-400" /> <span className="text-sm font-medium">Unsold</span></div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-lime-100 to-green-100 px-3 py-1 rounded-full border border-green-300/50"><span className="text-lg">♻️</span> <span className="text-sm font-semibold text-green-800">Saved from Loss! (Green Rescue)</span></div>
          </div>

          {sortedSellerProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Products Yet</h3>
              <p className="text-slate-600 mb-6">Start building your inventory by adding your first product</p>
              <button
                onClick={() => navigate('/add-product')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {sortedSellerProducts.map(product => {
                // Determine product status
                const isSoldNormal = soldNormalProducts.some(p => p._id === product._id);
                const isSoldGreen = soldGreenProducts.some(gp => gp.productId && gp.productId._id === product._id);
                let statusIcon = null;
                let statusLabel = '';
                let cardClass = 'group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105';
                let highlightBanner = null;
                
                if (isSoldNormal) {
                  statusIcon = <CheckCircle className="w-4 h-4 text-green-600" title="Sold (Normal)" />;
                  statusLabel = 'Sold';
                  cardClass = 'group relative bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-50 border-2 border-blue-300/50 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105';
                  highlightBanner = (
                    <div className="absolute top-0 left-0 w-full flex items-center justify-center bg-gradient-to-r from-blue-400/80 to-indigo-400/80 backdrop-blur-sm py-2 z-20 shadow-md">
                      <span className="text-white font-bold text-sm flex items-center gap-1">✅ Sold</span>
                    </div>
                  );
                } else if (isSoldGreen) {
                  statusIcon = <Leaf className="w-4 h-4 text-emerald-600" title="Green Rescue" />;
                  statusLabel = 'Green Rescue';
                  cardClass = 'group relative bg-gradient-to-br from-lime-50 via-green-100/50 to-yellow-50 border-2 border-green-300/50 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105';
                  highlightBanner = (
                    <div className="absolute top-0 left-0 w-full flex items-center justify-center bg-gradient-to-r from-lime-400/80 to-green-400/80 backdrop-blur-sm py-2 z-20 shadow-md">
                      <span className="text-white font-bold text-sm flex items-center gap-1">♻️ Saved from Loss! Green Rescue</span>
                    </div>
                  );
                } else {
                  statusIcon = <HelpCircle className="w-4 h-4 text-gray-400" title="Unsold" />;
                  statusLabel = 'Unsold';
                }

                return (
                  <div key={product._id} className={cardClass}>
                    <div className="relative">
                      {highlightBanner}
                      <div className="relative overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-slate-200/50">
                        {statusIcon}
                        <span className="text-xs font-semibold text-slate-700">{statusLabel}</span>
                      </div>
                      
                      {/* Green Deal Badge */}
                      {product.isGreenDeal && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <span>🌱</span>
                            <span>Green Deal</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Hover Actions - removed edit and view buttons */}
                      {/* <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <button className="flex-1 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="flex-1 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div> */}
                      {/* Show carbon saved for green products */}
                      {isSoldGreen && (
                        <div className="absolute bottom-2 right-3 bg-green-100/80 text-green-700 text-[10px] px-2 py-0.5 rounded-full shadow-sm font-semibold z-20">
                          {(() => {
                            const greenProduct = soldGreenProducts.find(gp => gp.productId && gp.productId._id === product._id);
                            return greenProduct && greenProduct.carbonFootprint ? `${greenProduct.carbonFootprint}kg CO₂ saved` : '';
                          })()}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 leading-tight text-sm group-hover:text-slate-900 transition-colors duration-200">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md font-medium">
                          {product.category}
                        </span>
                        <span className="text-lg font-bold text-emerald-600">
                          ₹{product.price?.toLocaleString()}
                        </span>
                      </div>
                      {/* Additional Product Info - removed date, stock, and rating */}
                      {/* <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs text-slate-600 font-medium">4.5</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Stock: {product.stock || 'N/A'}
                        </span>
                      </div> */}
                      {/* <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">
                          #{product._id.slice(-8)}
                        </p>
                        <span className="text-xs text-slate-500">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div> */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">
                          #{product._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;