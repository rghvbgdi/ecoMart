import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout as logoutAPI, status } from "../apis/auth";
   
const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userGreenCoins, setUserGreenCoins] = useState(0);
    const [userLocation, setUserLocation] = useState('');
    const [userCarbonSaved, setUserCarbonSaved] = useState(0);

    useEffect(() => {
        const checkLoginAndAdminStatus = async () => {
            try {
                const data = await status();
                setIsLoggedIn(data.isLoggedIn);
                setIsAdmin(data.user?.role === "admin");
                if (data.user?.greenCoins !== undefined) setUserGreenCoins(data.user.greenCoins);
                if (data.user?.location) setUserLocation(data.user.location);
                if (data.user?.carbonFootprintSaved !== undefined) setUserCarbonSaved(data.user.carbonFootprintSaved);
            } catch (error) {
                setIsLoggedIn(false);
                setIsAdmin(false);
                setUserGreenCoins(0);
                setUserLocation('');
                setUserCarbonSaved(0);
            }
        };

        checkLoginAndAdminStatus();
    }, [location]);

    const handleLogout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
            console.error("Logout failed on backend:", error);
        } finally {
            setIsLoggedIn(false);
            setIsAdmin(false);
            navigate("/login");
        }
    };

    return (
        <nav className="bg-white/80 backdrop-blur-xl border-b border-green-200 shadow-lg px-6 py-3 sticky top-0 z-50 font-inter">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Brand & Navigation */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate("/home")}
                        className="flex items-center gap-2 text-2xl font-black text-green-800 hover:text-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 rounded-lg px-2 py-1"
                    >
                        <span className="text-2xl">🌱</span>
                        <span className="bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                            EcoMart
                        </span>
                    </button>
                    
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/home"
                            className={`font-medium transition-all duration-200 px-4 py-2 rounded-full ${
                                location.pathname === "/home" 
                                    ? "bg-green-100 text-green-900 shadow-inner" 
                                    : "text-green-700 hover:bg-green-50 hover:text-green-900"
                            }`}
                        >
                            🏠 Home
                        </Link>
                        <Link
                            to="/myorders"
                            className={`font-medium transition-all duration-200 px-4 py-2 rounded-full ${
                                location.pathname === "/myorders" 
                                    ? "bg-green-100 text-green-900 shadow-inner" 
                                    : "text-green-700 hover:bg-green-50 hover:text-green-900"
                            }`}
                        >
                            📦 My Orders
                        </Link>
                        
                        <Link
                            to="/leaderboard"
                            className={`font-medium transition-all duration-200 px-4 py-2 rounded-full ${
                                location.pathname === "/leaderboard" 
                                    ? "bg-yellow-100 text-yellow-900 shadow-inner" 
                                    : "text-yellow-600 hover:bg-yellow-50 hover:text-yellow-900"
                            }`}
                        >
                            🏆 Leaderboard
                        </Link>
                        {isAdmin && (
                            <Link
                                to="/admin/problems"
                                className={`font-medium transition-all duration-200 px-4 py-2 rounded-full ${
                                    location.pathname === "/admin/problems" 
                                        ? "bg-purple-100 text-purple-900 shadow-inner" 
                                        : "text-purple-700 hover:bg-purple-50 hover:text-purple-900"
                                }`}
                            >
                                ⚙️ Admin
                            </Link>
                        )}
                    </div>
                </div>

                {/* User Section */}
                <div className="flex items-center gap-4">
                    {/* Location Display */}
                    {isLoggedIn && userLocation && (
                        <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-blue-700 font-medium text-sm">{userLocation}</span>
                        </div>
                    )}

                    {/* Green Coins & Carbon Savings */}
                    {isLoggedIn && (
                        <div className="flex items-center gap-3">
                            {/* Green Coins */}
                            <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200 shadow-sm">
                                <span className="text-lg">🟢</span>
                                <span className="text-green-800 font-bold text-sm">{userGreenCoins}</span>
                                <span className="text-xs text-green-600 font-medium">Coins</span>
                            </div>
                            
                            {/* Carbon Savings */}
                            {userCarbonSaved > 0 && (
                                <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-blue-100 to-teal-100 px-3 py-1.5 rounded-full border border-blue-200">
                                    <span className="text-sm">🌍</span>
                                    <span className="text-blue-800 font-bold text-xs">{userCarbonSaved}kg</span>
                                    <span className="text-xs text-blue-600">CO₂ Saved</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cart */}
                    <button 
                        onClick={() => navigate('/cart')} 
                        className="relative p-2 text-green-700 hover:text-green-900 hover:bg-green-50 rounded-full transition-all duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 005 16h12M17 19a2 2 0 11-4 0 2 2 0 014 0zM9 19a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </button>

                    {/* Auth Section */}
                    {!isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <Link 
                                to="/register" 
                                className="font-medium text-green-700 hover:text-green-900 transition-colors duration-200 px-4 py-2 rounded-full border border-green-200 hover:border-green-400 bg-white/80 backdrop-blur-sm"
                            >
                                Register
                            </Link>
                            <Link 
                                to="/login" 
                                className="font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-200 px-4 py-2 rounded-full shadow-lg"
                            >
                                Login
                            </Link>
                        </div>
                    ) : (
                        <button 
                            onClick={handleLogout} 
                            className="font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-200 px-4 py-2 rounded-full shadow-lg text-sm"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden mt-3 flex items-center justify-center gap-4 border-t border-green-100 pt-3">
                <Link
                    to="/home"
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
                        location.pathname === "/home" 
                            ? "bg-green-100 text-green-900" 
                            : "text-green-700 hover:bg-green-50"
                    }`}
                >
                    🏠 Home
                </Link>
                <Link
                    to="/myorders"
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
                        location.pathname === "/myorders" 
                            ? "bg-green-100 text-green-900" 
                            : "text-green-700 hover:bg-green-50"
                    }`}
                >
                    📦 Orders
                </Link>
                <Link
                    to="/leaderboard"
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
                        location.pathname === "/leaderboard" 
                            ? "bg-yellow-100 text-yellow-900" 
                            : "text-yellow-600 hover:bg-yellow-50"
                    }`}
                >
                    🏆 Leaders
                </Link>
                {isLoggedIn && userLocation && (
                    <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="text-blue-700 font-medium text-xs">{userLocation}</span>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;