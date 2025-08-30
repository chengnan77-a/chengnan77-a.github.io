
import React, { useState, useCallback } from 'react';
import { Photo } from './types';
import { processImageFiles } from './services/photoService';
import MapComponent from './components/MapComponent';
import PhotoViewer from './components/PhotoViewer';
import PhotoUploader from './components/PhotoUploader';
import Header from './components/Header';
import WelcomeOverlay from './components/WelcomeOverlay';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null);

    const { newPhotos, errors } = await processImageFiles(Array.from(files));

    setPhotos(prevPhotos => {
      const existingIds = new Set(prevPhotos.map(p => p.id));
      const uniqueNewPhotos = newPhotos.filter(p => !existingIds.has(p.id));
      return [...prevPhotos, ...uniqueNewPhotos];
    });

    if (errors.length > 0) {
      setError(`Could not process ${errors.length} file(s). Make sure they are valid images with GPS data.`);
    }

    setIsLoading(false);
  }, []);

  const handleSelectPhoto = useCallback((photo: Photo | null) => {
    setSelectedPhoto(photo);
  }, []);

  const handleUpdatePhotoTitle = useCallback((photoId: string, newTitle: string) => {
    setPhotos(prevPhotos =>
      prevPhotos.map(p =>
        p.id === photoId ? { ...p, name: newTitle } : p
      )
    );
    if (selectedPhoto && selectedPhoto.id === photoId) {
      setSelectedPhoto(prev => (prev ? { ...prev, name: newTitle } : null));
    }
  }, [selectedPhoto]);

  return (
    <div className="relative h-screen w-screen bg-gray-900 text-white overflow-hidden">
      <MapComponent photos={photos} onSelectPhoto={handleSelectPhoto} />
      <Header />
      <PhotoUploader onFilesSelected={handleFilesSelected} isLoading={isLoading} />

      {photos.length === 0 && !isLoading && <WelcomeOverlay />}

      {error && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white py-2 px-4 rounded-lg shadow-lg animate-pulse"
          onClick={() => setError(null)}
          role="alert"
        >
          {error}
        </div>
      )}
      
      <PhotoViewer 
        photo={selectedPhoto} 
        onClose={() => handleSelectPhoto(null)}
        onUpdateTitle={handleUpdatePhotoTitle}
      />
    </div>
  );
};

export default App;
