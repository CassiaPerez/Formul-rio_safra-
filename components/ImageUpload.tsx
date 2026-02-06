import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 5
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - selectedFiles.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      alert(`Você já selecionou o máximo de ${maxImages} imagens.`);
      return;
    }

    const validFiles = filesToAdd.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidType) {
        alert(`${file.name} não é uma imagem válida.`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name} excede o tamanho máximo de 5MB.`);
        return false;
      }
      return true;
    });

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onImagesChange(newFiles);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Fotos do Acompanhamento
      </label>

      {/* Upload Button */}
      {selectedFiles.length < maxImages && (
        <div className="mb-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-agro-500 hover:bg-agro-50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="mb-1 text-sm text-gray-600 font-medium">
                Clique para adicionar fotos
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG ou WEBP (máx. 5MB por foto)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedFiles.length}/{maxImages} imagens selecionadas
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
            />
          </label>
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
              <div className="mt-1 text-xs text-gray-500 truncate">
                {selectedFiles[index]?.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
