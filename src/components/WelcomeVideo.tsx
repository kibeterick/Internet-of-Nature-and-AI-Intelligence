import { useState, useEffect } from 'react';
import { X, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeVideoProps {
  onClose: () => void;
}

export const WelcomeVideo = ({ onClose }: WelcomeVideoProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl"
      >
        <div className="p-6 bg-gradient-to-r from-nature-600 to-nature-800 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Welcome to Internet of Nature</h2>
            <p className="text-nature-100">Discover how our platform works</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="aspect-video bg-black">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
            title="Internet of Nature Introduction"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-nature-50 rounded-xl">
              <div className="text-3xl font-bold text-nature-600">🌿</div>
              <p className="text-sm font-semibold mt-2">Track Species</p>
            </div>
            <div className="p-4 bg-nature-50 rounded-xl">
              <div className="text-3xl font-bold text-nature-600">🤖</div>
              <p className="text-sm font-semibold mt-2">AI Analysis</p>
            </div>
            <div className="p-4 bg-nature-50 rounded-xl">
              <div className="text-3xl font-bold text-nature-600">🌍</div>
              <p className="text-sm font-semibold mt-2">Global Impact</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-nature-600 text-white rounded-xl font-bold hover:bg-nature-700 transition-all"
          >
            Start Exploring
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const useWelcomeVideo = () => {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const hasSeenVideo = localStorage.getItem('hasSeenWelcomeVideo');
    if (!hasSeenVideo) {
      setShowVideo(true);
    }
  }, []);

  const closeVideo = () => {
    localStorage.setItem('hasSeenWelcomeVideo', 'true');
    setShowVideo(false);
  };

  return { showVideo, closeVideo };
};
