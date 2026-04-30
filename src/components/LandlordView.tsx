import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, getDocs, doc, updateDoc } from 'firebase/firestore';
import { AppUser, Property, Application, OperationType, Payment, Tenancy, TenantInvite } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { 
  Plus, Users, Home, CreditCard, ChevronRight, CheckCircle2, XCircle, AlertCircle, TrendingUp,
  Download, Filter, MoreHorizontal, ShieldCheck, Search, Mail, UserPlus, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import InviteTenantModal from './InviteTenantModal';
import AddPropertyModal from './AddPropertyModal';

interface LandlordViewProps {
  user: AppUser;
  activeTab: 'overview' | 'properties' | 'tenants';
  setActiveTab: (tab: 'overview' | 'properties' | 'tenants') => void;
}

const mockData = [
  { name: 'Jan', amount: 450000 },
  { name: 'Feb', amount: 520000 },
  { name: 'Mar', amount: 480000 },
  { name: 'Apr', amount: 610000 },
  { name: 'May', amount: 590000 },
];

export default function LandlordView({ user, activeTab, setActiveTab }: LandlordViewProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [invites, setInvites] = useState<TenantInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  useEffect(() => {
    // Listen for landlord's properties
    const qProps = query(collection(db, 'properties'), where('landlordId', '==', user.uid));
    const unsubProps = onSnapshot(qProps, (snapshot) => {
      setProperties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'properties'));

    // Tenancies
    const qTen = query(collection(db, 'tenancies'), where('landlordId', '==', user.uid));
    const unsubTen = onSnapshot(qTen, (snapshot) => {
      setTenancies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenancy)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tenancies'));

    // Invites
    const qInv = query(collection(db, 'invites'), where('landlordId', '==', user.uid));
    const unsubInv = onSnapshot(qInv, (snapshot) => {
      setInvites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TenantInvite)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'invites'));

    // Listen for applications to landlord's properties
    const qApps = query(collection(db, 'applications'), where('landlordId', '==', user.uid));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'applications'));

    // Listen for all payments (In a real app, you'd filter by properties owned by this landlord)
    const qPayments = query(collection(db, 'payments'));
    const unsubPayments = onSnapshot(qPayments, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'payments'));

    return () => {
      unsubProps();
      unsubTen();
      unsubInv();
      unsubApps();
      unsubPayments();
    };
  }, [user.uid]);

  const handleUpdateAppStatus = async (appId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'applications', appId), { status, updatedAt: new Date() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `applications/${appId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">Management Hub</span>
          <h1 className="text-4xl font-serif font-bold tracking-tight mt-1">Nairobi Portfolio Performance</h1>
          <p className="text-stone-500 font-light mt-2 uppercase tracking-widest text-xs">Viewing data for {user.displayName}</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setShowInviteModal(true)}
             className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition-colors shadow-sm"
           >
             <UserPlus className="w-4 h-4 text-accent" /> Invite Tenant
           </button>
           <button 
             onClick={() => setShowAddPropertyModal(true)}
             className="flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-lg active:scale-95"
           >
             <Plus className="w-4 h-4" /> Add Property
           </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-stone-100 mb-8">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'properties', label: 'Portfolio', icon: Home },
          { id: 'tenants', label: 'Tenants & Invites', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeTab === tab.id ? "text-accent" : "text-stone-400 hover:text-stone-600"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabBadge"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" 
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="premium-card p-6 flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mb-1">Verified Revenue</p>
                <h3 className="text-2xl font-serif font-bold">KES {payments.filter(p => p.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</h3>
                <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold mt-2">
                  <ShieldCheck className="w-3 h-3" /> 100% Secure
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="premium-card p-6 flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mb-1">Unverified (Flagged)</p>
                <h3 className="text-2xl font-serif font-bold">{payments.filter(p => p.status === 'flagged').length}</h3>
                <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-widest">Requires Review</p>
              </div>
              <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>

            <div className="premium-card p-6 flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mb-1">Managed Tenants</p>
                <h3 className="text-2xl font-serif font-bold">{tenancies.length}</h3>
                <p className="text-[10px] text-stone-500 mt-2 font-medium">{invites.filter(i => i.status === 'pending').length} pending invites</p>
              </div>
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                <Users className="w-5 h-5 text-accent" />
              </div>
            </div>

            <div className="premium-card p-6 flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mb-1">System Health</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ink">AI Monitoring</h3>
                </div>
              </div>
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Analytics Chart */}
            <div className="lg:col-span-2 premium-card overflow-hidden">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg">Revenue Integrity</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-ink text-white rounded-lg text-[10px] font-bold uppercase tracking-tighter">Verified Stream</button>
                </div>
              </div>
              <div className="h-[350px] p-6 pr-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#A8A29E', fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#A8A29E', fontWeight: 600 }}
                      tickFormatter={(val) => `KES ${val/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Verification Queue */}
            <div className="premium-card flex flex-col">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <h3 className="font-serif font-bold text-lg">AI Payment Queue</h3>
                </div>
                <Filter className="w-4 h-4 text-stone-400 cursor-pointer hover:text-ink transition-colors" />
              </div>
              <div className="flex-1 overflow-y-auto max-h-[440px]">
                {payments.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 space-y-4">
                     <CreditCard className="w-12 h-12 mx-auto stroke-[1px]" />
                     <p className="text-sm font-light">Watching for M-Pesa receipts...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {payments.map((pay) => (
                      <div key={pay.id} className="p-6 hover:bg-stone-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                           <span className={cn(
                             "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest",
                             pay.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                             pay.status === 'flagged' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                           )}>
                             {pay.status}
                           </span>
                           <span className="text-[10px] text-stone-400 font-bold font-mono">{pay.transactionCode}</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <h4 className="text-lg font-serif font-bold leading-tight">KES {pay.amount.toLocaleString()}</h4>
                            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold mt-1">Tenant ID: ...{pay.tenantId?.slice(-6) || '???'}</p>
                          </div>
                          {pay.status === 'flagged' && (
                            <div className="bg-red-50 p-2 rounded-lg border border-red-100 text-[10px] text-red-600 font-bold flex items-center gap-1">
                               <AlertCircle className="w-3 h-3" /> Check AI Detail
                            </div>
                          )}
                          {pay.status === 'completed' && (
                            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                               <ShieldCheck className="w-3 h-3" /> AI Confirmed
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="p-4 bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors border-t border-stone-100">
                Full Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'properties' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Your Portfolio</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Find property..."
                  className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all w-64"
                />
              </div>
              <button className="p-2 bg-white border border-stone-200 rounded-full text-stone-500 hover:bg-stone-50">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.length === 0 ? (
              <div className="col-span-full py-20 premium-card text-center space-y-6">
                 <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto border border-stone-100 shadow-inner">
                   <Plus className="w-8 h-8 text-stone-300" />
                 </div>
                 <div>
                    <h3 className="font-serif font-bold text-xl mb-2">Build your digital empire</h3>
                    <p className="text-stone-500 font-light max-w-sm mx-auto">Digitize your properties to start receiving verified applications via TenantBora.</p>
                 </div>
                 <button 
                   onClick={() => setShowAddPropertyModal(true)}
                   className="inline-flex items-center gap-2 px-8 py-3 bg-ink text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-lg active:scale-95"
                 >
                   Add your first property
                 </button>
              </div>
            ) : (
              properties.map((prop) => (
                <motion.div
                  key={prop.id}
                  whileHover={{ y: -8 }}
                  className="premium-card group cursor-pointer overflow-hidden"
                >
                  <div className="h-48 bg-stone-100 relative">
                    {prop.images?.[0] ? (
                      <img src={prop.images[0]} className="w-full h-full object-cover" alt={prop.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 font-serif italic text-3xl">T<span className="text-accent underline">.</span></div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md",
                        prop.available ? "bg-emerald-500/80 text-white" : "bg-stone-800/80 text-white"
                      )}>
                        {prop.available ? 'Listed' : 'Occupied'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-serif font-bold group-hover:text-accent transition-colors">{prop.name}</h3>
                      <MoreHorizontal className="w-5 h-5 text-stone-300" />
                    </div>
                    <div className="flex items-center gap-2 text-stone-400 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest font-bold font-sans">{prop.location}</span>
                    </div>
                    <div className="flex items-end justify-between border-t border-stone-50 pt-4 mt-2">
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase font-bold tracking-widest leading-none">Monthly Rent</p>
                        <p className="text-xl font-serif font-bold text-ink">KES {prop.rentAmount.toLocaleString()}</p>
                      </div>
                      <button className="p-2 rounded-xl bg-stone-50 text-accent group-hover:bg-accent group-hover:text-white transition-all">
                         <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'tenants' && (
        <div className="space-y-12">
           <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold">Active Tenancies</h2>
                <div className="bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" /> Live Ledger Verified
                </div>
              </div>
              
              {tenancies.length === 0 ? (
                <div className="premium-card p-20 text-center space-y-4">
                   <Users className="w-16 h-16 text-stone-200 mx-auto" />
                   <p className="text-stone-500 font-light text-sm italic">You haven't linked any tenants yet.</p>
                   <button 
                     onClick={() => setShowInviteModal(true)}
                     className="text-accent font-bold uppercase tracking-widest text-[10px] hover:underline"
                   >
                     Invite your first tenant
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {tenancies.map(ten => (
                     <div key={ten.id} className="premium-card p-6 border-l-4 border-emerald-500">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h4 className="font-bold text-lg">Unit {ten.unitNumber || 'N/A'}</h4>
                              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">ID: {ten.tenantId?.slice(-6)}</p>
                           </div>
                           <div className="bg-emerald-50 p-2 rounded-full text-emerald-500">
                              <ShieldCheck className="w-4 h-4" />
                           </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-stone-50">
                           <div className="flex justify-between text-xs">
                              <span className="text-stone-400">Monthly Rent</span>
                              <span className="font-bold">KES {ten.rentAmount.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-stone-400">Next Due</span>
                              <span className="font-bold">Day {ten.rentDueDate}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-stone-400">Status</span>
                              <span className={cn(
                                "font-bold uppercase tracking-tighter",
                                ten.rentStatus === 'current' ? "text-emerald-500" : "text-amber-500"
                              )}>{ten.rentStatus}</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </section>

           <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold">Pending Invitations</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-paper rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-400">
                   <Mail className="w-4 h-4" /> Sent invitations
                </div>
              </div>

              {invites.filter(i => i.status === 'pending').length === 0 ? (
                <div className="p-12 bg-paper border border-stone-100 rounded-3xl text-center">
                   <p className="text-xs text-stone-400 font-medium">No pending invitations.</p>
                </div>
              ) : (
                <div className="overflow-hidden premium-card">
                   <table className="w-full text-left">
                      <thead className="bg-stone-50 border-b border-stone-100">
                         <tr>
                            <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-stone-400">Recipient</th>
                            <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-stone-400">Unit</th>
                            <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-stone-400">Rent</th>
                            <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-stone-400">Status</th>
                            <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-stone-400"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                         {invites.map(inv => (
                           <tr key={inv.id} className="hover:bg-stone-50/50 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="font-bold text-sm">{inv.tenantEmail}</div>
                                 <div className="text-[10px] text-stone-400">Sent on {new Date(inv.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">{inv.unitNumber || 'N/A'}</td>
                              <td className="px-6 py-4 text-sm font-bold">KES {inv.rentAmount.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                 <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-sm border border-amber-100">
                                    {inv.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="text-stone-300 hover:text-stone-600">
                                    <MoreHorizontal className="w-5 h-5" />
                                 </button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              )}
           </section>
        </div>
      )}

      <AnimatePresence>
        {showInviteModal && (
          <InviteTenantModal 
            user={user} 
            properties={properties} 
            onClose={() => setShowInviteModal(false)} 
          />
        )}
        {showAddPropertyModal && (
          <AddPropertyModal 
            user={user} 
            onClose={() => setShowAddPropertyModal(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
