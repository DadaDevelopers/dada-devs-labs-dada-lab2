'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateChamaPage() {
  const router = useRouter();
  const [chamaName, setChamaName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend only for now, just log to console
    console.log('Chama Name:', chamaName);
    console.log('Description:', description);

    // Optionally navigate back to home or next page
    router.push('/'); // Can change later when API is ready
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Create a New Chama</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6 flex flex-col gap-4"
      >
        <div>
          <label htmlFor="chamaName" className="block text-sm font-medium text-gray-700">
            Chama Name
          </label>
          <input
            id="chamaName"
            type="text"
            value={chamaName}
            onChange={(e) => setChamaName(e.target.value)}
            required
            placeholder="Enter chama name"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a brief description"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition"
        >
          Create Chama
        </button>
      </form>
    </div>
  );
}
