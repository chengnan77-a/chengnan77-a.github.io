
export enum PhotoType {
  NORMAL = 'NORMAL',
  PANORAMA = 'PANORAMA',
}

export interface Photo {
  id: string;
  name: string;
  src: string;
  type: PhotoType;
  coordinates: {
    lat: number;
    lng: number;
  };
}
