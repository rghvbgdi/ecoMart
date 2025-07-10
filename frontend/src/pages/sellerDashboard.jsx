import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../apis/product';
import { status as checkAuthStatus, logout as logoutAPI } from '../apis/auth';
  // NEW (correct)
  import { getCancelledOrders } from '../apis/orders';
  import { getGreenOrders } from '../apis/green';
  import { getSoldGreenProducts } from '../apis/green';
  import { getSoldProducts } from '../apis/product';

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
          // Fetch cancelled and green orders
          const [cancelled, green, soldGreen, soldNormal] = await Promise.all([
            getCancelledOrders(),
            getGreenOrders(),
            getSoldGreenProducts(),
            getSoldProducts()
          ]);
          setCancelledOrders(cancelled);
          setGreenOrders(green);
          setSoldGreenProducts(soldGreen);
          setSoldNormalProducts(soldNormal);
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
    { label: 'Total Products', value: sellerProducts.length, color: 'bg-emerald-500', icon: '📦' },
    { label: 'Green Orders', value: greenOrders.length, color: 'bg-green-500', icon: '🌱' },
    { label: 'Cancelled Orders', value: cancelledOrders.length, color: 'bg-red-500', icon: '❌' },
    { label: 'Active Listings', value: sellerProducts.filter(p => p.isGreenDeal).length, color: 'bg-blue-500', icon: '⚡' }
  ];

  const handleLogout = async () => {
    try {
      await logoutAPI();
      navigate('/login');
    } catch (err) {
      alert('Logout failed. Please try again.');
    }
  };

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
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- Sustainability Highlights Section --- */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <span>🌱 Sustainability Highlights</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center">
              <span className="text-4xl">🪴</span>
              <div className="text-lg font-semibold text-green-800 mt-2">CO₂ Saved</div>
              <div className="text-2xl font-bold text-green-700">{greenStats.co2} kg</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center">
              <span className="text-4xl">🪙</span>
              <div className="text-lg font-semibold text-green-800 mt-2">Green Coins Earned</div>
              <div className="text-2xl font-bold text-green-700">{greenStats.coins}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center">
              <span className="text-4xl">💸</span>
              <div className="text-lg font-semibold text-green-800 mt-2">Green Revenue</div>
              <div className="text-2xl font-bold text-green-700">₹{greenStats.revenue}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center">
              <span className="text-4xl">🌿</span>
              <div className="text-lg font-semibold text-green-800 mt-2">Green Products Sold</div>
              <div className="text-2xl font-bold text-green-700">{soldGreenProducts.length}</div>
            </div>
          </div>
        </div>
        {/* --- End Sustainability Highlights --- */}

        {/* --- Normal Sales Section --- */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span>🛒 Normal Sales</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center">
              <span className="text-3xl">📦</span>
              <div className="text-lg font-semibold text-slate-800 mt-2">Normal Products Sold</div>
              <div className="text-2xl font-bold text-slate-700">{normalStats.count}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center">
              <span className="text-3xl">💰</span>
              <div className="text-lg font-semibold text-slate-800 mt-2">Normal Revenue</div>
              <div className="text-2xl font-bold text-slate-700">₹{normalStats.revenue}</div>
            </div>
          </div>
          {/* List normal sold products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {soldNormalProducts.map(product => (
              <div key={product._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="font-semibold text-slate-800 mb-1">{product.name}</div>
                <div className="text-slate-500 text-sm mb-1">Category: {product.category}</div>
                <div className="text-slate-700 font-bold">₹{product.price}</div>
                <div className="text-xs text-slate-400 mt-1">ID: {product._id.slice(-8)}</div>
              </div>
            ))}
          </div>
        </div>
        {/* --- End Normal Sales Section --- */}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Cancelled Orders */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
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
                  <div key={order._id} className="bg-red-50 border border-red-100 rounded-xl p-4 hover:bg-red-100 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-red-800 text-sm">#{order._id.slice(-8)}</span>
                      <span className="text-xs text-slate-500">{order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded-md inline-block mr-2">
                        {order.product?.productId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Green Orders */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
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
                  <div key={order._id} className="bg-green-50 border border-green-100 rounded-xl p-4 hover:bg-green-100 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-green-800 text-sm">#{order._id.slice(-8)}</span>
                      <span className="text-xs text-slate-500">
                        Expires: {order.greenOrder?.expiresAt ? new Date(order.greenOrder.expiresAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-md inline-block mr-2">
                        {order.product?.productId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
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

          {sellerProducts.length === 0 ? (
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
              {sellerProducts.map(product => (
                <div key={product._id} className="group bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="relative">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.isGreenDeal && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                          🌱 Green Deal
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {product.category}
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        ₹{product.price}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      ID: {product._id.slice(-8)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;