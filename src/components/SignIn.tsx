import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight, Building2, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate("/");
    } catch (error) {
      console.error("Sign in error: ", error);
      alert("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-brand-200 bg-brand-50">
      {/* Left side - Aesthetic Panel */}
      <div className="hidden lg:flex lg:w-1/2 p-12 lg:p-24 bg-brand-950 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl">
            <Building2 className="text-brand-950 w-6 h-6" />
          </div>
          <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-white">TenantBora<span className="text-accent underline decoration-white/20">.</span></Link>
        </div>
        
        <div className="max-w-xl">
          <h2 className="text-6xl font-serif font-bold leading-tight mb-8 text-white tracking-tighter">
            Access your <br /><span className="italic text-accent decoration-white/20 underline">rental ledger.</span>
          </h2>
          <p className="text-brand-400 text-lg font-light leading-relaxed">
            Verify M-Pesa payments, manage property portfolios, and maintain your residency integrity score in Nairobi's trusted ecosystem.
          </p>
        </div>

        <div className="text-[10px] font-bold text-brand-600 uppercase tracking-[0.3em] font-sans">
          © {new Date().getFullYear()} TenantBora Nairobi
        </div>
      </div>

      {/* Right side - Form Panel */}
      <div className="relative flex flex-col justify-center w-full lg:w-1/2 p-8 lg:p-24 bg-brand-50 overflow-y-auto">
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
           <Building2 className="text-brand-950 w-5 h-5" />
           <Link to="/" className="text-xl font-serif font-bold italic text-brand-950">TenantBora.</Link>
        </div>

        <div className="max-w-md w-full mx-auto py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold text-brand-950 mb-3 tracking-tight">Welcome Back</h1>
            <p className="text-brand-600 font-light text-sm uppercase tracking-widest">Sign in to manage your digital residency</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-brand-900 uppercase tracking-[0.2em]">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@domain.com"
                className="w-full pb-3 border-b-2 border-brand-200 bg-transparent focus:border-brand-950 outline-none transition-all text-lg font-serif placeholder:font-sans placeholder:text-brand-300 placeholder:text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-brand-900 uppercase tracking-[0.2em]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pb-3 pr-10 border-b-2 border-brand-200 bg-transparent focus:border-brand-950 outline-none transition-all text-lg font-serif"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-brand-400 hover:text-brand-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-brand-950 text-white px-8 py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-800 transition-all shadow-md flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Ledger</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-brand-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">or continue with</span>
                <div className="flex-grow border-t border-brand-200"></div>
              </div>

              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-white border border-brand-200 text-brand-600 px-8 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand-50 transition-all flex items-center justify-center gap-3 shadow-sm shadow-brand-100"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale opacity-70" />
                Sign in with Google
              </motion.button>
            </div>

            <p className="text-center text-brand-600 mt-8 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-950 font-black hover:underline">Register Here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
