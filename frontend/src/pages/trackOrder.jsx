import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  Circle, 
  ArrowRight,
  Leaf,
  Navigation,
  Phone,
  Calendar
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getOrderById } from '../apis/orders';
import { getGreenOrderById, getGreenProductById } from '../apis/green';
import { getProductById } from '../apis/product';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for pickup and delivery
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [greenProduct, setGreenProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(3); // Fixed at step 3 (Out for Delivery)
  const [deliveryProgress, setDeliveryProgress] = useState(56); // Fixed at 56%
  const [pickupLocation, setPickupLocation] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Try to fetch the order directly by ID from both normal and green orders
        let foundOrder = null;
        let isGreenOrder = false;

        // First try to get it as a normal order
        try {
          foundOrder = await getOrderById(orderId);
          
          // Check if this order is actually a green order
          if (foundOrder && foundOrder.isGreenProduct) {
            isGreenOrder = true;
          }
        } catch (error) {
          // Not a normal order, continue to try green order
        }

        // If not found as normal order, try as green order
        if (!foundOrder) {
          try {
            foundOrder = await getGreenOrderById(orderId);
            isGreenOrder = true;
          } catch (error) {
            // Order not found in either collection
          }
        }

        if (foundOrder) {
          // Add isGreenProduct flag for green orders
          if (isGreenOrder) {
            foundOrder.isGreenProduct = true;
          }
          
          setOrder(foundOrder);
          
          // Fetch additional product details based on order type
          await fetchProductDetails(foundOrder, isGreenOrder);
          
          // Simulate delivery progress
          simulateDeliveryProgress();
        } else {
          alert('Order not found!');
          navigate('/myorders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        alert('Failed to load order details');
        navigate('/myorders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const getOriginCoordinates = (origin) => {
    const originMap = {
      'USA': { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
      'China': { lat: 39.9042, lng: 116.4074, name: 'Beijing, China' },
      'Germany': { lat: 52.5200, lng: 13.4050, name: 'Berlin, Germany' },
      'Japan': { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' },
      'UK': { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
      'France': { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
      'Italy': { lat: 41.9028, lng: 12.4964, name: 'Rome, Italy' },
      'Canada': { lat: 45.4215, lng: -75.6972, name: 'Ottawa, Canada' },
      'Australia': { lat: -35.2809, lng: 149.1300, name: 'Canberra, Australia' },
      'Brazil': { lat: -15.7801, lng: -47.9292, name: 'Brasília, Brazil' },
      'India': { lat: 20.5937, lng: 78.9629, name: 'India' }
    };
    
    return originMap[origin] || { lat: 20.5937, lng: 78.9629, name: origin || 'Unknown Origin' };
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Calculate appropriate zoom level based on distance
  const calculateZoomLevel = (distance) => {
    if (distance < 10) return 12; // Very close - city level
    if (distance < 50) return 10; // Close - regional level
    if (distance < 200) return 8; // Medium - state level
    if (distance < 1000) return 6; // Far - country level
    return 4; // Very far - continent level
  };

  const getUserLocationCoordinates = async (userLocation) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userLocation)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: userLocation
        };
      }
    } catch (error) {
      console.error('Error geocoding user location:', error);
    }
    
    // Fallback coordinates for common Indian cities
    const cityMap = {
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 }
    };
    
    // Try to match user location with known cities
    for (const [city, coords] of Object.entries(cityMap)) {
      if (userLocation.toLowerCase().includes(city.toLowerCase())) {
        return { ...coords, name: city };
      }
    }
    
    // Default to Mumbai if no match
    return { lat: 19.0760, lng: 72.8777, name: userLocation || 'Unknown Location' };
  };

  const fetchProductDetails = async (order, isGreenOrder) => {
    try {
      // Handle both populated and unpopulated product data
      let productId;
      if (typeof order.product?.productId === 'object' && order.product?.productId?._id) {
        // If productId is populated (object), use its _id
        productId = order.product.productId._id;
      } else if (typeof order.product?.productId === 'string') {
        // If productId is a string, use it directly
        productId = order.product.productId;
      } else {
        console.error('Invalid product ID format:', order.product?.productId);
        return;
      }
      
      // Get the original product details (works for both normal and green orders)
      try {
        const productData = await getProductById(productId);
        setProduct(productData);
        
        // Set pickup location based on order type
        if (isGreenOrder) {
          // For green orders: use warehouse location
          setPickupLocation({
            lat: 28.6139,
            lng: 77.2090,
            name: 'EcoMart Warehouse, Delhi'
          });
        } else {
          // For normal orders: use product origin
          const originCoords = getOriginCoordinates(productData.origin);
          setPickupLocation({
            lat: originCoords.lat,
            lng: originCoords.lng,
            name: `Distribution Center, ${originCoords.name}`
          });
        }
        
        // Set delivery location
        const deliveryAddress = order.shippingAddress || order.address || order.deliveryAddress || 'Mumbai, India';
        const deliveryCoords = await getUserLocationCoordinates(deliveryAddress);
        setDeliveryLocation({
          lat: deliveryCoords.lat,
          lng: deliveryCoords.lng,
          name: deliveryAddress
        });
        
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
      
      // For green orders, set a default warehouse location
      if (isGreenOrder) {
        setGreenProduct({
          warehouseLocation: {
            latitude: 28.6139,
            longitude: 77.2090
          }
        });
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const simulateDeliveryProgress = () => {
    // Keep progress fixed at 56% (Out for Delivery)
    setDeliveryProgress(56);
    setCurrentStep(3);
  };

  const getOriginAddress = () => {
    if (order?.isGreenProduct && greenProduct) {
      // For green orders: use warehouse location from green product
      const warehouse = greenProduct.warehouseLocation;
      if (warehouse) {
        return `EcoMart Warehouse, ${warehouse.latitude.toFixed(4)}, ${warehouse.longitude.toFixed(4)}`;
      }
      return "EcoMart Warehouse, Green Zone, Mumbai";
    } else if (product) {
      // For normal orders: use product origin
      return `EcoMart Distribution Center, ${product.origin}`;
    }
    return "EcoMart Distribution Center, Mumbai"; // Fallback
  };

  const getDeliverySteps = () => {
    const originLocation = getOriginAddress();
    const steps = [
      {
        id: 1,
        title: order?.isGreenProduct ? "Order Confirmed" : "Order Placed",
        description: order?.isGreenProduct 
          ? "Your green order has been confirmed and is being prepared at our eco-friendly warehouse"
          : "Your order has been placed and is being processed",
        icon: CheckCircle,
        completed: currentStep >= 1
      },
      {
        id: 2,
        title: order?.isGreenProduct ? "Warehouse Processing" : "Processing",
        description: order?.isGreenProduct
          ? "Your order is being carefully packaged with eco-friendly materials"
          : "Your order is being prepared and packaged",
        icon: Package,
        completed: currentStep >= 2
      },
      {
        id: 3,
        title: "Out for Delivery",
        description: order?.isGreenProduct
          ? `Our eco-friendly delivery partner is on the way from ${originLocation}`
          : `Our delivery partner is on the way from ${originLocation}`,
        icon: Truck,
        completed: currentStep >= 3
      },
      {
        id: 4,
        title: "Delivered",
        description: "Your order has been successfully delivered to your address",
        icon: CheckCircle,
        completed: currentStep >= 4
      }
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/myorders')}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Column - Product Details and Progress */}
          <div className="lg:col-span-2 space-y-4">
            
        {/* Order Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-4"
        >
              <div className="flex items-start gap-3">
                {/* Product Image */}
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {product?.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-green-600" />
                  )}
            </div>
                
            <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-base font-bold text-gray-900">
                {product?.name || order.product?.productId?.name || 'Product Name'}
              </h2>
                    {order.isGreenProduct && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        🌱 Green
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600 mb-2">
                <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                  <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>Order #{order._id.slice(-8)}</span>
                </div>
                <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">₹{product?.price || order.product?.productId?.price || '0'}</span>
                      {order.isGreenProduct && greenProduct?.greenCoins && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          🪙 {greenProduct.greenCoins} Green Coins
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  {product && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-1 font-medium">{product.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Origin:</span>
                          <span className="ml-1 font-medium">{product.origin}</span>
                        </div>
                        {product.description && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Description:</span>
                            <span className="ml-1 font-medium line-clamp-2">{product.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Green Product Benefits */}
                  {order.isGreenProduct && greenProduct && (
                    <div className="mt-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200">
                      <h4 className="text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        Environmental Benefits
                      </h4>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {greenProduct.carbonFootprint && (
                          <div className="flex items-center gap-1">
                            <span className="text-green-600">🌱</span>
                            <span className="text-gray-600">CO₂ Saved:</span>
                            <span className="font-medium text-green-700">{greenProduct.carbonFootprint} kg</span>
                          </div>
                        )}
                        {greenProduct.greenCoins && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-600">🪙</span>
                            <span className="text-gray-600">Green Coins:</span>
                            <span className="font-medium text-yellow-700">{greenProduct.greenCoins}</span>
                          </div>
                        )}
                        {greenProduct.warehouseLocation && (
                          <div className="flex items-center gap-1 col-span-2">
                            <span className="text-blue-600">🏢</span>
                            <span className="text-gray-600">Warehouse:</span>
                            <span className="font-medium text-blue-700">Delhi Eco-Mart</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Normal Product Details */}
                  {!order.isGreenProduct && product && (
                    <div className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
                      <h4 className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Product Details
                      </h4>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600">📦</span>
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium text-blue-700">Standard</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600">🚚</span>
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-medium text-blue-700">Express</span>
                        </div>
                        {product.origin && (
                          <div className="flex items-center gap-1 col-span-2">
                            <span className="text-blue-600">🌍</span>
                            <span className="text-gray-600">Origin:</span>
                            <span className="font-medium text-blue-700">{product.origin}</span>
                </div>
                        )}
              </div>
                    </div>
                  )}
            </div>
          </div>
        </motion.div>

        {/* Delivery Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-4"
        >
              <h3 className="text-base font-bold text-gray-900 mb-4">Delivery Progress</h3>
          
          {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(deliveryProgress)}%</span>
            </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${deliveryProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Delivery Steps */}
              <div className="space-y-3">
            {getDeliverySteps().map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2"
              >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                      <step.icon className="w-3 h-3" />
                </div>
                <div className="flex-1">
                      <h4 className={`font-semibold text-xs ${
                    step.completed ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                      <p className={`text-xs ${
                    step.completed ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
                {index < getDeliverySteps().length - 1 && (
                      <div className="flex-shrink-0 w-3 h-6 flex justify-center">
                    <div className={`w-0.5 h-full ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

            {/* Route Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-4"
        >
              <h3 className="text-base font-bold text-gray-900 mb-3">Route Details</h3>
              <div className="space-y-3">
                {/* Pickup Location */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-white" />
              </div>
                    <h4 className="font-semibold text-gray-900 text-xs">Pickup Location</h4>
            </div>
                  <p className="text-xs text-gray-600">{pickupLocation?.name || getOriginAddress()}</p>
          </div>

                {/* Delivery Location */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-xs">Delivery Address</h4>
                  </div>
                  <p className="text-xs text-gray-600">{deliveryLocation?.name || order.shippingAddress || order.address || order.deliveryAddress || 'Address not provided'}</p>
                </div>

                {/* Distance Information */}
                {pickupLocation && deliveryLocation && (
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Navigation className="w-3 h-3 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-xs">Route Information</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-purple-600">📏</span>
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-medium text-purple-700">
                          {calculateDistance(
                            pickupLocation.lat, 
                            pickupLocation.lng, 
                            deliveryLocation.lat, 
                            deliveryLocation.lng
                          ).toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-purple-600">⏱️</span>
                        <span className="text-gray-600">Est. Time:</span>
                        <span className="font-medium text-purple-700">
                          {Math.ceil(calculateDistance(
                            pickupLocation.lat, 
                            pickupLocation.lng, 
                            deliveryLocation.lat, 
                            deliveryLocation.lng
                          ) / 50)} days
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Environmental Impact (Green Products Only) */}
            {order.isGreenProduct && greenProduct && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl shadow-lg p-4"
              >
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  Environmental Impact
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Carbon Footprint */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🌱</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 text-xs">CO₂ Saved</h4>
                        <p className="text-green-600 font-bold text-sm">
                          {greenProduct.carbonFootprint || 0} kg
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-green-700">
                      Equivalent to {Math.round((greenProduct.carbonFootprint || 0) / 22)} trees planted
                    </p>
            </div>

                  {/* Green Coins */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-3 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🪙</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 text-xs">Green Coins</h4>
                        <p className="text-yellow-600 font-bold text-sm">
                          {greenProduct.greenCoins || 0}
                        </p>
                </div>
              </div>
                    <p className="text-xs text-yellow-700">
                      Earned for eco-friendly choice
                    </p>
            </div>
          </div>
        </motion.div>
            )}

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-4"
        >
              <h3 className="text-base font-bold text-gray-900 mb-3">Need Help?</h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-xs">
                  <Phone className="w-3 h-3" />
              Contact Support
            </button>
            <button 
              onClick={() => navigate('/myorders')}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-xs"
            >
                  <Package className="w-3 h-3" />
              Back to Orders
            </button>
          </div>
        </motion.div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-4 h-full"
            >
              <h3 className="text-base font-bold text-gray-900 mb-4">Delivery Route</h3>
              
              {/* Map Container */}
              {pickupLocation && deliveryLocation ? (
                <div className="h-[700px] rounded-xl overflow-hidden border-2 border-gray-200">
                  <MapContainer
                    center={[
                      (pickupLocation.lat + deliveryLocation.lat) / 2,
                      (pickupLocation.lng + deliveryLocation.lng) / 2
                    ]}
                    zoom={calculateZoomLevel(calculateDistance(
                      pickupLocation.lat, 
                      pickupLocation.lng, 
                      deliveryLocation.lat, 
                      deliveryLocation.lng
                    ))}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                    scrollWheelZoom={false}
                    dragging={true}
                    doubleClickZoom={false}
                    boxZoom={false}
                    keyboard={false}
                    touchZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Pickup Location Marker */}
                    <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
                      <Popup>
                        <div className="text-center">
                          <div className="font-bold text-blue-600">🚚 Pickup Location</div>
                          <div className="text-sm">{pickupLocation.name}</div>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Delivery Location Marker */}
                    <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}>
                      <Popup>
                        <div className="text-center">
                          <div className="font-bold text-green-600">📍 Delivery Location</div>
                          <div className="text-sm">{deliveryLocation.name}</div>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Truck Icon - Midway on route */}
                    <Marker 
                      position={[
                        (pickupLocation.lat + deliveryLocation.lat) / 2,
                        (pickupLocation.lng + deliveryLocation.lng) / 2
                      ]}
                      icon={truckIcon}
                    >
                      <Popup>
                        <div className="text-center">
                          <div className="font-bold text-orange-600">🚚 In Transit</div>
                          <div className="text-sm">Your order is on the way!</div>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Route Line */}
                    <Polyline
                      positions={[
                        [pickupLocation.lat, pickupLocation.lng],
                        [deliveryLocation.lat, deliveryLocation.lng]
                      ]}
                      color="#3B82F6"
                      weight={3}
                      opacity={0.8}
                    />
                  </MapContainer>
                </div>
              ) : (
                <div className="h-[700px] rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Loading Map...</h4>
                    <p className="text-gray-600">Preparing delivery route</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder; 