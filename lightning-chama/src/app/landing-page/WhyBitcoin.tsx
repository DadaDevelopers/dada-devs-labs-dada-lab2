"use client";

export default function WhyBitcoin() {
  return (
    <section className="w-full bg-blue-50 py-16 px-6 border-t">
      <div className="max-w-4xl mx-auto">

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
          Why Bitcoin for Chamas?
        </h2>

        <p className="text-gray-600 text-center max-w-2xl mx-auto mt-3">
          Bitcoin isn’t just digital money. It’s a transparent, secure way to manage group finances.
        </p>

        {/* Bullet Points */}
        <div className="mt-10 space-y-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-green-600 text-xl">✔</span>
            <p className="text-gray-700">No hidden fees or charges</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-green-600 text-xl">✔</span>
            <p className="text-gray-700">Complete transaction transparency</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-green-600 text-xl">✔</span>
            <p className="text-gray-700">Instant global settlements</p>
          </div>
        </div>

      </div>
    </section>
  );
}
