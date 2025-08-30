
import React, { useRef } from 'react';
import { UploadIcon, SpinnerIcon } from './Icons';

interface PhotoUploaderProps {
  onFilesSelected: (files: FileList | null) => void;
  isLoading: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onFilesSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(event.target.files);
    event.target.value = ''; // Reset input to allow re-uploading the same file
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png"
        multiple
      />
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className="absolute bottom-6 right-6 z-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-full shadow-lg flex items-center transition-all duration-300 transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <SpinnerIcon />
            <span className="ml-2">Processing...</span>
          </>
        ) : (
          <>
            <UploadIcon />
            <span className="ml-2">Upload Photos</span>
          </>
        )}
      </button>
    </>
  );
};

export default PhotoUploader;
