import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, status } from "./apis/auth"; // Removed forgotPassword import
import Cookies from 'js-cookie'; // npm install js-cookie

const getCityFromCoords = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    // Try to get city, town, or village
    return (
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.state ||
      data.address.country ||
      'Unknown'
    );
  } catch {
    return 'Unknown';
  }
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Removed showForgotPassword, resetEmail, resetMessage states
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState('user'); // 'user' or 'seller'
  const passwordInputRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      const statusData = await status();
      setSuccess("Welcome back!");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Get city name from coordinates
          const city = await getCityFromCoords(latitude, longitude);
          Cookies.set('user_location', city, { expires: 7 });
          // Now redirect as usual
          const role = statusData.user?.role;
          if (role === 'seller') {
            navigate('/seller-dashboard');
          } else if (role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/home');
          }
        },
        (error) => {
          Cookies.set('user_location', 'Unknown', { expires: 7 });
          const role = statusData.user?.role;
          if (role === 'seller') {
            navigate('/seller-dashboard');
          } else if (role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/home');
          }
        }
      );
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials. Please try again.");
      setSuccess("");
      setIsLoading(false);
    }
  };

  // Handler for admin quick login (Walmart)
  const handleAdminLogin = () => {
    setEmail('admin@walmart.com');
    setLoginRole('admin');
    setTimeout(() => {
      if (passwordInputRef.current) passwordInputRef.current.focus();
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-200/50 overflow-hidden transition-all duration-500 ease-out">
          {/* Form container with smooth height transition */}
          {/* Removed conditional transform as showForgotPassword is gone */}
          <div> 
            <form onSubmit={handleLogin} className="p-8 space-y-6">
              
              {/* Header section */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-emerald-900 tracking-tight">
                  Welcome to EcoMart
                </h2>
                <p className="text-emerald-600 text-sm font-medium">
                  Sustainable shopping for everyone
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    type="button"
                    className={`px-4 py-1.5 rounded-full font-semibold text-sm border-2 transition-all duration-300 ${loginRole === 'user' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white/80 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'}`}
                    onClick={() => setLoginRole('user')}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-1.5 rounded-full font-semibold text-sm border-2 transition-all duration-300 ${loginRole === 'seller' ? 'bg-teal-600 text-white border-teal-600 shadow-lg' : 'bg-white/80 text-teal-700 border-teal-200 hover:bg-teal-50 hover:border-teal-300'}`}
                    onClick={() => setLoginRole('seller')}
                  >
                    Seller
                  </button>
                </div>
              </div>

              {/* Login Form - Always shown now */}
              <div className="space-y-5">
                {/* Email Input */}
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-emerald-900 placeholder-emerald-400"
                    placeholder={loginRole === 'seller' ? "Seller email" : loginRole === 'admin' ? "Admin email" : "User email"}
                    required
                  />
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    ref={passwordInputRef}
                    className="w-full px-4 py-3 pr-12 bg-emerald-50 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-emerald-900 placeholder-emerald-400"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-700 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878L12 12m-3.228-3.228l-1.415-1.414M12 12l2.121 2.121m-2.121-2.121l2.121-2.121" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                </div>

                {/* Removed Forgot Password Link */}
              </div>

              {/* Removed Forgot Password Form */}

              {/* Error/Success Messages */}
              {(error || success) && ( // Removed resetMessage from condition
                <div className="space-y-3">
                  {error && (
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-in slide-in-from-top-2 duration-300">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {success && (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm animate-in slide-in-from-top-2 duration-300">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{success}</span>
                    </div>
                  )}
                  {/* Removed resetMessage display */}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-teal-300 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-md"
              >
                {isLoading && (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {isLoading ? "Signing in..." : "Sign In"} {/* Simplified text */}
              </button>

              {/* Footer Actions - Always show Create account link */}
              <div className="text-center text-sm text-emerald-600 mt-4">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="text-emerald-500 hover:text-emerald-700 transition-colors duration-200 font-medium"
                >
                  Create account
                </Link>
              </div>
             {/* Admin login option */}
             <div className="text-center mt-4">
               <button
                 type="button"
                 onClick={handleAdminLogin}
                 className="text-xs text-gray-400 hover:text-emerald-700 underline transition-colors duration-200"
               >
                 Login as Walmart Admin
               </button>
             </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
