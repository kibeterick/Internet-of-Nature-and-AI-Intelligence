import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, Maximize2, Download, Share2, RotateCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface FullScreenViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const FullScreenViewer: React.FC<FullScreenViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  description,
  children
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      >
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="text-white">
              {title && <h2 className="text-3xl font-bold">{title}</h2>}
              {description && <p className="text-white/70 text-lg mt-2">{description}</p>}
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors"
              >
                <ZoomOut size={24} className="text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors"
              >
                <ZoomIn size={24} className="text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); handleRotate(); }}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors"
              >
                <RotateCw size={24} className="text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors"
              >
                <Maximize2 size={24} className="text-white" />
              </motion.button>
              <div className="w-px h-8 bg-white/20" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); }}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors"
              >
                <Download size={24} className="text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); }}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors"
              >
                <Share2 size={24} className="text-white" />
              </motion.button>
              <div className="w-px h-8 bg-white/20" />
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-4 bg-red-500/20 hover:bg-red-500/30 rounded-2xl backdrop-blur-md transition-colors"
              >
                <X size={24} className="text-white" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute bottom-8 left-8 z-10">
          <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl">
            <p className="text-white text-lg font-bold">{Math.round(zoom * 100)}%</p>
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: zoom, 
              opacity: 1,
              rotate: rotation
            }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title || 'Full screen view'}
                className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
                draggable={false}
              />
            ) : (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 shadow-2xl">
                {children}
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation Hints */}
        <div className="absolute bottom-8 right-8 z-10 space-y-2">
          <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl text-white/70 text-sm">
            <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> to close
          </div>
          <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl text-white/70 text-sm">
            <kbd className="px-2 py-1 bg-white/10 rounded">Scroll</kbd> to zoom
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Large Image Gallery Component
interface ImageGalleryProps {
  images: Array<{
    url: string;
    title: string;
    description?: string;
    category?: string;
  }>;
}

export const LargeImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(images.map(img => img.category).filter(Boolean)))];
  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.category === filter);

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap",
              filter === category
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-nature-100 text-nature-600 hover:bg-nature-200"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => setSelectedImage(index)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                  {image.description && (
                    <p className="text-white/80 text-sm">{image.description}</p>
                  )}
                </div>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <Maximize2 size={20} className="text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Screen Viewer */}
      {selectedImage !== null && (
        <FullScreenViewer
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          imageUrl={filteredImages[selectedImage].url}
          title={filteredImages[selectedImage].title}
          description={filteredImages[selectedImage].description}
        />
      )}
    </div>
  );
};

// Industrial Dashboard Image Component
export const IndustrialImageCard: React.FC<{
  imageUrl: string;
  title: string;
  metrics?: Array<{ label: string; value: string; color?: string }>;
  onExpand?: () => void;
}> = ({ imageUrl, title, metrics, onExpand }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass rounded-[40px] overflow-hidden shadow-xl hover:shadow-2xl transition-all"
    >
      <div className="relative aspect-video">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={onExpand}
          className="absolute top-6 right-6 p-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl transition-colors group"
        >
          <Maximize2 size={24} className="text-white group-hover:scale-110 transition-transform" />
        </button>
        <div className="absolute bottom-6 left-6 right-6">
          <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
          {metrics && (
            <div className="flex gap-4">
              {metrics.map((metric, i) => (
                <div key={i} className="bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl">
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <p className={cn("text-2xl font-bold mt-1", metric.color || "text-white")}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
