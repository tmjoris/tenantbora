import React from 'react';
import { UserRole } from '../types';
import { Building2, UserCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface RoleSetupProps {
  onSelect: (role: UserRole) => void;
}

export default function RoleSetup({ onSelect }: RoleSetupProps) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4 tracking-tighter">Choose your role</h2>
          <p className="text-stone-500 font-light text-lg">Help us customize your TenantBora experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sticky">
          <motion.button
            whileHover={{ y: -10 }}
            onClick={() => onSelect('landlord')}
            className="group p-10 bg-white border border-stone-200 rounded-3xl text-left shadow-sm hover:shadow-2xl hover:border-accent transition-all"
          >
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
              <Building2 className="w-8 h-8 text-stone-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">Property Owner / Landlord</h3>
            <p className="text-stone-500 mb-8 font-light">List properties, verify tenants using AI, and automate your rent collection pipeline.</p>
            <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs">
              Select Landlord role <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -10 }}
            onClick={() => onSelect('tenant')}
            className="group p-10 bg-white border border-stone-200 rounded-3xl text-left shadow-sm hover:shadow-2xl hover:border-accent transition-all"
          >
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
              <UserCircle className="w-8 h-8 text-stone-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">Prospective Tenant</h3>
            <p className="text-stone-500 mb-8 font-light">Build a verified profile, apply for premium listings, and manage your tenancy digitally.</p>
            <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs">
              Select Tenant role <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
