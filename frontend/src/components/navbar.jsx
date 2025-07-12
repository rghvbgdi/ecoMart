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
                
                // Get location from cookies if not in user data
                if (!data.user?.location) {
                    const cookieLocation = getCookie('user_location');
                    if (cookieLocation) {
                        setUserLocation(cookieLocation);
                    }
                }
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

    // Helper function to get cookie value
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

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
        <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm px-4 py-3 sticky top-0 z-50 font-inter">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left Section - Brand Logo & Navigation */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate("/home")}
                        className="flex items-center gap-2 text-2xl font-black text-green-800 hover:text-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 rounded-lg px-3 py-2"
                    >
                        <span className="text-2xl">🌱</span>
                        <span className="bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                            EcoMart
                        </span>
                    </button>
                    
                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            to="/home"
                            className={`font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                                location.pathname === "/home" 
                                    ? "bg-green-100 text-green-900 shadow-sm" 
                                    : "text-slate-700 hover:bg-slate-50 hover:text-green-700"
                            }`}
                        >
                            🏠 Home
                        </Link>
                        <Link
                            to="/myorders"
                            className={`font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                                location.pathname === "/myorders" 
                                    ? "bg-green-100 text-green-900 shadow-sm" 
                                    : "text-slate-700 hover:bg-slate-50 hover:text-green-700"
                            }`}
                        >
                            📦 My Orders
                        </Link>
                        
                        <Link
                            to="/leaderboard"
                            className={`font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                                location.pathname === "/leaderboard" 
                                    ? "bg-yellow-100 text-yellow-900 shadow-sm" 
                                    : "text-slate-700 hover:bg-slate-50 hover:text-amber-600"
                            }`}
                        >
                            🏆 Leaderboard
                        </Link>
                        {isAdmin && (
                            <Link
                                to="/admin/problems"
                                className={`font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                                    location.pathname === "/admin/problems" 
                                        ? "bg-purple-100 text-purple-900 shadow-sm" 
                                        : "text-slate-700 hover:bg-slate-50 hover:text-purple-700"
                                }`}
                            >
                                ⚙️ Admin
                            </Link>
                        )}
                    </div>
                </div>

                {/* Right Section - User Info & Actions */}
                <div className="flex items-center gap-3">
                    {/* Location Display */}
                    {userLocation && (
                        <div className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors duration-200 px-3 py-2 rounded-lg border border-slate-200">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-slate-700 font-medium text-sm">{userLocation}</span>
                        </div>
                    )}

                    {/* Green Coins & Carbon Savings */}
                    {isLoggedIn && (
                        <div className="flex items-center gap-2">
                            {/* Green Coins */}
                            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 px-3 py-2 rounded-lg border border-green-200 shadow-sm">
                                <span className="text-base">🟢</span>
                                <span className="text-green-800 font-bold text-sm">{userGreenCoins}</span>
                                <span className="text-xs text-green-600 font-medium">Coins</span>
                            </div>
                            
                            {/* Carbon Savings */}
                            {userCarbonSaved > 0 && (
                                <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-teal-50 hover:from-blue-100 hover:to-teal-100 transition-all duration-200 px-3 py-2 rounded-lg border border-blue-200 shadow-sm">
                                    <span className="text-base">🌍</span>
                                    <span className="text-blue-800 font-bold text-sm">{userCarbonSaved}kg</span>
                                    <span className="text-xs text-blue-600 font-medium">CO₂ Saved</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cart */}
                    <button 
                        onClick={() => navigate('/cart')} 
                        className="relative p-2.5 text-slate-700 hover:text-green-700 hover:bg-slate-100 rounded-lg transition-all duration-200 border border-transparent hover:border-slate-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 005 16h12M17 19a2 2 0 11-4 0 2 2 0 014 0zM9 19a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </button>

                    {/* Auth Section */}
                    {!isLoggedIn ? (
                        <div className="flex items-center gap-2">
                            <Link 
                                to="/register" 
                                className="font-medium text-slate-700 hover:text-green-700 transition-colors duration-200 px-4 py-2 rounded-lg border border-slate-200 hover:border-green-300 bg-white hover:bg-slate-50"
                            >
                                Register
                            </Link>
                            <Link 
                                to="/login" 
                                className="font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-200 px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
                            >
                                Login
                            </Link>
                        </div>
                    ) : (
                        <button 
                            onClick={handleLogout} 
                            className="font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-200 px-4 py-2 rounded-lg shadow-md hover:shadow-lg text-sm"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden mt-3 flex items-center justify-center gap-2 border-t border-slate-100 pt-3">
                <Link
                    to="/home"
                    className={`text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname === "/home" 
                            ? "bg-green-100 text-green-900" 
                            : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                    🏠 Home
                </Link>
                <Link
                    to="/myorders"
                    className={`text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname === "/myorders" 
                            ? "bg-green-100 text-green-900" 
                            : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                    📦 Orders
                </Link>
                <Link
                    to="/leaderboard"
                    className={`text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname === "/leaderboard" 
                            ? "bg-yellow-100 text-yellow-900" 
                            : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                    🏆 Leaders
                </Link>
                {userLocation && (
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200">
                        <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="text-slate-700 font-medium text-xs">{userLocation}</span>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;