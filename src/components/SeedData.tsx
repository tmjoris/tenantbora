import React from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { Database } from 'lucide-react';

export default function SeedData({ userId }: { userId: string }) {
  const seed = async () => {
    const properties = [
      {
        landlordId: userId,
        name: "Lavington Crystal Suites",
        location: "Lavington, Nairobi",
        rentAmount: 120000,
        description: "Elegant 3-bedroom apartment with a private balcony, world-class gym, and proximity to Lavington Mall. Features high-speed elevators and 24/7 backup generator.",
        images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000"],
        amenities: ["Pool", "Gym", "Parking", "Security"],
        available: true,
        createdAt: serverTimestamp(),
      },
      {
        landlordId: userId,
        name: "Kilimani Heights",
        location: "Kilimani, Nairobi",
        rentAmount: 85000,
        description: "Modern studio apartment perfect for young professionals. Walking distance to Yaya Centre. Rooftop garden and high-speed Wi-Fi included.",
        images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000"],
        amenities: ["Rooftop", "Wi-Fi", "Security"],
        available: true,
        createdAt: serverTimestamp(),
      },
      {
        landlordId: userId,
        name: "The Residences at Westlands",
        location: "Westlands, Nairobi",
        rentAmount: 250000,
        description: "Ultra-luxury penthouse with panoramic city views. Designer kitchen, smart home integration, and private infinity pool.",
        images: ["https://images.unsplash.com/photo-1600607687940-4e393f6e166e?auto=format&fit=crop&q=80&w=1000"],
        amenities: ["Private Pool", "Smart Home", "Spa"],
        available: true,
        createdAt: serverTimestamp(),
      }
    ];

    try {
      for (const prop of properties) {
        await addDoc(collection(db, 'properties'), prop);
      }
      alert("Database seeded with sample properties!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'properties');
    }
  };

  return (
    <button 
      onClick={seed}
      className="fixed bottom-4 right-4 bg-stone-200 hover:bg-stone-300 p-2 rounded-full shadow-sm text-stone-500 transition-all opacity-20 hover:opacity-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
    >
      <Database className="w-4 h-4" /> Seed UI Data
    </button>
  );
}
