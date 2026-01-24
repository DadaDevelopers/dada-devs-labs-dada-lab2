"use client";
import React from 'react';
import { ArrowUp, Users, ArrowLeft, TrendingUp, Calendar } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
export default function ChamasContribution() {
  const currentAmount = 150000;
  const targetAmount = 500000;
  const progress = (currentAmount / targetAmount) * 100;
  const nextContribution = 5000;
  const nextDate = "15th Dec 2025";
  const totalMembers = 8;
  const memberAvatars = Array(8).fill(null);
  const visibleMembers = memberAvatars.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar 
        isAuthenticated={true}
        userName=''
      />
      {/* Back to Home */}
      <div className="w-full max-w-md flex items-center">
        <Link
          href="/userdashboard/chama"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
          <span className="text-lg text-gray-700">Go Back</span>
        </Link>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Group Goal Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Group Savings Goal</h2>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{totalMembers} members</span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-3 mb-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  KES {currentAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Target</p>
                <p className="text-xl font-semibold text-gray-700">
                  KES {targetAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-linear-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600 font-medium">{progress.toFixed(1)}% achieved</span>
                <span className="text-gray-600">KES {(targetAmount - currentAmount).toLocaleString()} remaining</span>
              </div>
            </div>
          </div>

          {/* Next Contribution Info */}
          <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Next Contribution</p>
                <p className="font-semibold text-gray-900">KES {nextContribution.toLocaleString()} due {nextDate}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 text-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 px-2 rounded-xl transition-colors flex items-center justify-center gap-2">
              Contribute 
              <ArrowUp className="w-5 h-5" />
            </button>
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3.5 px-6 rounded-xl transition-colors">
              Request Loan
            </button>
          </div>
        </div>

        {/* Group Info */}
        <div className="bg-[#CFFEEF] rounded-2xl shadow-sm border border-gray-200 p-6">

          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <h2 className="text-gray-900 font-semibold text-lg">
              Group members ({totalMembers})
            </h2>
            <button className="text-teal-700 hover:text-teal-800 font-medium text-sm transition-colors">
              View all members
            </button>
          </div>

          {/* Member Avatars */}
          <div className="flex gap-3 mb-6">
            {visibleMembers.map((_, index) => (
              <div
                key={index}
                className="w-14 h-14 bg-black rounded-full flex shrink-0"
              />
            ))}
          </div>

          {/* About Section */}
          <div className="mb-6">
            <h3 className="text-gray-900 font-semibold text-base mb-2">
              About the Group
            </h3>
            <div className="mb-4">
              <p className="text-gray-900 font-medium text-sm mb-1">Description:</p>
              <ul className="list-disc list-inside text-gray-800 text-sm">
                <li>
                  Youth savings squad pooling money to support side hustles and
                  short-term goals.
                </li>
              </ul>
            </div>

            {/* Frequency and Target */}
            <div className="space-y-1">
              <p className="text-gray-900 text-sm">
                <span className="font-medium">Frequency:</span> Monthly (Contribution
                cycles)
              </p>
              <p className="text-gray-900 text-sm">
                <span className="font-medium">Target Goal:</span>{" "}
                <span className="font-semibold">KES 500,000</span>
              </p>
            </div>
          </div>
          {/* Footer Link */}
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
            Rules & Regulations
          </button>
        </div>
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="bg-emerald-100 rounded-full p-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">John Doe contributed</p>
                <p className="text-xs text-gray-600">15 minutes ago</p>
              </div>
              <p className="font-semibold text-emerald-600">+KES 5,000</p>
            </div>

            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="bg-blue-100 rounded-full p-2">
                <TrendingUp className="w-4 h-4 text-blue-600 transform rotate-180" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Mary Smith repaid loan</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
              <p className="font-semibold text-blue-600">KES 2,500</p>
            </div>

            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="bg-blue-100 rounded-full p-2">
                <TrendingUp className="w-4 h-4 text-blue-600 transform rotate-180" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Mary Smith repaid loan</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
              <p className="font-semibold text-blue-600">KES 2,500</p>
            </div>
          </div>

          <button className="w-full mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm py-2">
            View All Activities
          </button>
        </div>
      </div>
      
    </div>
  );
}