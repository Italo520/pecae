'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File, Image as ImageIcon } from 'lucide-react';

interface FileWithPreview extends File {
  preview: string;
}

interface DocumentUploadProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  maxFiles?: number;
}

export const DocumentUpload = ({ files, setFiles, maxFiles = 5 }: DocumentUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      alert(`Você pode enviar no máximo ${maxFiles} documentos.`);
      return;
    }

    const mappedFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...mappedFiles]);
  }, [files, maxFiles, setFiles]);

  const removeFile = (name: string) => {
    setFiles(files => files.filter(file => file.name !== name));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': []
    },
    maxFiles: maxFiles - files.length
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200
          ${isDragActive ? 'border-[#3FFF8B] bg-[#3FFF8B]/10' : 'border-gray-700 hover:border-gray-500 bg-black/20'}
        `}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`mx-auto h-12 w-12 mb-4 ${isDragActive ? 'text-[#3FFF8B]' : 'text-gray-400'}`} />
        <p className="text-gray-300 font-medium">
          {isDragActive ? 'Arraste os arquivos aqui...' : 'Arraste arquivos ou clique para selecionar'}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Suporta imagens (JPG, PNG) e PDF. Máx {maxFiles} arquivos.
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-gray-300">Arquivos Selecionados ({files.length}/{maxFiles})</p>
          <div className="grid gap-3">
            {files.map(file => (
              <div key={file.name} className="flex items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="h-10 w-10 rounded overflow-hidden bg-gray-900 flex items-center justify-center shrink-0">
                  {file.type.startsWith('image/') ? (
                    <img src={file.preview} alt={file.name} className="h-full w-full object-cover" />
                  ) : (
                    <File className="text-gray-400" size={20} />
                  )}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm text-gray-200 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(file.name)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
