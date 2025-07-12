import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGreenProductById, createGreenOrder } from '../apis/green';
import { status as checkAuthStatus } from '../apis/auth';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await checkAuthStatus();
        setUser(authRes.user);
        setShippingAddress(authRes.user?.location || '');
        
        // Fetch specific green product by ID - much more efficient!
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
      await createGreenOrder({
        customerId: user.id || user._id,
        productId: greenProduct.productId._id,
        shippingAddress: shippingAddress || 'Default Address, India',
      });
      setOrderSuccess(true);
      setTimeout(() => navigate('/home'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place green order.');
    } finally {
      setOrderPlacing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!greenProduct) return <div className="min-h-screen flex items-center justify-center">Green product not found.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full border-4 border-green-200 relative">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-200 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-12 h-12 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold mb-4 text-green-800 text-center mt-8">Buy Green Deal</h2>
        <div className="flex flex-col md:flex-row gap-8 mb-6 items-center">
          <img src={greenProduct.productId?.imageUrl} alt={greenProduct.productId?.name} className="w-48 h-48 object-cover rounded-2xl border-4 border-green-100 shadow" />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-green-900 mb-2">{greenProduct.productId?.name}</h3>
            <p className="text-green-700 text-lg mb-2">₹{greenProduct.productId?.price}</p>
            <p className="text-green-600 text-sm mb-2">Category: {greenProduct.productId?.category}</p>
            <p className="text-green-500 text-sm mb-2">{greenProduct.productId?.description}</p>
            <div className="flex gap-4 mt-4">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm shadow">Green Coins: {greenProduct.greenCoins}</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm shadow">CO₂ Saved: {greenProduct.carbonFootprint} kg</span>
            </div>
            <div className="mt-4 text-xs text-gray-500">Warehouse Location: Lat {greenProduct.warehouseLocation?.latitude}, Long {greenProduct.warehouseLocation?.longitude}</div>
          </div>
        </div>
        <form onSubmit={handleOrder} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <input type="text" value="Cash on Delivery" disabled className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700" />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
            disabled={orderPlacing}
          >
            {orderPlacing ? 'Placing Green Order...' : 'Place Green Order'}
          </button>
          {orderSuccess && <div className="text-green-600 text-center mt-2">Green order placed successfully! Redirecting...</div>}
        </form>
        <div className="mt-8 text-center text-green-700 font-bold text-lg">
          <span role="img" aria-label="leaf">🌱</span> Thank you for supporting sustainability with Walmart! <span role="img" aria-label="earth">🌍</span>
        </div>
      </div>
    </div>
  );
};

export default GreenBuyNow;
