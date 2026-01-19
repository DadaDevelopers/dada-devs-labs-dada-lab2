"use client";
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default function CreateChamaForm() {
  const [formData, setFormData] = useState({
    contributionAmount: '',
    contributionFrequency: '',
    dueDate: '',
    purpose: '',
    targetAmount: '',
    membersRequired: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Creating Chama:', formData);
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <Navbar 
        isAuthenticated={true}
        userName=''
      />
      {/* Back to Home */}
      <div className="w-full max-w-md flex p-3 items-center">
        <Link
          href="/userdashboard/chama/createchama"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
          <span className="text-sm">Go Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Title Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create a Chama</h1>
          <p className="text-gray-600 text-sm">Set up your group and start saving together</p>
        </div>

        {/* Contribution Rules Section */}
        <div className="mb-6">
          <h2 className="text-center text-base font-semibold text-gray-900 mb-4">
            Contribution Rules
          </h2>

          {/* Contribution Amount */}
          <div className="mb-4">
            <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-900 mb-2">
              Contribution Amount (KES)
            </label>
            <input
              type="text"
              id="contributionAmount"
              name="contributionAmount"
              value={formData.contributionAmount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-gray-200 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-md"
            />
          </div>

          {/* Contribution Frequency */}
          <div className="mb-4">
            <label htmlFor="contributionFrequency" className="block text-sm font-medium text-gray-900 mb-2">
              Contribution Frequency
            </label>
            <input
              type="text"
              id="contributionFrequency"
              name="contributionFrequency"
              value={formData.contributionFrequency}
              onChange={handleInputChange}
              placeholder="monthly, weekly..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-md text-gray-600"
            />
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-900 mb-2">
              Due Date
            </label>
            <input
              type="text"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              placeholder="Choose due date for contributions"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-md text-gray-600"
            />
          </div>
        </div>

        {/* Saving Goals Section */}
        <div className="mb-6">
          <h2 className="text-center text-base font-semibold text-gray-900 mb-4">
            Saving Goals
          </h2>

          {/* Purpose of the Chama */}
          <div className="mb-4">
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-900 mb-2">
              Purpose of the Chama
            </label>
            <input
              type="text"
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="What is the purpose of your Chama?"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-md text-gray-600"
            />
          </div>

          {/* Target Amount */}
          <div className="mb-4">
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-900 mb-2">
              Target Amount (KES)
            </label>
            <input
              type="text"
              id="targetAmount"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-md text-gray-600"
            />
          </div>

          {/* Members Required */}
          <div className="mb-6">
            <label htmlFor="membersRequired" className="block text-sm font-medium text-gray-900 mb-2">
              Members Required
            </label>
            <input
              type="text"
              id="membersRequired"
              name="membersRequired"
              value={formData.membersRequired}
              onChange={handleInputChange}
              placeholder="max 20 people"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-md text-gray-600"
            />
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#059669] hover:bg-teal-800 text-white font-semibold py-3.5 px-4 rounded-lg transition-colors"
        >
          Create Chama
        </button>
      </main>

      {/* Bottom Indicator */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
      </div>
    </div>
  );
}