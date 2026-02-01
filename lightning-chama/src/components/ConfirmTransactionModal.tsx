"use client";

import { useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string;
  data: {
    to: string;
    amount: string;
    amountKsh: string;
    fee: string;
    qrCode?: string;
    memo?: string;
    recipientName?: string;
    recipientWalletType?: string; // New
    recipientActive?: boolean;
  };
};

export default function ConfirmTransactionModal({
  open,
  onClose,
  onConfirm,
  loading,
  error,
  data,
}: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 z-10 animate-scaleUp shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 mt-4">
          Confirm Transaction
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Recipient Info */}
        <div className="bg-gray-50 rounded-2xl overflow-hidden mb-6 border border-gray-100">
            <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Sending To</p>
                
                <div className="flex items-start justify-between">
                    <div>
                        {/* Wallet Name */}
                        <span className="font-bold text-lg text-gray-900 block">{data.recipientName || 'Unknown'}</span>
                        
                        {/* Wallet Type Badge */}
                        {data.recipientWalletType && (
                            <div className="flex gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                                    {data.recipientWalletType.replace(/_/g, ' ')}
                                </span>
                                
                                {/* Status Badge */}
                                {data.recipientActive ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium border border-red-200">
                                        Inactive
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-2 truncate">{data.to}</p>
            </div>

            {/* Amount */}
            <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Amount</span>
                <div className="text-right">
                    <p className="font-bold text-xl text-gray-900">{data.amount}</p>
                    <p className="text-sm text-gray-500 font-medium">{data.amountKsh}</p>
                </div>
            </div>
            </div>

            {/* Memo */}
            {data.memo && (
                <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Memo</span>
                    <span className="text-sm font-medium text-gray-900 max-w-[200px] text-right truncate">
                    {data.memo}
                    </span>
                </div>
                </div>
            )}
        </div>

        {/* Fee */}
        <div className="flex justify-between items-center px-2 mb-6">
            <span className="text-gray-600 font-medium">Network Fee</span>
            <span className="text-gray-900 font-semibold">{data.fee}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
            <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
            >
            Cancel
            </button>
            <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Confirm Send"}
            </button>
        </div>
      </div>
    </div>
  );
}