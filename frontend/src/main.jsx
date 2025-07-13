import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './register.jsx';
import Login from './login.jsx';
import Home from './pages/home.jsx';
import NotFound from './notFound.jsx';

import SellerDashboard from './pages/sellerDashboard.jsx';
import BuyNow from './pages/buynow.jsx';
import MyOrders from './pages/myOrders.jsx';
import GreenBuyNow from './pages/greenBuyNow.jsx';
import TrackOrder from './pages/trackOrder.jsx';
import Leaderboard from './pages/leaderboard.jsx';

import MainLayout from './components/MainLayout.jsx';
import SellerLayout from './components/SellerLayout.jsx';
import ProductDetails from './components/ProductDetails.jsx';
import './index.css'; // Your main CSS file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main layout with Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />

          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/buynow/:id" element={<BuyNow />} />
          <Route path="/greenbuynow/:id" element={<GreenBuyNow />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/track/:orderId" element={<TrackOrder />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Seller layout without Navbar */}
        <Route element={<SellerLayout />}>
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
