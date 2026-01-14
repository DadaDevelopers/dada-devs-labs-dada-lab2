'use client';

import { useState } from 'react';
import './MyChamasTabSwitcher.css';

// Import your components
import MyChamasList from './MyChamasList';
import CreateChamaIcon from './CreateChama';
import OtherChamaList from './OtherChamaList';

const MyChamasTabSwitcher = () => {
  const [activeTab, setActiveTab] = useState<'mychamas' | 'discover'>('mychamas');

  return (
    <div className="tab-switcher-wrapper">
      <div className="tab-container">
        <button
          onClick={() => setActiveTab('mychamas')}
          className={`tab-button ${activeTab === 'mychamas' ? 'active' : ''}`}
        >
          My Chamas
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`tab-button ${activeTab === 'discover' ? 'active' : ''}`}
        >
          Discover
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'mychamas' && (
          <div className="content-panel">
            <CreateChamaIcon />
            <MyChamasList />
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="content-panel">
            <OtherChamaList />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChamasTabSwitcher;
