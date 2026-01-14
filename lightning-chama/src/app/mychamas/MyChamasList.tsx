'use client';

import Image from 'next/image';
import './MyChamasList.css';

const chamas = [
  {
    name: 'Chama1',
    description:
      'Youth savings squad pooling money to support side hustles and short-term business goals.',
  },
  {
    name: 'Chama1',
    description:
      'Youth savings squad pooling money to support side hustles and short-term business goals.',
  },
  {
    name: 'Chama1',
    description:
      'Youth savings squad pooling money to support side hustles and short-term business goals.',
  },
];

export default function MyChamasList() {
  return (
    <div className="mychamas-list-container">
      {chamas.map((chama, index) => (
        <div key={index} className="chama-item">
          <div className="chama-icon">
            <Image
              src="/chamaicon.svg"
              alt="Chama icon"
              width={36}
              height={36}
            />
          </div>

          <div className="chama-text">
            <span className="chama-title">{chama.name}</span>
            <span className="chama-description">{chama.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
