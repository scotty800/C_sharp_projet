// components/shop-studio/tools/ImageCropper.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { assetsService } from '@/services/api/assets';

interface Props {
  imageUrl: string;
  assetId?: number;
  shopId: number;
  onSave: (croppedImageUrl: string, newAssetId?: number) => void;
  onCancel: () => void;
  format?: 'free' | 'original' | 'landscape' | 'portrait' | 'square';
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImagePosition {
  x: number;
  y: number;
}

// ⭐ Correction : Définir correctement le type des formats
type FormatConfig = {
  label: string;
  ratio: number | null;
  defaultWidth: number;
  defaultHeight: number;
  keepProportions?: boolean;
};

const FORMATS: Record<string, FormatConfig> = {
  free: { label: 'Libre', ratio: null, defaultWidth: 300, defaultHeight: 200 },
  original: { label: 'Original', ratio: null, defaultWidth: 400, defaultHeight: 300, keepProportions: true },
  landscape: { label: 'Paysage 16:9', ratio: 16 / 9, defaultWidth: 400, defaultHeight: 225 },
  portrait: { label: 'Portrait 9:16', ratio: 9 / 16, defaultWidth: 225, defaultHeight: 400 },
  square: { label: 'Carré 1:1', ratio: 1, defaultWidth: 300, defaultHeight: 300 },
};

export function ImageCropper({ 
  imageUrl, 
  assetId,
  shopId,
  onSave, 
  onCancel, 
  format = 'free'
}: Props) {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 300, height: 200 });
  const [imagePosition, setImagePosition] = useState<ImagePosition>({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [selectedFormat, setSelectedFormat] = useState<string>(format);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, cropX: 0, cropY: 0 });

  const currentFormat = FORMATS[selectedFormat];
  const aspectRatio = currentFormat?.ratio ?? null;

  // Charger l'image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      console.log('✅ Image chargée:', img.width, 'x', img.height);
      imageRef.current = img;
      setOriginalImageSize({ width: img.width, height: img.height });
      setImageLoaded(true);
      
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const scale = Math.min(containerWidth / img.width, containerHeight / img.height, 1);
      const displayWidth = img.width * scale;
      const displayHeight = img.height * scale;
      setImageSize({ width: displayWidth, height: displayHeight });
      
      updateCropForFormat(selectedFormat, containerWidth, containerHeight);
      
      setImagePosition({
        x: (containerWidth - displayWidth) / 2,
        y: (containerHeight - displayHeight) / 2,
      });
    };
    img.onerror = (err) => {
      console.error('❌ Erreur chargement image:', err);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const updateCropForFormat = (formatKey: string, containerW: number, containerH: number) => {
    const formatConfig = FORMATS[formatKey];
    if (!formatConfig) return;
    
    let width: number, height: number;
    
    if (formatConfig.ratio) {
      width = Math.min(containerW * 0.7, formatConfig.defaultWidth);
      height = width / formatConfig.ratio;
      if (height > containerH * 0.7) {
        height = containerH * 0.7;
        width = height * formatConfig.ratio;
      }
    } else if (formatKey === 'original' && originalImageSize.width && originalImageSize.height) {
      const originalRatio = originalImageSize.width / originalImageSize.height;
      width = Math.min(containerW * 0.7, originalImageSize.width);
      height = width / originalRatio;
    } else {
      width = Math.min(containerW * 0.7, formatConfig.defaultWidth);
      height = Math.min(containerH * 0.7, formatConfig.defaultHeight);
    }
    
    setCropArea({
      x: (containerW - width) / 2,
      y: (containerH - height) / 2,
      width: Math.max(30, Math.min(width, containerW)),
      height: Math.max(30, Math.min(height, containerH)),
    });
  };

  // ⭐ Correction : le paramètre doit être string
  const changeFormat = (newFormat: string) => {
    setSelectedFormat(newFormat);
    if (containerRef.current) {
      updateCropForFormat(
        newFormat, 
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    }
  };

  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeCorner(corner);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: cropArea.width,
      height: cropArea.height,
      cropX: cropArea.x,
      cropY: cropArea.y,
    };
  };

  const handleImageMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingImage(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startX: imagePosition.x,
      startY: imagePosition.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingImage) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      let newX = dragStart.current.startX + dx;
      let newY = dragStart.current.startY + dy;
      
      const cropLeft = cropArea.x;
      const cropTop = cropArea.y;
      const cropRight = cropArea.x + cropArea.width;
      const cropBottom = cropArea.y + cropArea.height;
      
      const minX = cropRight - imageSize.width;
      const maxX = cropLeft;
      const minY = cropBottom - imageSize.height;
      const maxY = cropTop;
      
      newX = Math.min(maxX, Math.max(minX, newX));
      newY = Math.min(maxY, Math.max(minY, newY));
      
      setImagePosition({ x: newX, y: newY });
    } else if (isResizing && resizeCorner) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      
      let newWidth = resizeStart.current.width;
      let newHeight = resizeStart.current.height;
      let newX = resizeStart.current.cropX;
      let newY = resizeStart.current.cropY;
      
      const imageLeft = imagePosition.x;
      const imageRight = imagePosition.x + imageSize.width;
      const imageTop = imagePosition.y;
      const imageBottom = imagePosition.y + imageSize.height;
      
      switch (resizeCorner) {
        case 'se':
          newWidth = resizeStart.current.width + dx;
          newHeight = resizeStart.current.height + dy;
          break;
        case 'ne':
          newWidth = resizeStart.current.width + dx;
          newHeight = resizeStart.current.height - dy;
          newY = resizeStart.current.cropY + dy;
          break;
        case 'sw':
          newWidth = resizeStart.current.width - dx;
          newHeight = resizeStart.current.height + dy;
          newX = resizeStart.current.cropX + dx;
          break;
        case 'nw':
          newWidth = resizeStart.current.width - dx;
          newHeight = resizeStart.current.height - dy;
          newX = resizeStart.current.cropX + dx;
          newY = resizeStart.current.cropY + dy;
          break;
      }
      
      // Appliquer l'aspect ratio si nécessaire
      if (aspectRatio !== null) {
        if (resizeCorner === 'se' || resizeCorner === 'ne') {
          newHeight = newWidth / aspectRatio;
          if (resizeCorner === 'ne') {
            newY = resizeStart.current.cropY + (resizeStart.current.height - newHeight);
          }
        } else if (resizeCorner === 'sw' || resizeCorner === 'nw') {
          newWidth = newHeight * aspectRatio;
          if (resizeCorner === 'sw') {
            newX = resizeStart.current.cropX + (resizeStart.current.width - newWidth);
          } else if (resizeCorner === 'nw') {
            newX = resizeStart.current.cropX + (resizeStart.current.width - newWidth);
            newY = resizeStart.current.cropY + (resizeStart.current.height - newHeight);
          }
        }
      } else if (currentFormat?.keepProportions && originalImageSize.width && originalImageSize.height) {
        const originalRatio = originalImageSize.width / originalImageSize.height;
        if (resizeCorner === 'se' || resizeCorner === 'ne') {
          newHeight = newWidth / originalRatio;
        } else if (resizeCorner === 'sw' || resizeCorner === 'nw') {
          newWidth = newHeight * originalRatio;
        }
      }
      
      const MIN_SIZE = 30;
      newWidth = Math.max(MIN_SIZE, newWidth);
      newHeight = Math.max(MIN_SIZE, newHeight);
      
      // Limites
      if (newX + newWidth > imageRight) {
        newWidth = imageRight - newX;
        if (aspectRatio !== null && (resizeCorner === 'se' || resizeCorner === 'ne')) {
          newHeight = newWidth / aspectRatio;
        }
      }
      
      if (newY + newHeight > imageBottom) {
        newHeight = imageBottom - newY;
        if (aspectRatio !== null && (resizeCorner === 'se' || resizeCorner === 'sw')) {
          newWidth = newHeight * aspectRatio;
        }
      }
      
      if (newX < imageLeft) {
        newWidth = newWidth - (imageLeft - newX);
        newX = imageLeft;
        if (aspectRatio !== null && (resizeCorner === 'sw' || resizeCorner === 'nw')) {
          newHeight = newWidth / aspectRatio;
        }
      }
      
      if (newY < imageTop) {
        newHeight = newHeight - (imageTop - newY);
        newY = imageTop;
        if (aspectRatio !== null && (resizeCorner === 'ne' || resizeCorner === 'nw')) {
          newWidth = newHeight * aspectRatio;
        }
      }
      
      if (newWidth < MIN_SIZE) newWidth = MIN_SIZE;
      if (newHeight < MIN_SIZE) newHeight = MIN_SIZE;
      
      setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
    }
  }, [isDraggingImage, isResizing, resizeCorner, cropArea, imageSize, imagePosition, aspectRatio, currentFormat, originalImageSize]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingImage(false);
    setIsResizing(false);
    setResizeCorner(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const uploadCroppedImage = async (blob: Blob): Promise<string> => {
    if (!shopId) {
      throw new Error('shopId requis pour l\'upload');
    }
    
    const file = new File([blob], `cropped-${Date.now()}.png`, { type: 'image/png' });
    const newAsset = await assetsService.uploadAsset(shopId, file, 'image', 'cropped');
    return newAsset.url;
  };

  const applyCrop = useCallback(async () => {
    console.log('🔪 Début du recadrage...');
    
    if (!imageRef.current || !imageLoaded) {
      console.error('❌ Image non chargée');
      return;
    }
    
    setIsApplying(true);
    setUploadProgress(0);
    
    try {
      const img = imageRef.current;
      const scaleX = img.width / imageSize.width;
      const scaleY = img.height / imageSize.height;
      
      const cropInImage = {
        x: (cropArea.x - imagePosition.x) * scaleX,
        y: (cropArea.y - imagePosition.y) * scaleY,
        width: cropArea.width * scaleX,
        height: cropArea.height * scaleY,
      };
      
      console.log('📐 Zone recadrée dans l\'image:', cropInImage);
      
      const canvas = document.createElement('canvas');
      canvas.width = cropInImage.width;
      canvas.height = cropInImage.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Impossible d\'obtenir le contexte canvas');
        return;
      }
      
      ctx.drawImage(
        img,
        cropInImage.x, cropInImage.y, cropInImage.width, cropInImage.height,
        0, 0, cropInImage.width, cropInImage.height
      );
      
      setUploadProgress(50);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      setUploadProgress(75);
      
      const uploadedUrl = await uploadCroppedImage(blob);
      
      setUploadProgress(100);
      console.log('✅ Image recadrée uploadée:', uploadedUrl);
      
      onSave(uploadedUrl);
    } catch (error) {
      console.error('❌ Erreur lors du recadrage:', error);
    } finally {
      setIsApplying(false);
      setUploadProgress(0);
    }
  }, [cropArea, imagePosition, imageSize, imageLoaded, onSave, shopId]);

  const modalStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const blockerStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99998,
    backgroundColor: 'transparent',
  };

  return (
    <>
      <div style={blockerStyle} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.preventDefault()} />
      
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-white text-lg font-semibold">✂️ Recadrage d'image</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-white">
              <FiX size={24} />
            </button>
          </div>

          {/* Corps */}
          <div className="flex flex-1 overflow-hidden">
            <div className="w-56 bg-gray-800 p-4 overflow-y-auto space-y-4">
              <div>
                <h3 className="text-white text-sm font-medium mb-2">📐 Formats</h3>
                <div className="space-y-1">
                  {Object.entries(FORMATS).map(([key, fmt]) => (
                    <button
                      key={key}
                      onClick={() => changeFormat(key)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedFormat === key ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {fmt.label}
                      {fmt.ratio && (
                        <span className="text-xs text-gray-400 block">
                          Ratio {fmt.ratio === 16/9 ? '16:9' : fmt.ratio === 9/16 ? '9:16' : fmt.ratio === 1 ? '1:1' : ''}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <button
                  onClick={applyCrop}
                  disabled={isApplying || !imageLoaded}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/80 rounded text-sm text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {uploadProgress > 0 ? `Upload ${uploadProgress}%` : 'Recadrage...'}
                    </>
                  ) : (
                    <>
                      <FiCheck size={16} />
                      Appliquer le recadrage
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <p className="text-xs text-gray-400">
                  💡 Astuces:<br/>
                  • Cliquez et glissez sur l'image pour la déplacer<br/>
                  • Utilisez les poignées des coins pour redimensionner le cadre<br/>
                  • Le cadre reste fixe pendant le redimensionnement
                </p>
              </div>
            </div>

            {/* Zone de prévisualisation */}
            <div 
              ref={containerRef}
              className="flex-1 relative overflow-hidden bg-gray-900 flex items-center justify-center p-4"
              style={{ cursor: isDraggingImage ? 'grabbing' : 'default' }}
            >
              {!imageLoaded ? (
                <div className="text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                  <p className="text-sm">Chargement de l'image...</p>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Image déplaçable */}
                  <div
                    style={{
                      position: 'absolute',
                      left: imagePosition.x,
                      top: imagePosition.y,
                      width: imageSize.width,
                      height: imageSize.height,
                      cursor: isDraggingImage ? 'grabbing' : 'grab',
                    }}
                    onMouseDown={handleImageMouseDown}
                  >
                    <img
                      src={imageUrl}
                      alt="Image à recadrer"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                      draggable={false}
                    />
                  </div>

                  {/* Cadre de recadrage (fixe) */}
                  <div
                    className="absolute border-2 border-white shadow-lg"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                      cursor: 'default',
                      pointerEvents: 'none',
                    }}
                  >
                    {/* Poignées de redimensionnement */}
                    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white rounded-sm cursor-nw-resize border-2 border-primary hover:scale-110 transition-transform" 
                         style={{ pointerEvents: 'auto' }}
                         onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-sm cursor-ne-resize border-2 border-primary hover:scale-110 transition-transform" 
                         style={{ pointerEvents: 'auto' }}
                         onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                    <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white rounded-sm cursor-sw-resize border-2 border-primary hover:scale-110 transition-transform" 
                         style={{ pointerEvents: 'auto' }}
                         onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white rounded-sm cursor-se-resize border-2 border-primary hover:scale-110 transition-transform" 
                         style={{ pointerEvents: 'auto' }}
                         onMouseDown={(e) => handleResizeStart(e, 'se')} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}