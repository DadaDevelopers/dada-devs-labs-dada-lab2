'use client';

import { useRouter } from 'next/navigation';

export default function CreateChamaCard() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/create-chama');
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 p-4 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition"
      style={{ marginTop: '478px' }} // pushes it 478px from top of container
    >
      {/* Circle in 64x64 frame */}
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-500 text-white text-2xl font-bold">
        +
      </div>

      {/* Card text */}
      <span className="text-sm font-medium text-gray-700">
        Create Chama
      </span>
    </div>
  );
}
