"use client";

import { useState } from "react";

export default function CreatePinForm() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pin !== confirmPin) {
      setError("PIN and Confirm PIN must match");
      return;
    }

    if (!accepted) {
      setError("Please accept the terms & policy");
      return;
    }

    setError("");
    alert("PIN created successfully ✅ (UI only)");
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-1 bg-white text-black">
        Create Account
      </h2>
      <p className="text-center text-gray-500 mb-6">Create PIN/Password</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter your full name"
          className="w-full border rounded-md p-3 bg-white text-black"
          required
        />

        <input
          type="email"
          placeholder="example@gmail.com"
          className="w-full border rounded-md p-3 bg-white text-black"
          required
        />

        <input
          type="password"
          placeholder="New PIN"
          className="w-full border rounded-md p-3 bg-white text-black"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm PIN"
          className="w-full border rounded-md p-3 bg-white text-black"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          required
        />

        <label className="flex items-center gap-2 text-sm bg-white text-black">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          I understand the{" "}
          <span className="text-green-600 cursor-pointer">terms & policy</span>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
