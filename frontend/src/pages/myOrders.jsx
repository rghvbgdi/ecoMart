import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { status as checkAuthStatus } from '../apis/auth';
import { getGreenOrders } from '../apis/green';
import { getOrdersByUserId, getCancelledOrders, cancelOrder } from '../apis/orders';
import { getProductById } from '../apis/product';
import { Leaf, Package, Calendar, MapPin, Award, Zap, Recycle, TreePine, ShoppingBag, X, Phone, Navigation } from 'lucide-react';
import Cookies from 'js-cookie';

const MyOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [greenOrders, setGreenOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [greenProductMap, setGreenProductMap] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, green, normal, upcoming, past
  const [stats, setStats] = useState({
    totalOrders: 0,
    greenOrders: 0,
    totalCarbonSaved: 0,
    totalGreenCoins: 0,
    totalAmount: 0
  });
  const [userLocation, setUserLocation] = useState('Unknown');
  const [cancelledOrders, setCancelledOrders] = useState([]);

  useEffect(() => {
    setUserLocation(Cookies.get('user_location') || 'Unknown');
    const fetchOrders = async () => {
      try {
        const authRes = await checkAuthStatus();
        setUser(authRes.user);
        const userId = authRes.user.id || authRes.user._id;
        // Fetch all orders for this user (normal and green)
        const [allOrdersRes, greenOrdersRes, cancelledOrdersRes, allUserOrdersRes] = await Promise.all([
          fetch('/api/orders/user').then(res => res.json()),
          getGreenOrders(),
          getCancelledOrders(),
          getOrdersByUserId(userId)
        ]);
        // Filter out cancelled orders
        const cancelledIds = new Set(cancelledOrdersRes.map(o => o._id));
        // Normal orders: not green, not cancelled, and belong to user
        const normalOrders = allOrdersRes.filter(o =>
          !o.isGreenProduct &&
          !cancelledIds.has(o._id) &&
          (o.customerId === userId || o.customerId === authRes.user._id)
        );
        // Green orders: isGreenProduct, not cancelled, and belong to user
        const userGreenOrders = greenOrdersRes.filter(o =>
          !o.isCancelled &&
          (o.customerId === userId)
        );
        // Cancelled orders from getOrdersByUserId
        const cancelledOrders = allUserOrdersRes.filter(o => o.isCancelled);
        // Fetch product and green product details for green orders
        setDetailsLoading(true);
        const productIds = Array.from(new Set(userGreenOrders.map(o => o.product?.productId)));
        const productDetails = {};
        const greenProductDetails = {};
        await Promise.all(productIds.map(async (pid) => {
          if (!pid) return;
          try {
            const prod = await getProductById(pid);
            productDetails[pid] = prod;
          } catch {}
          try {
            const greenList = await getGreenProducts();
            const greenProd = greenList.find(gp => gp.productId && gp.productId._id === pid);
            if (greenProd) greenProductDetails[pid] = greenProd;
          } catch {}
        }));
        setProductDetailsMap(productDetails);
        setGreenProductMap(greenProductDetails);
        setDetailsLoading(false);
        // Set orders (no upcoming/past split)
        const allOrders = [...normalOrders, ...userGreenOrders, ...cancelledOrders];
        setOrders(allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setGreenOrders(userGreenOrders.map(o => o._id));
        // Use greenCoins and carbonFootprintSaved from user object (like navbar)
        setStats({
          totalOrders: allOrdersRes.length,
          greenOrders: userGreenOrders.length,
          totalCarbonSaved: authRes.user.carbonFootprintSaved || 0,
          totalGreenCoins: authRes.user.greenCoins || 0,
          totalAmount: (authRes.user.greenCoins || 0) * 20.4
        });
        // Store cancelled orders for filter
        setCancelledOrders(cancelledOrders);
      } catch (err) {
        setError('Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const isGreen = order.isGreenProduct;
    switch (filter) {
      case 'green': return isGreen && !order.isCancelled;
      case 'normal': return !isGreen && !order.isCancelled;
      case 'cancelled': return order.isCancelled;
      default: return !order.isCancelled;
    }
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-green-700 font-medium">Loading your sustainable journey...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="text-center text-red-600 bg-white p-8 rounded-2xl shadow-xl">
        <X className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <p className="text-lg font-semibold">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-full">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-green-700 font-medium">Your sustainable shopping journey</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="text-lg font-semibold text-gray-900">{user?.name || 'Eco Warrior'}</p>
              <p className="text-sm text-gray-600">in {userLocation}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <Package className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Green Orders</p>
                  <p className="text-2xl font-bold">{stats.greenOrders}</p>
                </div>
                <Leaf className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">CO₂ Saved</p>
                  <p className="text-2xl font-bold">{stats.totalCarbonSaved.toFixed(1)}<span className="text-sm">kg</span></p>
                </div>
                <TreePine className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Green Coins</p>
                  <p className="text-2xl font-bold">{stats.totalGreenCoins}</p>
                </div>
                <Award className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Amount Saved</p>
                  <p className="text-2xl font-bold">₹{stats.totalAmount.toFixed(0)}</p>
                </div>
                <Zap className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </div>

          {/* Impact Message */}
          {stats.totalCarbonSaved > 0 && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-full">
                  <Recycle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-green-800 font-semibold">
                    🌱 Amazing! You've saved <span className="font-bold">{stats.totalCarbonSaved.toFixed(1)} kg</span> of CO₂ with your green choices!
                  </p>
                  <p className="text-green-600 text-sm">That's equivalent to planting {Math.ceil(stats.totalCarbonSaved / 22)} trees! 🌳</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { key: 'all', label: 'All Orders', icon: Package },
              { key: 'green', label: 'Green Orders', icon: Leaf },
              { key: 'normal', label: 'Regular Orders', icon: ShoppingBag },
              { key: 'cancelled', label: 'Cancelled Orders', icon: X }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  filter === key
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No orders found for this filter.</p>
              <p className="text-gray-400 text-sm mt-2">Try selecting a different filter or place your first order!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {detailsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-green-600">Loading product details...</div>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const isGreen = order.isGreenProduct;
                  let product = null, greenProduct = null;
                  if (isGreen && order.product?.productId) {
                    product = productDetailsMap[order.product.productId];
                    greenProduct = greenProductMap[order.product.productId];
                  } else if (order.product?.productId) {
                    product = order.product.productId;
                  }
                  // For green orders, always use productDetailsMap for product info
                  if (isGreen && order.product?.productId) {
                    product = productDetailsMap[order.product.productId];
                  }
                  return (
                    <div
                      key={order._id}
                      className={`relative overflow-hidden rounded-2xl shadow-lg transition-all hover:shadow-xl ${
                        order.isCancelled
                          ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 opacity-70'
                          : isGreen 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200'
                      }`}
                    >
                      {/* Cancelled Badge */}
                      {order.isCancelled && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 z-10 shadow-lg">
                          <X className="w-4 h-4" />
                          CANCELLED
                        </div>
                      )}
                      {/* Green Badge - Creative placement */}
                      {!order.isCancelled && isGreen && (
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 z-10 shadow-lg transform rotate-12">
                          <Leaf className="w-4 h-4" />
                          🌱 ECO
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start gap-6">
                          {/* Product Image */}
                          <div className="relative">
                            <img
                              src={product?.imageUrl || '/api/placeholder/150/150'}
                              alt={product?.name || 'Product'}
                              className="w-24 h-24 object-cover rounded-2xl border-2 border-white shadow-lg"
                            />
                            {isGreen && (
                              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                                <Leaf className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Order Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{product?.name || 'Product Name'}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <span className="flex items-center gap-1">
                                    <Package className="w-4 h-4" />
                                    {product?.category || 'Category'}
                                  </span>
                                  <span className="flex items-center gap-1 font-semibold text-green-600">
                                    ₹{product?.price || '0'}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{product?.description || 'No description available'}</p>
                                
                                {/* Order Info */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>Shipping to: {order.shippingAddress || 'Address not provided'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                {/* Track Order Button */}
                                {!order.isCancelled && (
                                  <button
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 w-full justify-center"
                                    onClick={() => navigate(`/track/${order._id}`)}
                                  >
                                    <Navigation className="w-4 h-4" />
                                    Track Order
                                  </button>
                                )}
                                
                                {!order.isCancelled && (
                                  isGreen ? (
                                    <button
                                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 w-full justify-center"
                                      disabled
                                    >
                                      <Phone className="w-4 h-4" />
                                      Contact Support
                                    </button>
                                  ) : (
                                    <button
                                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 w-full justify-center"
                                      onClick={async () => {
                                        if (confirm('Are you sure you want to cancel this order?')) {
                                          try {
                                            await cancelOrder(order._id);
                                            window.location.reload();
                                          } catch (err) {
                                            alert('Failed to cancel order. Please try again.');
                                          }
                                        }
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                      Cancel Order
                                    </button>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Green Product Benefits */}
                            {isGreen && greenProductMap[order.product?.productId] && (
                              <div className="mt-4 p-4 bg-white rounded-xl border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                  <Leaf className="w-5 h-5" />
                                  Environmental Impact
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full">
                                      <Award className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Green Coins Earned</p>
                                      <p className="font-bold text-green-700">{greenProductMap[order.product?.productId].greenCoins || 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="bg-emerald-100 p-2 rounded-full">
                                      <TreePine className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">CO₂ Footprint Reduced</p>
                                      <p className="font-bold text-emerald-700">{greenProductMap[order.product?.productId].carbonFootprint || 'N/A'} kg</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;