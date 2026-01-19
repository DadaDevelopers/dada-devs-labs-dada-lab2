"use client";
import { useState } from 'react';
import { ArrowLeft,ImageUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import React from 'react';
import Link from 'next/link';

export default function CreateChama() {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    logo: File | null;
    termsAccepted: boolean;
  }>({
    name: '',
    description: '',
    logo: null,
    termsAccepted: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  const handleSubmit = () => {
    if (!formData.termsAccepted) {
      alert('Please accept the terms & policy');
      return;
    }
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <Navbar 
        isAuthenticated={true}
        userName=''
      />
      {/* Back to Home */}
      <div className="w-full max-w-md flex p-2 items-center">
        <Link
          href="/userdashboard/chama"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
          <span className="text-sm">Go Back</span>
        </Link>
      </div>
      {/* Main Content */}
      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create a Chama</h1>
          <p className="text-gray-600 text-sm">Set up your group and start saving together</p>
        </div>

        {/* Form Section */}
        <div>
          <h2 className="text-base text-center font-semibold text-gray-900 mb-6">
            Provide details about your Chama.
          </h2>

          {/* Chama Name Input */}
          <div className="mb-5">
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
              Chama Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Input your Chama name"
              className="w-full px-4 py-3 text-gray-600 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-sm"
            />
          </div>

          {/* Description Input */}
          <div className="mb-5">
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Short description of your Chama"
              rows={3}
              className="w-full px-4 py-3 text-gray-600 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Logo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Upload Logo (Optional)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageUp className="w-8 h-8 text-gray-400" />
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <span className="inline-block px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Select a logo image
                </span>
              </label>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleCheckboxChange}
                className="w-5 h-5 mt-0.5 border-2 border-teal-600 rounded text-teal-600 focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">
                I understood the{' '}
                <a href="#" className="text-teal-600 hover:underline">
                  terms & policy
                </a>
                .
              </span>
            </label>
          </div>

          {/* Next Button */}
          <Link href="/userdashboard/chama/createchama/nextcreatechama">
            <button
                onClick={handleSubmit}
                className="w-full bg-[#059669] hover:bg-teal-800 text-white font-semibold py-3.5 px-4 rounded-lg transition-colors"
            >
                Next
            </button>
          </Link>
        </div>
      </main>

      {/* Bottom Indicator */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
      </div>
    </div>
  );
}