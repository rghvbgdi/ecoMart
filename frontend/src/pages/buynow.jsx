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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">Buy Now</h2>
        <div className="flex gap-6 mb-6">
          <img src={product.imageUrl} alt={product.name} className="w-40 h-40 object-cover rounded-xl border" />
          <div>
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">{product.name}</h3>
            <p className="text-emerald-700 mb-2">₹{product.price}</p>
            <p className="text-gray-600 text-sm mb-2">{product.category}</p>
            <p className="text-gray-500 text-xs">{product.description}</p>
          </div>
        </div>
        <form onSubmit={handleOrder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
            disabled={orderPlacing}
          >
            {orderPlacing ? 'Placing Order...' : 'Place Order'}
          </button>
          {orderSuccess && <div className="text-green-600 text-center mt-2">Order placed successfully! Redirecting...</div>}
        </form>
      </div>
    </div>
  );
};

export default BuyNow;
