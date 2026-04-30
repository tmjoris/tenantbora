import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AppUser, UserRole } from './types';
import { handleFirestoreError } from './lib/error-handler';
import { OperationType } from './types';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import RoleSetup from './components/RoleSetup';
import LandlordView from './components/LandlordView';
import TenantView from './components/TenantView';
import SeedData from './components/SeedData';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Building2, ShieldCheck, CreditCard, Wrench, Github, Twitter, MapPin } from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans selection:bg-brand-200">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 flex justify-between items-center px-8 py-10 md:px-16">
        <div className="flex items-center gap-4">
          <div className="bg-brand-950 p-2.5 rounded-2xl shadow-lg">
            <Building2 className="text-white w-8 h-8" />
          </div>
          <span className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-brand-950">TenantBora<span className="text-accent underline decoration-brand-200">.</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/signin"
            className="text-brand-950 font-bold uppercase tracking-widest text-xs hover:text-accent transition-all px-6 py-3"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-brand-950 text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-800 transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2560&auto=format&fit=crop" 
            alt="Modern Residence" 
            className="w-full h-full object-cover brightness-[0.85]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white"
        >
          <h1 className="text-6xl md:text-9xl font-serif font-bold leading-[0.85] tracking-tighter mb-8">
            Nairobi's <br />
            <span className="italic text-accent decoration-white/20 underline">Trusted Legacy.</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-brand-50 max-w-2xl mx-auto leading-relaxed mb-12">
            The premium verification platform for Kenya's leading landlords and modern residents. 
          </p>
          <div className="flex gap-6 justify-center">
             <Link
              to="/signup"
              className="bg-white text-brand-950 px-10 py-5 rounded-full font-bold text-lg hover:bg-brand-50 transition-all shadow-2xl hover:-translate-y-1 active:scale-95 px-12"
            >
              Secure My Tenancy
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-accent font-bold uppercase tracking-[0.3em] text-[11px] mb-6 block">The Ecosystem</span>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-brand-950 leading-tight mb-8 tracking-tighter">
                Eliminate Disputes <br className="hidden md:block" /> with AI Verification.
              </h2>
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-brand-950 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-brand-950 mb-2">M-Pesa AI Validation</h4>
                    <p className="text-brand-600 font-light leading-relaxed">Our neural engine verifies screenshots against live transaction patterns, flagging anomalies before they become disputes.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                   <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center shrink-0">
                    <CreditCard className="text-brand-950 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-brand-950 mb-2">Automated Statement Sync</h4>
                    <p className="text-brand-600 font-light leading-relaxed">No more "check your phone" messages. Landlords and tenants share a cryptographically signed transaction ledger.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-brand-100 rounded-[3rem] overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop" 
                  alt="Modern Interior" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-12 -left-12 bg-white p-8 rounded-3xl shadow-2xl max-w-[240px] transform -rotate-3 border border-brand-50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Live Audit</span>
                  </div>
                  <p className="text-brand-950 font-serif font-bold text-xl leading-tight">KES 145,000 <span className="text-brand-400 text-xs font-sans">Verified</span></p>
                  <p className="text-stone-400 text-[10px] mt-2 font-mono">HASH: 7712-RK-A92</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-brand-950 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-brand-400 text-xs uppercase tracking-[0.4em] font-bold mb-12">Verified by 200+ Nairobi Estates</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale group-hover:grayscale-0 transition-all cursor-default">
            <span className="text-4xl text-white font-serif font-black underline decoration-white/20">Kileleshwa Heights</span>
            <span className="text-4xl text-white font-serif font-black underline decoration-white/20">Lavington Green</span>
            <span className="text-4xl text-white font-serif font-black underline decoration-white/20">Westlands Towers</span>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 bg-brand-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-brand-950 mb-8 tracking-tighter">Your rental history <br className="hidden md:block" /> is your credit.</h2>
          <p className="text-lg text-brand-600 mb-12 font-light leading-relaxed">
            Join the ecosystem where integrity pays. Build your TenantBora score and unlock Nairobi's finest properties with zero friction.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-brand-950 text-white px-12 py-6 rounded-full font-bold text-lg hover:bg-brand-800 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
          >
            Start Verification Free
          </Link>
        </div>
      </section>

      <footer className="mt-auto border-t border-brand-200 py-12 px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="bg-brand-950 p-1.5 rounded-lg">
              <Building2 className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-serif font-bold tracking-tight">TenantBora<span className="text-accent">.</span></span>
          </div>
          <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold">© 2026 TenantBora Nairobi. Digital Residency Engine.</p>
          <div className="flex gap-6">
            <Twitter className="w-5 h-5 text-brand-300 hover:text-accent transition-colors cursor-pointer" />
            <Github className="w-5 h-5 text-brand-300 hover:text-accent transition-colors cursor-pointer" />
            <MapPin className="w-5 h-5 text-brand-300 hover:text-accent transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function Dashboard({ user, handleRoleSelect, showRoleSetup }: { user: AppUser, handleRoleSelect: (role: UserRole) => void, showRoleSetup: boolean }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (showRoleSetup) {
    return <RoleSetup onSelect={handleRoleSelect} />;
  }

  return (
    <div className="min-h-screen bg-paper pb-12 flex flex-col">
      <Navbar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 w-full">
        <AnimatePresence mode="wait">
          {user.role === 'landlord' ? (
            <LandlordView key="landlord" user={user} activeTab={activeTab as any} setActiveTab={setActiveTab as any} />
          ) : (
            <TenantView key="tenant" user={user} activeTab={activeTab as any} setActiveTab={setActiveTab as any} />
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 border-t border-stone-200 py-12 px-8 bg-white/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent p-1.5 rounded-lg">
                <Building2 className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-serif font-bold tracking-tight">TenantBora<span className="text-accent">.</span></span>
            </div>
            <p className="text-stone-400 text-sm max-w-sm font-light leading-relaxed">
              The gold standard for rental management in Nairobi. We are building a future where every tenancy is built on trust and verified data.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-6 font-sans">Connect</h4>
            <div className="flex gap-4">
              <Twitter className="w-5 h-5 text-stone-400 hover:text-accent cursor-pointer transition-colors" />
              <Github className="w-5 h-5 text-stone-400 hover:text-accent cursor-pointer transition-colors" />
              <MapPin className="w-5 h-5 text-stone-400 hover:text-accent cursor-pointer transition-colors" />
            </div>
          </div>
          <div>
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-6 font-sans">Legal</h4>
            <ul className="text-stone-400 text-xs space-y-3 font-medium uppercase tracking-tighter font-sans">
              <li className="hover:text-accent cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-accent cursor-pointer transition-colors">M-Pesa Terms</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold font-sans">© 2026 TenantBora Nairobi. All rights reserved.</p>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold font-sans">System Status: Optimal</span>
          </div>
        </div>
      </footer>
      
      <SeedData userId={user.uid} />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoleSetup, setShowRoleSetup] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as AppUser);
            setShowRoleSetup(false);
          } else {
            // New user, need to setup role
            setUser({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Anonymous',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              role: 'tenant', // temporary default
              createdAt: serverTimestamp(),
            } as AppUser);
            setShowRoleSetup(true);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUser(null);
        setShowRoleSetup(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleSelect = async (role: UserRole) => {
    if (!user) return;
    try {
      const newUser = {
        ...user,
        role,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', user.uid), newUser);
      setUser(newUser as AppUser);
      setShowRoleSetup(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-paper">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user} handleRoleSelect={handleRoleSelect} showRoleSetup={showRoleSetup} /> : <Landing />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
        <Route path="/signin" element={user ? <Navigate to="/" /> : <SignIn />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

