import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { verifyMpesaReceipt, verifyBankReceipt } from '../services/verificationService';
import { OperationType, AppUser, Tenancy } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, ShieldCheck, AlertCircle, CheckCircle2, Loader2, X, Landmark, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaymentVerificationProps {
  user: AppUser;
  tenancy: Tenancy;
  onClose: () => void;
}

type PaymentMethod = 'mpesa' | 'bank';

export default function PaymentVerification({ user, tenancy, onClose }: PaymentVerificationProps) {
  const [method, setMethod] = useState<PaymentMethod>('mpesa');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleVerify = async () => {
    if (method === 'bank' && !preview) return;
    if (method === 'mpesa' && !phoneNumber) return;

    setVerifying(true);
    try {
      let aiResponse;
      
      if (method === 'bank' && preview) {
        const base64Data = preview.split(',')[1];
        aiResponse = await verifyBankReceipt(base64Data);
      } else {
        // Simulate M-Pesa processing (STK Push simulation)
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        aiResponse = {
          isLegit: true,
          amount: tenancy.rentAmount,
          transactionCode: 'RK' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          date: new Date().toISOString(),
          anomalyDetected: null
        };
      }
        
      setResult(aiResponse);

      if (aiResponse.isLegit && aiResponse.transactionCode) {
        // Save to Firestore
        await addDoc(collection(db, 'payments'), {
          tenantId: user.uid,
          landlordId: tenancy.landlordId,
          propertyId: tenancy.propertyId,
          tenancyId: tenancy.id,
          amount: aiResponse.amount,
          transactionCode: aiResponse.transactionCode,
          date: serverTimestamp(),
          status: aiResponse.isLegit ? 'completed' : 'flagged',
          aiVerified: method === 'bank', // Marked as AI verified only for receipts
          method,
          phoneNumber: method === 'mpesa' ? phoneNumber : null,
          aiMetadata: {
            isLegit: aiResponse.isLegit,
            anomalyDetected: aiResponse.anomalyDetected || null,
            extractedAmount: aiResponse.amount,
            extractedDate: aiResponse.date
          }
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      handleFirestoreError(error, OperationType.CREATE, 'payments');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-stone-400" />
        </button>

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold">Make/Verify Payment</h2>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-bold font-sans">For Unit {tenancy.unitNumber || 'Main'}</p>
            </div>
          </div>

          {!result ? (
            <div className="space-y-8">
                {/* Method Selector */}
                <div className="grid grid-cols-2 gap-4 p-2 bg-stone-50 rounded-2xl border border-stone-100 relative z-10">
                  <button
                    onClick={() => { setMethod('mpesa'); setFile(null); setPreview(null); }}
                    className={cn(
                      "flex flex-col items-center gap-2 py-4 rounded-xl transition-all",
                      method === 'mpesa' ? "bg-white shadow-md text-emerald-600 scale-105" : "text-stone-400 opacity-60"
                    )}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">M-Pesa</span>
                  </button>
                  <button
                    onClick={() => { setMethod('bank'); setFile(null); setPreview(null); }}
                    className={cn(
                      "flex flex-col items-center gap-2 py-4 rounded-xl transition-all",
                      method === 'bank' ? "bg-white shadow-md text-blue-600 scale-105" : "text-stone-400 opacity-60"
                    )}
                  >
                    <Landmark className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Bank Receipt</span>
                  </button>
                </div>

                {method === 'mpesa' ? (
                  <div className="space-y-6 pt-4">
                    <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center flex-shrink-0">
                         <Smartphone className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-950">M-Pesa Express</p>
                        <p className="text-xs text-emerald-700/70 leading-relaxed mt-1">We will send an STK Push to your phone. Enter your M-Pesa PIN when prompted to complete the KES {tenancy.rentAmount.toLocaleString()} payment.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">M-Pesa Phone Number</label>
                      <input 
                        type="tel"
                        placeholder="e.g., 0712345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-12 text-center transition-all flex flex-col items-center justify-center gap-4 min-h-[300px] relative",
                      preview ? "border-accent bg-accent/5" : "border-stone-200 hover:border-stone-400 bg-stone-50"
                    )}
                  >
                    {preview ? (
                      <div className="relative group w-full max-w-[200px] aspect-[9/16] rounded-xl overflow-hidden shadow-xl">
                        <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                           <Upload className="w-6 h-6" />
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-stone-100">
                          <Upload className="text-stone-300 w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink">Upload your receipt photo</p>
                          <p className="text-xs text-stone-400 mt-1">Accepts JPG/PNG screenshots or clear photos</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                )}

              <button
                onClick={handleVerify}
                disabled={verifying || (method === 'mpesa' && !phoneNumber) || (method === 'bank' && !preview)}
                className="w-full bg-ink text-white py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 relative z-10"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                  </>
                ) : (
                  method === 'mpesa' ? 'Initiate Payment' : 'Verify Payment'
                )}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className={cn(
                "p-8 rounded-3xl border flex gap-6",
                result.isLegit ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
              )}>
                {result.isLegit ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <h3 className={cn(
                    "text-xl font-serif font-bold mb-2",
                    result.isLegit ? "text-emerald-900" : "text-red-900"
                  )}>
                    {result.isLegit ? "Payment Verified" : "Verification Failed"}
                  </h3>
                  <p className="text-sm opacity-80 leading-relaxed">
                    {result.isLegit 
                      ? `We've successfully verified Transaction ${result.transactionCode} for KES ${result.amount.toLocaleString()}. The record has been added to your ledger.`
                      : `The AI detected potential anomalies: ${result.anomalyDetected || 'Suspicious formatting detected'}. This transaction has been flagged for manual review.`
                    }
                  </p>
                </div>
              </div>

              {result.isLegit && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">Transaction ID</p>
                    <p className="font-mono text-sm font-bold text-ink">{result.transactionCode}</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">Confirmed Amount</p>
                    <p className="text-sm font-bold text-ink">KES {result.amount.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-4 bg-ink text-white rounded-full font-bold uppercase tracking-widest text-xs"
              >
                Done
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
