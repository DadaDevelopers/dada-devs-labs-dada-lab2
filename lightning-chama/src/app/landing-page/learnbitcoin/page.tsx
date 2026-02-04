"use client";
import Link from 'next/link';
import { ArrowLeft, Zap, Shield, Eye, Globe, CheckCircle } from 'lucide-react';

export default function LearnAboutBitcoin() {
  const features = [
    {
      icon: Zap,
      title: "Fast",
      description: "Money moves almost instantly"
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Protected and hard to interfere with"
    },
    {
      icon: Eye,
      title: "Transparent",
      description: "Records are clear and checkable"
    },
    {
      icon: Globe,
      title: "Global",
      description: "Works anywhere, not limited to one country"
    }
  ];

  const whatYouDont = [
    "Buy Bitcoin",
    "Trade Bitcoin",
    "Understand complex technology"
  ];

  const whatYouGet = [
    "Clear and trackable Chama savings",
    "Properly recorded transactions",
    "Normal saving experience",
    "Focus on your Chama, not tech"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4  sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <button 
              onClick={() => window.history.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Learn About Bitcoin</h1>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl py-10 px-8 p-8 mb-8 text-center shadow-lg">
          
          <h2 className="text-3xl font-bold text-white mb-3">Bitcoin is Digital Money</h2>
          <p className="text-lg text-white/90 max-w-xl mx-auto">
            It works like cash, but moves through the internet instead of your wallet
          </p>
        </div>

        {/* What is Bitcoin */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Simple Explanation</h3>
          <p className="text-base text-gray-700 leading-relaxed">
            With Bitcoin, people send and receive money directly, without going through banks or many middlemen. 
            It is a new way to move value that is built for the digital age.
          </p>
        </div>

        {/* Why Bitcoin is Useful */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Bitcoin is Useful</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bitcoin in Chama Vault */}
        <div className="bg-emerald-100 rounded-xl shadow-sm p-6 mb-6 border border-emerald-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">CV</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-1">Bitcoin in Chama Vault</h3>
              <p className="text-sm text-emerald-700">
                Working behind the scenes to make your Chama better
              </p>
            </div>
          </div>
          
          <p className="text-base text-emerald-700 leading-relaxed mb-4">
            In Chama Vault, Bitcoin is used <span className="font-semibold">behind the scenes</span> to help manage 
            Chama funds safely and efficiently. You use the app normally — Bitcoin just makes it work better.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* You DON'T Need To */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">✗</span>
              </div>
              <h3 className="font-semibold text-gray-900">You DONT Need To:</h3>
            </div>
            <ul className="space-y-3">
              {whatYouDont.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What You Get */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-700">What You Get:</h3>
            </div>
            <ul className="space-y-3">
              {whatYouGet.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="bg-emerald-100 rounded-xl p-6 px-8 py-10 text-center shadow-lg">
          <h3 className="text-xl font-bold text-emerald-700 mb-2">In Simple Terms</h3>
          <p className="text-lg text-emerald-700 leading-relaxed max-w-2xl mx-auto">
            Bitcoin helps Chama Vault move money <span className="font-bold">safely and quickly</span> — 
            while you focus on saving together
          </p>
        </div>

        {/* CTA Button */}
        <div className="mt-8 text-center">
        <Link href="/">
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition shadow-md"
          >
            Got It! Go Back
          </button>
          </Link>
        </div>
      </main>
    </div>
  );
}