"use client";


type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    to: string;
    amount: string;
    amountKsh: string;
    fee: string;
    qrCode?: string;
  };
};

export default function ConfirmTransactionModal({
  open,
  onClose,
  onConfirm,
  data,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50  flex items-end sm:items-center justify-center">
      <div className="bg-gray-50 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 mt-20">
        <h2 className="text-2xl font-bold text-center text-gray-600 mb-6 mt-10">
          Send this transaction?
        </h2>

        {/* QR */}
        <div className="bg-white rounded-2xl p-4 flex justify-center mb-6">
          <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
            {data.qrCode ? (
              <img src={data.qrCode} alt="QR" />
            ) : (
              <span className="text-gray-400 text-sm">Invoice QR</span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl overflow-hidden mb-6">
          <div className="p-4 border-b">
            <p className="text-xl text-gray-500">To</p>
            <p className="text-gray-700 break-all">{data.to}</p>
          </div>

          <div className="p-4 mb-4">
            <div className="flex justify-between">
              <span className="text-xl text-gray-500">Amount</span>
              <div className="text-right">
                <p className="font-medium text-gray-400">{data.amount}</p>
                <p className="text-sm text-gray-500">{data.amountKsh}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fee */}
        <div className="bg-white rounded-2xl px-6 py-4 flex justify-between mb-6">
          <span className="text-gray-600">Fee</span>
          <span className="text-gray-400">{data.fee}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 ">
          <button
            onClick={onClose}
            className="flex-1 py-3 border bg-orange-600 rounded-xl text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3  border border-emerald-400 rounded-xl bg-green-600 text-gray-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
