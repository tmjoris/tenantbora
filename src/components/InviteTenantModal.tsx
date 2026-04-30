import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Property, OperationType, AppUser } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { motion } from 'motion/react';
import { X, UserPlus, Mail, Hash, DollarSign, Calendar, Loader2 } from 'lucide-react';

interface InviteTenantModalProps {
  user: AppUser;
  properties: Property[];
  onClose: () => void;
}

export default function InviteTenantModal({ user, properties, onClose }: InviteTenantModalProps) {
  const [email, setEmail] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [rentDueDate, setRentDueDate] = useState('5');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !propertyId || !rentAmount) return;

    setInviting(true);
    try {
      await addDoc(collection(db, 'invites'), {
        landlordId: user.uid,
        propertyId,
        unitNumber,
        tenantEmail: email.toLowerCase(),
        rentAmount: Number(rentAmount),
        rentDueDate: Number(rentDueDate),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'invites');
    } finally {
      setInviting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-stone-400" />
        </button>

        <form onSubmit={handleInvite} className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center">
              <UserPlus className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold">Invite Tenant</h2>
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest font-sans">Official Tenancy Link</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest ml-1">Tenant Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tenant@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest ml-1">Property</label>
                <select 
                  required
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full px-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                >
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest ml-1">Unit # (Optional)</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                  <input 
                    type="text"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    placeholder="e.g. A4"
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest ml-1">Monthly Rent</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                  <input 
                    type="number"
                    required
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    placeholder="KES"
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                  />
                 </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest ml-1">Rent Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                  <select 
                    value={rentDueDate}
                    onChange={(e) => setRentDueDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none appearance-none"
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i+1} value={i+1}>Day {i+1} of month</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={inviting}
            className="w-full mt-10 bg-ink text-white py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {inviting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Official Invite'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
