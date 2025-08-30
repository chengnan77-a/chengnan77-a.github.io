
import React from 'react';
import { CameraIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 w-full p-4 z-10 pointer-events-none">
      <div className="mx-auto max-w-max bg-black bg-opacity-60 backdrop-blur-sm text-white py-2 px-6 rounded-lg shadow-lg flex items-center">
        <CameraIcon />
        <h1 className="text-2xl font-bold ml-3">Geo Photo Gallery</h1>
      </div>
    </header>
  );
};

export default Header;
