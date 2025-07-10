import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "./apis/auth"; // Ensure 'register' is imported
import { useRef } from "react";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerRole, setRegisterRole] = useState('user'); // 'user' or 'seller'
  const passwordInputRef = useRef(null);
  // Removed passwordStrength state as it's no longer needed

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Removed password strength check on change
  };

  // Simplified password validation based on backend's implicit requirements (length, one uppercase, one number)
  const isValidPassword = (password) => {
    // Basic validation: at least 6 characters, one uppercase, one number
    return /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    // Frontend validation for password strength
    if (!isValidPassword(formData.password)) {
      setError("Password must be at least 6 characters with one uppercase letter and one number.");
      setLoading(false);
      return;
    }

    try {
      // Call the register API function with username, email, and password
      await register(
        formData.username,
        formData.email,
        formData.password
      );
      setSuccess("Account created successfully! Redirecting to login...");
      setError(""); // Clear any lingering error messages
      
      // Navigate to the login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      // Extract error message from backend response or provide a generic one
      setError(error.response?.data || "Registration failed. Please try again.");
      setSuccess(""); // Clear success message on error
      setLoading(false); // Stop loading animation
    }
  };

  // Handler for admin quick register (Walmart)
  const handleAdminRegister = () => {
    setFormData((prev) => ({ ...prev, email: 'admin@walmart.com' }));
    setRegisterRole('admin');
    setTimeout(() => {
      if (passwordInputRef.current) passwordInputRef.current.focus();
    }, 100);
  };

  // Removed getPasswordStrengthColor function as it's no longer needed

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-60 h-60 bg-emerald-200/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-200/50 overflow-hidden transition-all duration-500 ease-out hover:shadow-3xl">
          <div className="p-8 space-y-6">
            
            {/* Header section */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-emerald-900 tracking-tight">
                Join EcoMart
              </h2>
              <p className="text-emerald-600 text-sm font-medium">
                Sustainable shopping for everyone
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <button
                  type="button"
                  className={`px-4 py-1.5 rounded-full font-semibold text-sm border-2 transition-all duration-300 ${registerRole === 'user' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white/80 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'}`}
                  onClick={() => setRegisterRole('user')}
                >
                  User
                </button>
                <button
                  type="button"
                  className={`px-4 py-1.5 rounded-full font-semibold text-sm border-2 transition-all duration-300 ${registerRole === 'seller' ? 'bg-teal-600 text-white border-teal-600 shadow-lg' : 'bg-white/80 text-teal-700 border-teal-200 hover:bg-teal-50 hover:border-teal-300'}`}
                  onClick={() => setRegisterRole('seller')}
                >
                  Seller
                </button>
              </div>
            </div>

            <form onSubmit={handleRegister}>
              <div className="space-y-5">
                {/* Username Input */}
                <div className="relative group">
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-emerald-900 placeholder-emerald-400"
                    placeholder={registerRole === 'seller' ? "Seller username" : registerRole === 'admin' ? "Admin username" : "Username"}
                    required
                  />
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                </div>

                {/* Email Input */}
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-emerald-900 placeholder-emerald-400"
                    placeholder={registerRole === 'seller' ? "Seller email" : registerRole === 'admin' ? "Admin email" : "Enter your email"}
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
                    value={formData.password}
                    onChange={handleChange}
                    ref={passwordInputRef}
                    className="w-full px-4 py-3 pr-12 bg-emerald-50 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-emerald-900 placeholder-emerald-400"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-700 transition-colors duration-200 p-1 rounded"
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

                {/* Removed Password Strength Indicator UI */}
              </div>

              {/* Error/Success Messages */}
              {(error || success) && (
                <div className="mt-5 space-y-3">
                  {error && (
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm transform transition-all duration-300">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {success && (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm transform transition-all duration-300">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{success}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-teal-300 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-md"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {loading ? "Creating account..." : "Create Account"}
              </button>

              {/* Footer */}
              <div className="text-center text-sm text-emerald-600 mt-6">
                Already have an account?{" "}
                <Link 
                  to="/login"
                  className="text-emerald-500 hover:text-emerald-700 transition-colors duration-200 font-medium hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
              {/* Admin register option */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleAdminRegister}
                  className="text-xs text-gray-400 hover:text-emerald-700 underline transition-colors duration-200"
                >
                  Register as Walmart Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
