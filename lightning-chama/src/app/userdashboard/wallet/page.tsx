"use client";
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import BalanceHero from '@/components/BalanceHero';
// Main Wallet Page Component
const WalletPage = () => {
  const transactions = [
    {
      id: 1,
      type: "Contribution",
      description: "John Doe contributed KES 5,000.00",
      time: "15 minutes ago"
    },
    {
      id: 2,
      type: "Loan Repayment",
      description: "Mary Smith repaid KES 2,500.00",
      time: "2 hours ago"
    },
    {
      id: 3,
      type: "Loan Repayment",
      description: "Mary Smith repaid KES 2,500.00",
      time: "2 hours ago"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar 
        isAuthenticated={true}
        userName=''
      />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Balance Hero Section - Imported Component */}
        <BalanceHero 
          btcAmount="0.01295" 
          kshAmount="150,000.00"
          nextContribution={{
            date: "15th December 2025",
            amount: "KES 5,000.00"
          }}
          className="mb-6"
        />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-8">
          <Link href="/userdashboard/wallet/send" className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-700 transition shadow-md">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Send</span>
          </Link>
          
          <button className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-700 rounded-full flex items-center justify-center hover:bg-teal-800 transition shadow-md">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 7L17 17M17 17H7M17 17V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Receive</span>
          </button>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition">
                <div className="w-10 h-10 bg-[#FFF4D2] rounded-2xl flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    <span className="font-semibold">{transaction.type}:</span> {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WalletPage;