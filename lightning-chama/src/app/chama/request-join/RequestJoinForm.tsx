"use client";

import { useState } from "react";
import { requestJoinChama } from "./api";

export default function RequestJoinForm() {
  const [formData, setFormData] = useState({
    chamaCode: "",
    fullName: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.chamaCode || !formData.fullName || !formData.phone) {
      return "All fields are required";
    }
    if (!formData.phone.startsWith("+")) {
      return "Phone number must be in international format";
    }
    return null;
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await requestJoinChama(formData);
      setSuccess(true);
    } catch {
      setError("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center text-green-600 font-medium">
        Request sent successfully 
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {/* Chama Code */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Chama Code
        </label>
        <input
          name="chamaCode"
          placeholder="Enter chama code"
          value={formData.chamaCode}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Full Name
        </label>
        <input
          name="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Phone Number
        </label>
        <input
          name="phone"
          placeholder="+254 7XX XXX XXX"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-sm font-semibold transition disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Request to Join"}
      </button>
    </div>
  );
}
