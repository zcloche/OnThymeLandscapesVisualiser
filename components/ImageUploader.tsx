import React, { useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, Trees } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isMobile?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isMobile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelected(file);
    }
  };

  return (
    <div className="w-full">
      <label 
        htmlFor="image-upload"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-brand-300 rounded-2xl hover:bg-brand-50 hover:border-brand-500 transition-all cursor-pointer bg-white shadow-sm"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="p-4 bg-brand-100 text-brand-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
            <Upload size={32} />
          </div>
          <p className="mb-2 text-lg text-stone-600 font-medium">
            <span className="font-bold text-brand-700">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-stone-500">PNG, JPG, JPEG (Max 10MB)</p>
        </div>
        <input 
          id="image-upload" 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
          ref={fileInputRef}
        />
        
        {/* Mobile specific quick actions */}
        <div className={`absolute bottom-4 right-4 ${isMobile ? 'block' : 'md:hidden'}`}>
          <div className="bg-brand-600 text-white p-2 rounded-full shadow-lg">
             <Camera size={20} />
          </div>
        </div>
      </label>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-stone-500">
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-stone-100 shadow-sm">
            <ImageIcon size={16} className="text-brand-500" />
            <span>Upload current photo</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-stone-100 shadow-sm">
            <div className="font-bold text-brand-500">AI</div>
            <span>Describe changes</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-stone-100 shadow-sm">
            <Trees size={16} className="text-brand-500" />
            <span>See new garden</span>
        </div>
      </div>
    </div>
  );
};