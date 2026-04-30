import React from 'react';
import { AppUser } from '../types';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Building2, LogOut, User, Bell, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  user: AppUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ user, activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-4">
            <div className="bg-brand-950 p-2.5 rounded-2xl shadow-lg">
              <Building2 className="text-white w-8 h-8" />
            </div>
            <span className="text-3xl font-serif font-bold tracking-tight">TenantBora<span className="text-accent underline decoration-brand-200">.</span></span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            <button 
              onClick={() => setActiveTab('overview')}
              className={cn("transition-all hover:scale-105", activeTab === 'overview' ? "text-brand-950 scale-105" : "hover:text-brand-950")}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('properties')}
              className={cn("transition-all hover:scale-105", activeTab === 'properties' ? "text-brand-950 scale-105" : "hover:text-brand-950")}
            >
              Portfolio
            </button>
            <button 
              onClick={() => setActiveTab('tenants')}
              className={cn("transition-all hover:scale-105", activeTab === 'tenants' ? "text-brand-950 scale-105" : "hover:text-brand-950")}
            >
              {user.role === 'landlord' ? 'Tenants' : 'Invoices'}
            </button>
            <button className="hover:text-brand-950 transition-all hover:scale-105">Support</button>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2.5 text-stone-500 hover:text-ink transition-colors relative">
               <Bell className="w-6 h-6" />
               <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-10 w-[1px] bg-stone-200 mx-1"></div>

            <div className="flex items-center gap-4 bg-stone-100 p-2 pr-6 rounded-full border border-stone-200 hover:bg-stone-200 transition-colors cursor-pointer">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                className="w-10 h-10 rounded-full shadow-md border-2 border-white"
                alt={user.displayName}
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-stone-400 leading-none tracking-tighter">{user.role}</span>
                <span className="text-sm font-bold text-ink leading-tight">{user.displayName.split(' ')[0]}</span>
              </div>
            </div>

            <button 
              onClick={() => signOut(auth)}
              className="p-2.5 text-stone-400 hover:text-red-600 transition-all hover:scale-110"
              title="Sign Out"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
