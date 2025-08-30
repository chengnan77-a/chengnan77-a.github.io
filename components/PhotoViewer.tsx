import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Photo, PhotoType } from '../types';
import { Pannellum } from 'pannellum-react';
import { CloseIcon, EditIcon, FullscreenEnterIcon, FullscreenExitIcon } from './Icons';

interface PhotoViewerProps {
  photo: Photo | null;
  onClose: () => void;
  onUpdateTitle: (photoId: string, newTitle: string) => void;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ photo, onClose, onUpdateTitle }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(photo?.name || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (document.activeElement !== inputRef.current) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (photo) {
      setEditableTitle(photo.name);
      setIsEditingTitle(false); 
    }
  }, [photo]);
  
  useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleToggleFullscreen = useCallback(() => {
    if (!imageContainerRef.current) return;

    if (!document.fullscreenElement) {
        imageContainerRef.current.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  if (!photo) return null;

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (photo && editableTitle.trim() && editableTitle !== photo.name) {
      onUpdateTitle(photo.id, editableTitle.trim());
    } else if (photo) {
      setEditableTitle(photo.name);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleTitleSave();
    } else if (event.key === 'Escape') {
      setEditableTitle(photo.name);
      setIsEditingTitle(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="relative bg-gray-900 shadow-2xl rounded-lg w-11/12 h-5/6 max-w-6xl max-h-screen-90 flex flex-col p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center pb-2 border-b border-gray-700">
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={editableTitle}
              onChange={e => setEditableTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleInputKeyDown}
              className="text-xl font-semibold text-gray-200 truncate bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 w-full mr-4"
              aria-label="Edit photo title"
            />
          ) : (
            <div 
              className="flex items-center group w-full mr-4 cursor-pointer" 
              onClick={() => setIsEditingTitle(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(true)}
            >
              <h2 className="text-xl font-semibold text-gray-200 truncate px-2 py-1">{photo.name}</h2>
              <button
                className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Edit title"
              >
                <EditIcon />
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Close photo viewer"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-grow mt-4 overflow-hidden">
          {photo.type === PhotoType.PANORAMA ? (
            <Pannellum
              width="100%"
              height="100%"
              image={photo.src}
              pitch={10}
              yaw={180}
              hfov={110}
              autoLoad
              showZoomCtrl={true}
              className="pannellum-container"
            >
            </Pannellum>
          ) : (
            <div 
              ref={imageContainerRef}
              className="w-full h-full flex items-center justify-center bg-black cursor-pointer relative group/viewer"
              onClick={handleToggleFullscreen}
            >
              <img 
                src={photo.src} 
                alt={photo.name} 
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFullscreen();
                }}
                className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover/viewer:opacity-100 transition-opacity focus:opacity-100"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoViewer;