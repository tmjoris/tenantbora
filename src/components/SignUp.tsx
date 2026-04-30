import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight, Building2, ShieldCheck, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    userRole: "tenant" as UserRole,
    phoneNumber: "",
    city: "Nairobi"
  });
  
  const passwordsMatch = confirmPassword.length === 0 || formData.password === confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: formData.userRole, // Use the selected role
        createdAt: serverTimestamp(),
      });
      navigate("/");
    } catch (error) {
      console.error("Google sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    setIsLoading(true);

    try {
      if (!otpSent) {
        // Step 1: Send OTP
        const response = await fetch("/api/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
        });
        const data = await response.json();
        if (data.success) {
          setOtpSent(true);
          if (data.devCode) {
            console.log("[DEV] Your OTP is:", data.devCode);
          }
        } else {
          throw new Error(data.error || "Failed to send OTP");
        }
      } else {
        // Step 2: Verify OTP
        const verifyRes = await fetch("/api/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: formData.phoneNumber, code: otpCode }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          throw new Error(verifyData.error || "Invalid OTP code");
        }

        // Step 3: Create Firebase Account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: formData.email,
          displayName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          role: formData.userRole,
          city: formData.city,
          createdAt: serverTimestamp(),
        });

        navigate("/");
      }
    } catch (err: any) {
      console.error("Error during registration: ", err);
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-brand-200 bg-brand-50">
      {/* Left side - Aesthetic Panel */}
      <div className="hidden lg:flex lg:w-1/2 p-12 lg:p-24 bg-brand-100 flex-col justify-between border-r border-brand-200">
        <div className="flex items-center gap-3">
          <div className="bg-brand-950 p-2 rounded-xl">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-brand-950">TenantBora<span className="text-accent underline decoration-brand-200">.</span></Link>
        </div>
        
        <div className="max-w-xl">
          <h2 className="text-6xl font-serif font-bold leading-tight mb-8 text-brand-950 tracking-tighter">
            Join the <span className="italic underline decoration-brand-200">movement</span>.
          </h2>
          <p className="text-xl text-brand-600 leading-relaxed max-w-lg mb-8 font-light">
            Create an account to track your residency, verify M-Pesa receipts, and maximize your rental impact in Nairobi.
          </p>
          
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-white border border-brand-200 flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-brand-950" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-brand-950">AI-Powered Vetting</h4>
                <p className="text-brand-600 text-sm font-light mt-1 italic">Eliminating rent disputes with ledger transparency.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.3em] font-sans">
          © {new Date().getFullYear()} TenantBora Nairobi Platform
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
            <h1 className="text-4xl font-serif font-bold text-brand-950 mb-3 tracking-tight">
              {otpSent ? "Verify Identity" : "Create Account"}
            </h1>
            <p className="text-brand-600 font-light text-sm uppercase tracking-widest">
              {otpSent ? `We sent a code to ${formData.phoneNumber}` : "Join TenantBora for an easier rental experience"}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 rotate-180" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {!otpSent ? (
              <>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-brand-900 uppercase tracking-[0.2em]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pb-3 border-b-2 border-brand-200 bg-transparent focus:border-brand-950 outline-none transition-all text-lg font-serif"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-brand-900 uppercase tracking-[0.2em]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pb-3 border-b-2 border-brand-200 bg-transparent focus:border-brand-950 outline-none transition-all text-lg font-serif placeholder:font-sans placeholder:text-brand-300 placeholder:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
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
                        minLength={8}
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

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-brand-900 uppercase tracking-[0.2em]">
                      Confirm
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name='confirmPassword'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pb-3 pr-10 border-b-2 bg-transparent outline-none transition-all text-lg font-serif
                          ${passwordsMatch ? "border-brand-200 focus:border-brand-950" : "border-red-500"}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-brand-400 hover:text-brand-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-brand-900 uppercase tracking-[0.2em]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+254..."
                      className="w-full pb-3 border-b-2 border-brand-200 bg-transparent focus:border-brand-950 outline-none transition-all text-lg font-serif"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-brand-900 uppercase tracking-[0.2em]">
                      I am a...
                    </label>
                    <select
                      name="userRole"
                      value={formData.userRole}
                      onChange={handleChange}
                      className="w-full pb-[11px] border-b-2 border-brand-200 bg-transparent focus:border-brand-950 outline-none transition-all text-sm font-bold uppercase tracking-widest text-brand-950 appearance-none"
                    >
                      <option value="tenant">Tenant</option>
                      <option value="landlord">Landlord</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-brand-900 uppercase tracking-[0.2em]">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="w-full pb-3 border-b-2 border-brand-200 bg-transparent focus:border-brand-950 outline-none transition-all text-3xl font-mono tracking-widest text-center"
                    required
                  />
                  <p className="text-[10px] text-brand-400 text-center mt-4">
                    Didn't receive the code? <button type="button" onClick={() => setOtpSent(false)} className="text-brand-950 underline font-bold">Try again</button>
                  </p>
                </div>
              </div>
            )}

            <div className="pt-8 space-y-4">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-brand-950 text-white px-8 py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-800 transition-all shadow-md active:scale-95 flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{otpSent ? "Verify & Register" : "Send Verification Code"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {!otpSent && (
                <>
                  <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-brand-200"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">or continue with</span>
                    <div className="flex-grow border-t border-brand-200"></div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-white border border-brand-200 text-brand-600 px-8 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand-50 transition-all flex items-center justify-center gap-3 shadow-sm shadow-brand-100"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale opacity-70" />
                    Sign up with Google
                  </motion.button>
                </>
              )}
            </div>

            <p className="text-center text-brand-600 mt-8 font-medium">
              Already have an account?{' '}
              <Link to="/signin" className="text-brand-950 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
