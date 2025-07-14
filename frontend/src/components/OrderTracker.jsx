import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../apis/product';
import { getGreenOrders } from '../apis/green';
import { getOrdersByUserId } from '../apis/orders';
import { status as checkAuthStatus } from '../apis/auth';
import { getGreenProductById } from '../apis/green';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const OrderTracker = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [riderLocation, setRiderLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchOrderData = async () => {
      try {
        const authRes = await checkAuthStatus();
        setUser(authRes.user);

        let foundOrder = null;
        let isGreenOrder = false;

        try {
          const greenOrders = await getGreenOrders();
          foundOrder = greenOrders.find(o => o._id === orderId);
          if (foundOrder) {
            isGreenOrder = true;
          }
        } catch (err) {
          console.log('Not a green order, checking normal orders...');
        }

        if (!foundOrder) {
          try {
            const normalOrders = await getOrdersByUserId(authRes.user.id || authRes.user._id);
            foundOrder = normalOrders.find(o => o._id === orderId);
          } catch (err) {
            console.log('Error fetching normal orders:', err);
          }
        }

        if (!foundOrder) {
          throw new Error('Order not found');
        }

        setOrder(foundOrder);
        const productData = await getProductById(foundOrder.productId);
        setProduct(productData);

        let originCoords;
        if (isGreenOrder) {
          const greenProduct = await getGreenProductById(foundOrder.productId);
          if (greenProduct && greenProduct.warehouseLocation) {
            originCoords = {
              lat: greenProduct.warehouseLocation.latitude,
              lng: greenProduct.warehouseLocation.longitude,
              name: 'Warehouse'
            };
          } else {
            originCoords = { lat: 19.0760, lng: 72.8777, name: 'Warehouse - Mumbai' };
          }
        } else {
          const coords = await geocodeAddress(productData.origin);
          originCoords = {
            lat: coords?.lat || 20.5937,
            lng: coords?.lng || 78.9629,
            name: `Origin - ${productData.origin}`
          };
        }
        setRiderLocation(originCoords);

        if (foundOrder.shippingAddress) {
          const coords = await geocodeAddress(foundOrder.shippingAddress);
          setDestinationCoords(coords);
        } else {
          setDestinationCoords(null);
        }

        // Force map re-render
        setMapKey(prev => prev + 1);

      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Auto-zoom and center map based on distance and midpoint
  useEffect(() => {
    if (mapRef.current && riderLocation && destinationCoords) {
      const map = mapRef.current;
      const lat1 = riderLocation.lat, lng1 = riderLocation.lng;
      const lat2 = destinationCoords.lat, lng2 = destinationCoords.lng;
      const distance = getDistanceKm(lat1, lng1, lat2, lng2);
      const center = [(lat1 + lat2) / 2, (lng1 + lng2) / 2];
      let zoom = 8;
      if (distance > 10000) zoom = 2;
      else if (distance > 5000) zoom = 3;
      else if (distance > 2000) zoom = 4;
      else if (distance > 1000) zoom = 5;
      else if (distance > 500) zoom = 6;
      else if (distance > 200) zoom = 7;
      map.setView(center, zoom, { animate: true });
    }
  }, [riderLocation, destinationCoords, mapRef]);

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  };

  const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getBounds = (lat1, lng1, lat2, lng2) => {
    const minLat = Math.min(lat1, lat2);
    const maxLat = Math.max(lat1, lat2);
    const minLng = Math.min(lng1, lng2);
    const maxLng = Math.max(lng1, lng2);
    
    const padding = 2; // degrees
    return [
      [minLat - padding, minLng - padding],
      [maxLat + padding, maxLng + padding]
    ];
  };

  const getOrderStatus = () => {
    if (!order) return { currentStep: 0, steps: [] };
    
    const steps = ['Order Placed', 'Processing', 'Out for Delivery', 'Delivered'];
    let currentStep = 0;

    if (order.status === 'cancelled') {
      return { currentStep: 0, steps: ['Order Cancelled'] };
    }

    switch (order.status) {
      case 'pending':
        currentStep = 0;
        break;
      case 'packed':
        currentStep = 1;
        break;
      case 'shipped':
        currentStep = 2;
        break;
      case 'delivered':
        currentStep = 3;
        break;
      default:
        currentStep = 0;
    }

    return { currentStep, steps };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'packed': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return '🎉';
      case 'shipped': return '🚚';
      case 'packed': return '📦';
      case 'cancelled': return '❌';
      default: return '🔄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600 text-2xl">📦</span>
            </div>
          </div>
          <p className="text-blue-700 font-semibold mt-4 text-lg">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-8 max-w-md border border-red-100">
          <div className="text-red-500 text-7xl mb-4">😔</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">Order Not Found</h2>
          <p className="text-red-500 mb-6 text-lg">{error || 'The order you\'re looking for doesn\'t exist.'}</p>
          <button 
            onClick={() => navigate('/myOrders')}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const { currentStep, steps } = getOrderStatus();
  const distance = riderLocation && destinationCoords 
    ? getDistanceKm(riderLocation.lat, riderLocation.lng, destinationCoords.lat, destinationCoords.lng)
    : 0;

  const pickupIcon = L.divIcon({
    html: `<div style="background: #10b981; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">📦</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const deliveryIcon = L.divIcon({
    html: `<div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">🏠</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Order Tracker
            </h1>
            <p className="text-gray-600 text-lg">Real-time tracking for your delivery</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Status Banner */}
        <div className={`${getStatusColor(order.status)} rounded-2xl p-6 mb-8 text-white shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getStatusIcon(order.status)}</div>
              <div>
                <h2 className="text-2xl font-bold">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </h2>
                <p className="text-white/90">Order #{order._id.slice(-8)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/90 text-sm">Order Total</p>
              <p className="text-2xl font-bold">₹{product.price.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                  {product.origin}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">Premium quality product</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">Quantity: 1</span>
                </div>
              </div>
            </div>

            {/* Route Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Route Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">📦</div>
                  <div>
                    <p className="font-semibold text-gray-800">Pickup Location</p>
                    <p className="text-sm text-gray-600">{riderLocation?.name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="border-l-2 border-dashed border-gray-300 h-8"></div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🏠</div>
                  <div>
                    <p className="font-semibold text-gray-800">Delivery Address</p>
                    <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>

              {distance > 0 && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-800 font-semibold">Total Distance</span>
                    <span className="text-purple-600 font-bold">{distance.toFixed(0)} km</span>
                  </div>
                </div>
              )}
            </div>

            {/* Order Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Delivery Progress</h3>
              
              {order.status === 'cancelled' ? (
                <div className="text-center py-8">
                  <div className="text-red-500 text-6xl mb-4">❌</div>
                  <h4 className="text-xl font-bold text-red-600 mb-2">Order Cancelled</h4>
                  <p className="text-red-500">This order has been cancelled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, idx) => (
                    <div key={step} className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                        idx <= currentStep ? 'bg-green-500 shadow-lg' : 'bg-gray-300'
                      }`}>
                        {idx <= currentStep ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold transition-colors duration-300 ${
                          idx <= currentStep ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step}
                        </p>
                        <div className={`w-full h-1 rounded-full mt-2 ${
                          idx <= currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            {riderLocation && destinationCoords && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Live Tracking Map</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span>Pickup Location</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span>Delivery Address</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-96 relative">
                  <MapContainer
                    key={mapKey}
                    style={{ width: '100%', height: '100%' }}
                    scrollWheelZoom={true}
                    center={[(riderLocation.lat + destinationCoords.lat) / 2, (riderLocation.lng + destinationCoords.lng) / 2]}
                    zoom={8}
                    minZoom={2}
                    maxZoom={18}
                    ref={mapRef}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    <Marker position={[riderLocation.lat, riderLocation.lng]} icon={pickupIcon}>
                      <Popup>
                        <div className="text-center p-2">
                          <div className="font-bold text-green-600 mb-1">📦 Pickup Location</div>
                          <div className="text-sm text-gray-600">{riderLocation.name}</div>
                        </div>
                      </Popup>
                    </Marker>
                    
                    <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={deliveryIcon}>
                      <Popup>
                        <div className="text-center p-2">
                          <div className="font-bold text-red-600 mb-1">🏠 Delivery Address</div>
                          <div className="text-sm text-gray-600">{order.shippingAddress}</div>
                        </div>
                      </Popup>
                    </Marker>
                    
                    <Polyline 
                      positions={[
                        [riderLocation.lat, riderLocation.lng], 
                        [destinationCoords.lat, destinationCoords.lng]
                      ]} 
                      color="#3b82f6" 
                      weight={3}
                      opacity={0.8}
                      dashArray="10, 10"
                    />
                  </MapContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <button 
            onClick={() => navigate('/myOrders')}
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ← Back to Orders
          </button>
          <button 
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📞 Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;