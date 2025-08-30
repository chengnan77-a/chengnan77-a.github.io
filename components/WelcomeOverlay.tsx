
import React from 'react';
import { UploadIcon } from './Icons';

const WelcomeOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="text-center bg-black/70 p-10 rounded-xl backdrop-blur-md shadow-2xl max-w-md">
            <h2 className="text-4xl font-bold text-white mb-4">Welcome to Your Photo Map</h2>
            <p className="text-gray-300 text-lg mb-6">
                Bring your photos to life. Upload your images with GPS data, and see them appear on the map.
            </p>
            <div className="flex items-center justify-center text-blue-300 animate-bounce">
                <p className="text-xl mr-2">Start by uploading</p>
                <UploadIcon />
            </div>
        </div>
    </div>
  );
};

export default WelcomeOverlay;
