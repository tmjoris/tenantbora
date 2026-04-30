import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, getDocs, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AppUser, Property, Application, OperationType, Payment, TenantInvite, Tenancy } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { 
  Search, ShieldCheck, MapPin, Home, CheckCircle2, Navigation, Heart, Filter, 
  ChevronRight, ArrowUpRight, FileText, Smartphone, CreditCard, Clock, ReceiptText,
  Mail, XCircle, CheckCircle, Loader2, AlertCircle, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import PaymentVerification from './PaymentVerification';

interface TenantViewProps {
  user: AppUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TenantView({ user, activeTab, setActiveTab }: TenantViewProps) {
  const [invites, setInvites] = useState<TenantInvite[]>([]);
  const [tenancy, setTenancy] = useState<Tenancy | null>(null);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for my invites
    const qInv = query(collection(db, 'invites'), where('tenantEmail', '==', user.email.toLowerCase()));
    const unsubInv = onSnapshot(qInv, (snapshot) => {
      setInvites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TenantInvite)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'invites'));

    // Listen for my active tenancy
    const qTen = query(collection(db, 'tenancies'), where('tenantId', '==', user.uid));
    const unsubTen = onSnapshot(qTen, (snapshot) => {
      if (!snapshot.empty) {
        setTenancy({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Tenancy);
      } else {
        setTenancy(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tenancies'));

    // Listen for my payments
    const qPayments = query(collection(db, 'payments'), where('tenantId', '==', user.uid));
    const unsubPayments = onSnapshot(qPayments, (snapshot) => {
      setMyPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'payments'));

    return () => {
      unsubInv();
      unsubTen();
      unsubPayments();
    };
  }, [user.uid, user.email]);

  const handleAcceptInvite = async (invite: TenantInvite) => {
    setProcessingInvite(invite.id);
    setError(null);
    console.log('Accepting invite:', invite);
    try {
      // 1. Create Tenancy first
      const tenancyData = {
        tenantId: user.uid,
        landlordId: invite.landlordId,
        propertyId: invite.propertyId,
        unitNumber: invite.unitNumber || '',
        rentAmount: invite.rentAmount,
        rentDueDate: invite.rentDueDate,
        startDate: serverTimestamp(),
        rentStatus: 'current',
        createdAt: serverTimestamp()
      };
      
      console.log('Creating tenancy with data:', tenancyData);
      
      await addDoc(collection(db, 'tenancies'), tenancyData);

      // 2. Update invite status only if tenancy creation succeeds
      await updateDoc(doc(db, 'invites', invite.id), { status: 'accepted' });
    } catch (err: any) {
      console.error('Accept invite error:', err);
      setError(err.message || 'Failed to accept invitation. Please try again.');
      // Don't throw here so we can show it in the UI
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await updateDoc(doc(db, 'invites', inviteId), { status: 'declined' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `invites/${inviteId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      <header>
        <span className="text-accent font-bold uppercase tracking-[0.3em] text-[10px] mb-2 block">Tenant Hub</span>
        <h1 className="text-4xl font-serif font-bold tracking-tight">Your Digital Residency</h1>
        <p className="text-stone-500 font-light mt-2 uppercase tracking-widest text-[10px]">Verified Ledger for {user.displayName}</p>
      </header>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Invites Notification Section */}
      <AnimatePresence>
        {invites.filter(i => i.status === 'pending' || (i.status === 'accepted' && !tenancy)).map((invite) => (
          <motion.div
            key={invite.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="premium-card p-8 bg-ink text-white flex flex-col md:flex-row items-center justify-between gap-8 border-none ring-4 ring-accent/10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 text-white">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold mb-1 italic">New Tenancy Invitation</h3>
                    <p className="text-sm text-stone-400 font-light leading-relaxed">
                      You've been invited to join a property by a landlord. Accept to link your digital payments.
                    </p>
                    <div className="flex gap-4 mt-3">
                       <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-stone-800 rounded-full">Rent: KES {invite.rentAmount.toLocaleString()}</span>
                       <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-stone-800 rounded-full">Unit: {invite.unitNumber || 'N/A'}</span>
                    </div>
                  </div>
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleDeclineInvite(invite.id)}
                    className="flex-1 md:flex-none px-8 py-3 rounded-full bg-red-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                  >
                    Decline
                  </button>
                  <button 
                    disabled={processingInvite === invite.id}
                    onClick={() => handleAcceptInvite(invite)}
                    className="flex-1 md:flex-none px-8 py-3 bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                  >
                    {processingInvite === invite.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Accept & Sync'}
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: My Current Occupancy */}
        <div className="lg:col-span-2 space-y-8">
           <section>
              <h2 className="text-2xl font-serif font-bold mb-6">Current Tenancy</h2>
              {!tenancy ? (
                <div className="premium-card p-16 text-center border-dashed border-stone-200">
                   <Home className="w-12 h-12 text-stone-200 mx-auto mb-4 stroke-[1px]" />
                   <h3 className="font-serif font-bold text-lg text-stone-400 italic mb-2">No Active Residency</h3>
                   <p className="text-sm text-stone-400 font-light max-w-xs mx-auto italic">
                     Waiting for an invitation from your landlord? Or accept a pending invite above to see your ledger.
                   </p>
                </div>
              ) : (
                <div className="premium-card overflow-hidden">
                   <div className="p-8 bg-stone-50 border-b border-stone-100 flex justify-between items-end">
                      <div>
                         <span className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1 block">Live Occupancy</span>
                         <h3 className="text-3xl font-serif font-bold">Unit {tenancy.unitNumber || 'Main'}</h3>
                         <p className="text-stone-500 text-xs mt-2 font-medium">Monthly commitment of KES {tenancy.rentAmount.toLocaleString()}</p>
                      </div>
                      <div className={cn(
                        "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        tenancy.rentStatus === 'current' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {tenancy.rentStatus === 'current' ? 'Up-to-date' : 'Due Soon'}
                      </div>
                   </div>
                   
                   <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                         <Clock className="text-stone-400 w-5 h-5 mb-3" />
                         <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Rent Maturity</p>
                         <h4 className="font-bold text-stone-800 italic">Day {tenancy.rentDueDate} of every month</h4>
                      </div>
                      <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50">
                         <ShieldCheck className="text-emerald-500 w-5 h-5 mb-3" />
                         <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">Financial Integrity</p>
                         <h4 className="font-bold text-emerald-800 italic">Linked to Safaricom Daraja AI</h4>
                      </div>
                   </div>

                   <div className="p-8 pt-0">
                      <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-ink text-white py-6 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-stone-800 transition-all shadow-xl active:scale-95 group"
                      >
                         <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CreditCard className="w-4 h-4 text-white" />
                         </div>
                         Make/Verify Rent Payment
                      </button>
                      <p className="text-center text-[10px] text-stone-400 mt-6 uppercase font-bold tracking-[0.2em]">Verified by TenantBora AI Intelligence</p>
                   </div>
                </div>
              )}
           </section>

           <section>
              <div className="flex items-center justify-between mb-6 pt-4">
                 <h2 className="text-2xl font-serif font-bold">Verification History</h2>
                 <button className="text-xs font-bold text-accent uppercase tracking-widest hover:underline">Full Statement</button>
              </div>

              {myPayments.length === 0 ? (
                <div className="p-12 text-center bg-paper rounded-3xl border border-stone-100 border-dashed">
                   <ReceiptText className="w-10 h-10 text-stone-200 mx-auto mb-3" />
                   <p className="text-xs text-stone-400 italic">Your first verified payment will appear here.</p>
                </div>
              ) : (
                <div className="premium-card overflow-hidden">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-stone-50 border-b border-stone-100">
                            <tr>
                               <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-stone-400">Transaction</th>
                               <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-stone-400">Status</th>
                               <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-stone-400">Amount</th>
                               <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-stone-400">Method</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-stone-50">
                            {myPayments.map(pay => (
                              <tr key={pay.id} className="hover:bg-stone-50/50 transition-colors group">
                                 <td className="px-6 py-4">
                                    <div className="font-bold text-xs uppercase tracking-tight">{pay.transactionCode}</div>
                                    <div className="text-[10px] text-stone-400 mt-1">29 APR 2024 • 14:32</div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className={cn(
                                       "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest",
                                       pay.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                                       pay.status === 'flagged' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                                    )}>
                                       {pay.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                       {pay.status === 'flagged' && <AlertCircle className="w-3 h-3" />}
                                       {pay.status}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 font-bold text-sm">KES {pay.amount.toLocaleString()}</td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                       <span className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                                          <Smartphone className="w-3 h-3" />
                                       </span>
                                       <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">M-PESA</span>
                                    </div>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              )}
           </section>
        </div>

        {/* Right Column: AI Trust Score & Stats */}
        <div className="space-y-8">
           <section className="p-8 bg-accent rounded-[2.5rem] text-white">
              <ShieldCheck className="w-12 h-12 mb-6 opacity-60" />
              <h3 className="text-3xl font-serif font-bold mb-4 tracking-tight">Your Trust Profile</h3>
              <p className="text-sm font-light leading-relaxed mb-8 opacity-90">
                 Based on your last 3 months of verified payments, your residency trust score is maintained by AI.
              </p>
              <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                 <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Integrity Rank</span>
                    <span className="text-3xl font-serif font-bold">A+</span>
                 </div>
                 <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-[95%]" />
                 </div>
              </div>
           </section>

           <section className="premium-card p-8">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400 mb-6">Discovery</h4>
              <div className="space-y-4">
                 <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 group cursor-pointer hover:bg-white hover:shadow-xl transition-all">
                    <h5 className="font-serif font-bold text-lg mb-1 group-hover:text-accent flex items-center justify-between">
                       Property Market <ArrowUpRight className="w-4 h-4" />
                    </h5>
                    <p className="text-xs text-stone-500 font-light italic">Browse verified listings in Kilimani, Westlands & Karen.</p>
                 </div>
                 <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 group cursor-pointer hover:bg-white hover:shadow-xl transition-all">
                    <h5 className="font-serif font-bold text-lg mb-1 flex items-center justify-between">
                       Vetting Tools <Lock className="w-4 h-4 text-stone-300" />
                    </h5>
                    <p className="text-xs text-stone-500 font-light italic">Automate your credit-score verification for premium rentals.</p>
                 </div>
              </div>
           </section>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && tenancy && (
          <PaymentVerification 
            user={user} 
            tenancy={tenancy}
            onClose={() => setShowPaymentModal(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
