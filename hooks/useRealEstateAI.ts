
// Add React import to resolve missing namespace error for ChangeEvent type
import React, { useState } from 'react';
import { uploadToGCS } from '../services/storage';

export const MODES = [
  'Renovation (Cải tạo)',
  'Virtual Staging (Nội thất ảo)',
  'Sketch to 3D (Phác thảo)',
  'Aerial Transformation (Toàn cảnh)'
];

export const ROOM_TYPES = [
  'Phòng Ngủ Master',
  'Phòng Khách',
  'Phòng Bếp',
  'Phòng Làm Việc',
  'Sân Vườn',
  'Mặt Tiền Nhà'
];

export const STYLES = [
  'Indochine',
  'Minimalism',
  'Modern Luxury',
  'Scandinavian',
  'Classic',
  'Industrial'
];

export const useRealEstateAI = () => {

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [faceLock, setFaceLock] = useState(false);

  const [mode, setMode] = useState(MODES[0]);
  const [roomType, setRoomType] = useState(ROOM_TYPES[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState('Giữ nguyên');
  const [extraPrompt, setExtraPrompt] = useState('');

  // Fixed error on line 47: Added React import to define the React namespace for types
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const metadata = await uploadToGCS(file);
        setSourceImage(metadata.url);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return {
    sourceImage, setSourceImage,
    isUploading,
    faceLock, setFaceLock,
    mode, setMode,
    roomType, setRoomType,
    style, setStyle,
    aspectRatio, setAspectRatio,
    extraPrompt, setExtraPrompt,
    handleUpload,
  };
};
