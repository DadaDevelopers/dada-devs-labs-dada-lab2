import Image from 'next/image';

export default function OtherChamaList() {
  const otherChamas = [
    { id: 1, name: 'Chama1', icon: '/chamaone.svg', description: 'Youth savings chama1 pooling money to support their folks and shift from business goals.' },
    { id: 2, name: 'Chama1', icon: '/chamatwo.svg', description: 'Youth savings chama1 pooling money to support their folks and shift from business goals.' },
    { id: 3, name: 'Chama1', icon: '/chamathree.svg', description: 'Youth savings chama1 pooling money to support their folks and shift from business goals.' },
    { id: 4, name: 'Chama1', icon: '/chamafour.svg', description: 'Youth savings chama1 pooling money to support their folks and shift from business goals.' },
  ];

  return (
    <div className="mt-4 space-y-2.5 w-full max-w-[390px] mx-auto">
      {otherChamas.map((chama) => (
        <div
          key={chama.id}
          /* Strictly border-bottom only, no top or side borders */
          className="bg-white px-4 min-h-[72px] border-b-[0.5px] border-[#E5E7EB] border-t-0 border-x-0 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center p-2 shrink-0">
            <Image 
              src={chama.icon} 
              alt={chama.name} 
              width={24} 
              height={24}
              className="w-full h-full"
            />
          </div>

          <div className="flex-1 min-w-0 py-2">
            <h3 className="font-semibold text-gray-900 text-sm">{chama.name}</h3>
            <p className="text-[11px] text-gray-600 leading-tight line-clamp-2">
              {chama.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}