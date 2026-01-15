'use client';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Users } from 'lucide-react';
import BalanceHero from '@/components/BalanceHero';
import { Navbar } from '@/components/Navbar';
import Image from 'next/image';
import chama0 from '@/assets/chama0.svg';
import chama1 from '@/assets/chama1.svg';
import chama2 from '@/assets/chama2.svg';
import chama3 from '@/assets/chama3.svg';


// Main Dashboard Component
export default function Dashboard() {
  const activities = [
    { id: 1, action: "Joined Chama0", time: "1 hour ago" },
    { id: 2, action: "Sent 0.0001 BTC", time: "2 hours ago" },
    { id: 3, action: "Joined Chama0", time: "1 hour ago" },
    { id: 4, action: "Sent 0.0001 BTC", time: "2 hours ago" },
    { id: 5, action: "Sent 0.0001 BTC", time: "2 hours ago" },
  ];

  const featuredChamas = [
    { id: 0, name: 'chama0', image: chama0 },
    { id: 1, name: 'chama1', image: chama1 },
    { id: 2, name: 'chama2', image: chama2 },
    { id: 3, name: 'chama3', image: chama3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      < Navbar 
        isAuthenticated={true}
        userName=''
        />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Balance Hero Section */}
        <BalanceHero 
          btcAmount="0.00043" 
          kshAmount="4,996.12" 
          className="mb-6"
        />

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-8">
          <button className="bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center gap-2">
            <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.04175 21.25L21.9584 8.75M21.9584 8.75H9.04175M21.9584 8.75V21.25" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Send</span>
          </button>
          <button className="bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13.3333L12 20M12 20L5 13.3333M12 20L12 4" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Receive</span>
          </button>
          <button className="bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center gap-2">
            <svg width="40" height="29" viewBox="0 0 40 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M38.0986 8.16406V19.5693L25.0781 24.0156L14.252 19.4648L14.1191 19.7773L13.5391 19.8643V23.8096L7.26953 27.6631L1 23.8086V16.042L4.42969 13.9336L4.59082 13.834L4.64648 13.6533L6.03613 9.0918L13.4277 1.91113L27.458 1.00977L38.0986 8.16406ZM14.5918 6.57031L7.82227 11.5264H6.19434L7.7002 12.4521L13.5391 16.041V17.5303L14.333 16.9521L15.8643 15.8379L24.1064 17.6396L24.501 17.7256L24.668 17.3594L27.2061 11.8066L27.3105 11.5771L27.1885 11.3574L24.6328 6.73145L24.4893 6.47363H14.7236L14.5918 6.57031Z" fill="white" stroke="#059669"/>
            <path d="M13.5391 23.809L7.26953 27.6625L1.4541 24.0873L13.5391 16.6556V23.809Z" fill="#BBD8FF" stroke="#059669"/>
            <path d="M8.98086 16.182H5.59734L4.75146 18.0315L5.59734 19.881H8.98086L9.82673 21.7305L8.98086 23.5818H5.59734M7.2891 16.182V15.2572M7.2891 24.5066V23.5818" stroke="#059669" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14.0577 23.5818V24.0442L7.28902 28.2056L0.516918 24.0442L0.5 15.7621L7.26703 11.6007L11.8686 14.2788" stroke="#059669" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7.98584 12.0169L14.8865 6.97327H24.1946L26.7508 11.5989L24.2132 17.1511L15.751 15.3016L13.2134 17.1511L14.0592 19.9254L25.059 24.551L38.5982 19.9272" stroke="#059669" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M38.5986 7.89803L27.5971 0.5L13.2121 1.42475L5.59581 8.82278L4.16797 13.5076" stroke="#059669" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Contribute</span>
          </button>
          <button className="bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center gap-2">
            <svg width="29" height="27" viewBox="0 0 29 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.735 10.1354C13.2399 10.1354 15.2705 7.97846 15.2705 5.31771C15.2705 2.65696 13.2399 0.5 10.735 0.5C8.23008 0.5 6.19946 2.65696 6.19946 5.31771C6.19946 7.97846 8.23008 10.1354 10.735 10.1354Z" stroke="#059669" stroke-linecap="round"/>
            <path d="M17.5706 6.28126C17.8071 5.83939 18.1236 5.45159 18.5018 5.14016C18.8799 4.82874 19.3124 4.59985 19.7742 4.46668C20.236 4.3335 20.718 4.29867 21.1925 4.36418C21.6671 4.4297 22.1247 4.59427 22.5391 4.84842C22.9535 5.10257 23.3165 5.44128 23.6072 5.84504C23.8978 6.24881 24.1104 6.70966 24.2327 7.20107C24.3551 7.69247 24.3846 8.20472 24.3198 8.70832C24.255 9.21192 24.097 9.69693 23.855 10.1354C23.3705 11.0134 22.5786 11.6522 21.6523 11.9123C20.726 12.1725 19.7404 12.0329 18.9106 11.524C18.0808 11.0151 17.4742 10.1782 17.2232 9.19603C16.9722 8.21382 17.097 7.16601 17.5706 6.28126Z" stroke="#059669"/>
            <path d="M18.3984 25.0885V26.0153H3.07129V25.0885H18.3984ZM1.36328 24.2194C1.46139 24.5575 1.70983 24.8504 2.07129 24.9938V25.9498C1.24711 25.7399 0.573919 25.0257 0.505859 24.0739L1.36328 24.2194ZM20.9629 24.0739C20.8941 25.0259 20.2219 25.7398 19.3984 25.9498V24.9938C19.7596 24.8504 20.0063 24.5573 20.1045 24.2194L20.9629 24.0739ZM10.2344 14.4635C6.94337 14.5994 4.8723 16.0756 3.55371 17.8776C2.29373 19.5989 1.69698 21.6514 1.41406 23.2135L0.608398 23.0758C0.903126 21.4213 1.54055 19.1836 2.92773 17.2848L2.92676 17.2838C4.40402 15.267 6.70194 13.6734 10.2344 13.5358V14.4635ZM11.2344 13.5358C14.7675 13.6732 17.0647 15.2679 18.542 17.2867V17.2877C19.9302 19.1842 20.5648 21.4223 20.8594 23.0758L20.0547 23.2135C19.7718 21.6501 19.176 19.5989 17.916 17.8776C16.5956 16.0736 14.5257 14.5991 11.2344 14.4635V13.5358Z" fill="#090909" stroke="#059669"/>
            <path d="M25.4651 25.0889V26.0156H21.1565C21.4024 25.7487 21.6029 25.4366 21.7434 25.0889H25.4651ZM28.0579 23.8594C28.0704 24.8982 27.3614 25.7218 26.4651 25.9502V24.9961C26.8784 24.8345 27.1422 24.478 27.2161 24.083L28.0579 23.8594ZM20.6155 25.0889C20.3281 25.5188 19.8911 25.8236 19.3987 25.9492V25.0889H20.6155ZM20.9602 24.0889H20.8762L20.9622 24.0732C20.9618 24.0785 20.9606 24.0836 20.9602 24.0889ZM18.886 17.7871C20.0384 19.569 20.5923 21.5666 20.8616 23.0762L20.0559 23.2129C19.7915 21.7536 19.2511 19.8719 18.1584 18.2295L18.3938 18.0713C18.5498 17.9663 18.7138 17.8713 18.886 17.7871ZM21.2131 15.4736C23.3163 15.6382 24.8273 16.8345 25.8889 18.3369V18.3359C26.9028 19.7735 27.5135 21.4914 27.8762 22.873L27.0823 23.084C26.7356 21.7799 26.168 20.2077 25.2542 18.917H25.2532C24.3164 17.5907 23.022 16.5648 21.2131 16.4043V15.4736ZM18.2581 16.916C18.2716 16.9328 18.2847 16.9499 18.2981 16.9668C18.2947 16.9686 18.2917 16.9709 18.2883 16.9727L18.2561 16.918L18.2581 16.916ZM17.0002 16.7676L16.9885 16.7793L16.9651 16.7529L16.9836 16.7402L17.0002 16.7676ZM20.2131 16.4023C19.8778 16.4321 19.5616 16.4939 19.262 16.5791C19.0732 16.3279 18.8724 16.0816 18.6575 15.8428L18.636 15.8184C19.122 15.6369 19.6467 15.517 20.2131 15.4727V16.4023Z" fill="#090909" stroke="#059669"/>
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-900">My Chamas</span>
          </button>
        </div>
        {/* Featured Chamas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xm font-semibold text-[#191919]">Featured Chamas</h2>
            <button className="text-[#3B82F6] text-sm font-medium hover:text-emerald-700">
              View more
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 md:gap-6">
            {featuredChamas.map((chama) => (
                <div key={chama.id} className="flex flex-col items-center gap-2">

                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden cursor-pointer hover:scale-105 transition shadow-sm">
                    <Image
                    src={chama.image}
                    alt={chama.name}
                    className="object-cover"
                    priority={chama.id === 0}
                    />
                </div>

                <span className="text-xs md:text-sm text-gray-700">
                    {chama.name}
                </span>
                </div>
            ))}
            </div>
        </div>

        {/* Recent Activities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xm font-semibold text-[#191919]">Recent Activities</h2>
            <button className="text-[#3B82F6] text-sm font-medium hover:text-emerald-700">
              See all
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs md:text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}