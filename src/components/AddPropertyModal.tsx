import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Building2, MapPin, CreditCard, AlignLeft, Check, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AppUser, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { cn } from '../lib/utils';

interface AddPropertyModalProps {
  user: AppUser;
  onClose: () => void;
}

export default function AddPropertyModal({ user, onClose }: AddPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rentAmount: '',
    description: '',
    amenities: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const propertyId = `prop-${Math.random().toString(36).substring(2, 10)}`;
      const propertyData = {
        landlordId: user.uid,
        name: formData.name,
        location: formData.location,
        rentAmount: Number(formData.rentAmount),
        description: formData.description,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a !== ''),
        available: true,
        images: [], // Placeholder for now
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'properties', propertyId), propertyData);
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'properties');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-brand-100 flex items-center justify-between bg-brand-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-brand-950 p-2.5 rounded-xl shadow-lg transform -rotate-3">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-950 tracking-tight">Add New Property</h2>
              <p className="text-[10px] uppercase font-bold text-brand-400 tracking-widest mt-0.5">Digitize your Nairobi portfolio</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-brand-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-brand-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-900 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Property Name
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Riverside Elite Apartments"
                className="w-full pb-3 border-b-2 border-brand-100 bg-transparent focus:border-brand-950 outline-none transition-all text-lg font-serif placeholder:font-sans placeholder:text-brand-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-900 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Location
              </label>
              <input
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Westlands, Nairobi"
                className="w-full pb-3 border-b-2 border-brand-100 bg-transparent focus:border-brand-950 outline-none transition-all text-lg font-serif placeholder:font-sans placeholder:text-brand-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-900 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> Monthly Rent (KES)
                </label>
                <input
                  required
                  type="number"
                  name="rentAmount"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  placeholder="55000"
                  className="w-full pb-3 border-b-2 border-brand-100 bg-transparent focus:border-brand-950 outline-none transition-all text-lg font-serif placeholder:font-sans placeholder:text-brand-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-900 uppercase tracking-widest flex items-center gap-2">
                  <Check className="w-3 h-3" /> Amenities
                </label>
                <input
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="e.g., WiFi, Gym, Backup Power"
                  className="w-full pb-3 border-b-2 border-brand-100 bg-transparent focus:border-brand-950 outline-none transition-all text-lg font-serif placeholder:font-sans placeholder:text-brand-300"
                />
                <p className="text-[8px] text-brand-400 font-medium">Comma-separated list</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-900 uppercase tracking-widest flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Brief Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the unit's unique appeal..."
                className="w-full p-4 bg-brand-50 border-2 border-transparent focus:border-brand-950 rounded-2xl outline-none transition-all text-sm font-medium resize-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-brand-950 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-950/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Initialize Property Ledger</span>
                  <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Check className="w-4 h-4" />
                  </div>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
