import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../apis/product';
import { createOrder } from '../apis/orders';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prod = await getProductById(id);
        setProduct(prod);
      } catch (err) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const shippingAddress = "User Address, India"; // Replace with actual user address if available
      const payload = {
        productId: product._id,
        price: product.greenProduct?.greenDealPrice || product.price,
        shippingAddress
      };
      const response = await createOrder(payload);
      alert('Order placed successfully!');
      navigate(`/order-confirmation/${response.order._id}`);
    } catch (err) {
      setError('Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found.</div>;

  // Green deal stats
  const isGreenDeal = product.isGreenDeal || product.greenProduct?.status;
  const greenStats = product.greenProduct?.sold || {};
  const greenDealPrice = product.greenProduct?.greenDealPrice || product.price;
  const originalPrice = product.price;
  const amountSavedByUser = greenStats.amountSavedByUser || 0;
  const amountSavedByEcommerce = greenStats.amountSavedByEcommerce || 0;
  const treeplaneted = greenStats.treeplaneted || 0;
  const footprintreduced = greenStats.footprintreduced || 0;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover rounded-lg mb-4" />
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="mb-2">{product.description}</p>
      <div className="mb-2">Category: {product.category}</div>
      <div className="mb-2">Price: ₹{greenDealPrice} {isGreenDeal && <span className="text-xs text-gray-400 line-through ml-2">₹{originalPrice}</span>}</div>
      {isGreenDeal && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-emerald-700 mb-2 flex items-center gap-2">
            <span role="img" aria-label="green">🌱</span> Green Deal Benefits
          </h2>
          <ul className="text-emerald-800 text-sm space-y-1">
            <li><strong>Amount you save:</strong> ₹{amountSavedByUser}</li>
            <li><strong>CO₂ emissions reduced:</strong> {footprintreduced} kg</li>
            <li><strong>Trees planted:</strong> {treeplaneted}</li>
            <li><strong>Platform savings:</strong> ₹{amountSavedByEcommerce}</li>
          </ul>
        </div>
      )}
      <button
        onClick={handlePlaceOrder}
        disabled={placingOrder}
        className="bg-emerald-600 text-white px-6 py-2 rounded-lg mt-4"
      >
        {placingOrder ? 'Placing Order...' : 'Place Order'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default ProductDetails;
