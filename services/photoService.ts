
import exifr from 'exifr';
import { Photo, PhotoType } from '../types';

interface ProcessedImageOutput {
  newPhotos: Photo[];
  errors: string[];
}

const processImageFile = async (file: File): Promise<Photo | null> => {
  try {
    const metadata = await exifr.parse(file, {
      xmp: true,
      gps: true,
    });

    if (!metadata || !metadata.latitude || !metadata.longitude) {
      console.warn(`File ${file.name} is missing GPS data.`);
      return null;
    }

    const isPanorama = metadata.ProjectionType === 'equirectangular';
    const photoType = isPanorama ? PhotoType.PANORAMA : PhotoType.NORMAL;

    const newPhoto: Photo = {
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      src: URL.createObjectURL(file),
      type: photoType,
      coordinates: {
        lat: metadata.latitude,
        lng: metadata.longitude,
      },
    };
    return newPhoto;
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    return null;
  }
};


export const processImageFiles = async (files: File[]): Promise<ProcessedImageOutput> => {
    const results = await Promise.all(files.map(processImageFile));
    
    const newPhotos: Photo[] = [];
    const errors: string[] = [];

    files.forEach((file, index) => {
        const photo = results[index];
        if (photo) {
            newPhotos.push(photo);
        } else {
            errors.push(file.name);
        }
    });

    return { newPhotos, errors };
}
