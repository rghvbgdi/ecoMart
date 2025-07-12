import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../apis/product';
import { getGreenOrders } from '../apis/green';
import { getOrdersByUserId } from '../apis/orders';
import { status as checkAuthStatus } from '../apis/auth';

const OrderTracker = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [riderLocation, setRiderLocation] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchOrderData = async () => {
      try {
        const authRes = await checkAuthStatus();
        setUser(authRes.user);

        // Try to find the order in both normal and green orders
        let foundOrder = null;
        let isGreenOrder = false;

        // Check green orders first
        try {
          const greenOrders = await getGreenOrders();
          foundOrder = greenOrders.find(o => o._id === orderId);
          if (foundOrder) {
            isGreenOrder = true;
          }
        } catch (err) {
          console.log('Not a green order, checking normal orders...');
        }

        // If not found in green orders, check normal orders
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

        // Fetch product details
        const productData = await getProductById(foundOrder.productId);
        setProduct(productData);

        // Set rider location based on product type
        if (isGreenOrder) {
          // For green products, rider starts from warehouse
          setRiderLocation({
            lat: 19.0760, // Mumbai warehouse coordinates
            lng: 72.8777,
            name: 'Warehouse - Mumbai'
          });
        } else {
          // For normal products, rider starts from product origin
          // Convert origin string to coordinates (simplified mapping)
          const originCoords = getOriginCoordinates(productData.origin);
          setRiderLocation({
            lat: originCoords.lat,
            lng: originCoords.lng,
            name: `Origin - ${productData.origin}`
          });
        }

      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Helper function to convert origin string to coordinates
  const getOriginCoordinates = (origin) => {
    const originMap = {
      'India': { lat: 20.5937, lng: 78.9629 },
      'China': { lat: 35.8617, lng: 104.1954 },
      'Japan': { lat: 36.2048, lng: 138.2529 },
      'USA': { lat: 37.0902, lng: -95.7129 },
      'Germany': { lat: 51.1657, lng: 10.4515 },
      'France': { lat: 46.2276, lng: 2.2137 },
      'Italy': { lat: 41.8719, lng: 12.5674 },
      'Spain': { lat: 40.4637, lng: -3.7492 },
      'UK': { lat: 55.3781, lng: -3.4360 },
      'Canada': { lat: 56.1304, lng: -106.3468 },
      'Australia': { lat: -25.2744, lng: 133.7751 },
      'Brazil': { lat: -14.2350, lng: -51.9253 },
      'Mexico': { lat: 23.6345, lng: -102.5528 },
      'South Korea': { lat: 35.9078, lng: 127.7669 },
      'Netherlands': { lat: 52.1326, lng: 5.2913 },
      'Switzerland': { lat: 46.8182, lng: 8.2275 },
      'Sweden': { lat: 60.1282, lng: 18.6435 },
      'Norway': { lat: 60.4720, lng: 8.4689 },
      'Denmark': { lat: 56.2639, lng: 9.5018 },
      'Finland': { lat: 61.9241, lng: 25.7482 }
    };

    return originMap[origin] || { lat: 20.5937, lng: 78.9629 }; // Default to India
  };

  const getOrderStatus = () => {
    if (!order) return { currentStep: 0, steps: [] };
    
    const steps = ['Order Placed', 'Packed', 'Out for Delivery', 'Delivered'];
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Order Not Found</h2>
          <p className="text-red-500 mb-4">{error || 'The order you\'re looking for doesn\'t exist.'}</p>
          <button 
            onClick={() => navigate('/myOrders')}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const { currentStep, steps } = getOrderStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Order Tracker
          </h1>
          <p className="text-gray-600">Track your order in real-time</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Order Details</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Order ID:</span> {order._id}</p>
                <p><span className="font-semibold">Product:</span> {product.name}</p>
                <p><span className="font-semibold">Price:</span> ₹{product.price.toLocaleString()}</p>
                <p><span className="font-semibold">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </p>
                <p><span className="font-semibold">Origin:</span> {product.origin}</p>
                <p><span className="font-semibold">Rider Location:</span> {riderLocation?.name}</p>
              </div>
            </div>
            
            <div>
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Order Progress */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Order Progress</h3>
          
          {order.status === 'cancelled' ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h4 className="text-xl font-bold text-red-600 mb-2">Order Cancelled</h4>
              <p className="text-red-500">This order has been cancelled.</p>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              {steps.map((step, idx) => (
                <div key={step} className="flex-1 text-center relative">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold ${
                    idx <= currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className={`mt-2 text-sm font-medium ${
                    idx <= currentStep ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step}
                  </div>
                  
                  {/* Progress line */}
                  {idx < steps.length - 1 && (
                    <div className={`absolute top-6 left-1/2 w-full h-1 ${
                      idx < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`} style={{ transform: 'translateX(50%)' }}></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Section */}
        {riderLocation && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rider Location</h3>
            <div className="h-80 rounded-lg overflow-hidden border-2 border-gray-200">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${riderLocation.lat},${riderLocation.lng}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📍</span>
                <span className="text-blue-700 font-medium">{riderLocation.name}</span>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                {order.status === 'delivered' ? 'Order has been delivered!' : 
                 'Rider is on the way to deliver your order'}
              </p>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/myOrders')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            ← Back to My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker; 