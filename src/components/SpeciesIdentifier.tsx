import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
  MapPin,
  Leaf,
  Heart,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../lib/utils";

interface SpeciesIdentifierProps {
  onIdentified?: (species: any) => void;
}

export const SpeciesIdentifier: React.FC<SpeciesIdentifierProps> = ({
  onIdentified,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setPreview(imageData);
      await identifySpecies(imageData, file.type);
    };
    reader.readAsDataURL(file);
  };

  const identifySpecies = async (imageData: string, mimeType: string) => {
    setLoading(true);
    setError(null);

    try {
      // Mock identification for demo
      const mockResult = {
        commonName: "Sample Species",
        scientificName: "Species scientificus",
        type: "animal",
        kingdom: "Animalia",
        phylum: "Chordata",
        class: "Mammalia",
        order: "Carnivora",
        family: "Felidae",
        genus: "Panthera",
        species: "leo",
        description: "A large felid of the genus Panthera",
        habitat: "African savannas and grasslands",
        conservationStatus: "Vulnerable",
        diet: "Carnivorous",
        behavior: "Social, territorial",
        reproduction: "Viviparous",
        lifespan: "10-14 years",
        size: "1.7-2.5 meters",
        interestingFacts: [
          "Lions are the only truly social cats",
          "A lion's roar can be heard 5 miles away",
          "Female lions do most of the hunting",
        ],
        ecologicalRole: "Apex predator",
        threats: ["Habitat loss", "Human conflict"],
        confidence: 85,
      };

      setResult(mockResult);
      onIdentified?.(mockResult);
      toast.success(`Identified: ${mockResult.commonName}`);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to identify species";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const resetIdentification = () => {
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const getConservationColor = (status: string) => {
    const colors: Record<string, string> = {
      Extinct: "bg-gray-600",
      "Critically Endangered": "bg-red-600",
      Endangered: "bg-orange-600",
      Vulnerable: "bg-yellow-600",
      "Least Concern": "bg-green-600",
    };
    return colors[status] || "bg-gray-400";
  };

  return (
    <div className="fixed bottom-24 right-8 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[500px] max-h-[700px] overflow-y-auto glass rounded-3xl shadow-2xl border border-emerald-100 bg-white/95 backdrop-blur-md"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">
                    Species Identifier
                  </h3>
                  <p className="text-sm text-emerald-600">
                    Identify plants and animals from photos
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetIdentification();
                  }}
                  className="p-2 hover:bg-emerald-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-emerald-600" />
                </button>
              </div>

              {!result ? (
                <>
                  {!preview ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-emerald-300 rounded-2xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer"
                      >
                        <Upload
                          className="mx-auto mb-3 text-emerald-500"
                          size={32}
                        />
                        <p className="font-semibold text-emerald-900 mb-1">
                          Drop image here or click to upload
                        </p>
                        <p className="text-sm text-emerald-600">
                          Supports JPG, PNG, WebP
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                          }}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Choose File
                        </button>
                      </div>

                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-semibold"
                      >
                        <Camera size={18} />
                        Take Photo
                      </button>
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        className="hidden"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="relative rounded-2xl overflow-hidden">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-64 object-cover"
                        />
                        {loading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center">
                              <Loader
                                className="animate-spin mx-auto mb-2 text-white"
                                size={32}
                              />
                              <p className="text-white text-sm font-semibold">
                                Identifying species...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                          <AlertCircle
                            className="text-red-600 shrink-0"
                            size={18}
                          />
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      )}

                      {!loading && (
                        <button
                          onClick={() => resetIdentification()}
                          className="w-full py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-semibold"
                        >
                          Try Another Image
                        </button>
                      )}
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-emerald-900">
                          {result.commonName}
                        </h4>
                        <p className="text-sm italic text-emerald-700">
                          {result.scientificName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          {result.confidence}%
                        </div>
                        <p className="text-xs text-emerald-600">Confidence</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <div
                        className={cn(
                          "px-3 py-1 rounded-full text-white text-xs font-semibold",
                          getConservationColor(result.conservationStatus),
                        )}
                      >
                        {result.conservationStatus}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                    <p className="text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">
                      Taxonomy
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-blue-600 font-semibold">Kingdom</p>
                        <p className="text-blue-900">{result.kingdom}</p>
                      </div>
                      <div>
                        <p className="text-blue-600 font-semibold">Phylum</p>
                        <p className="text-blue-900">{result.phylum}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                    <p className="text-xs font-bold text-purple-900 mb-2 uppercase tracking-wide">
                      Description
                    </p>
                    <p className="text-sm text-purple-900 leading-relaxed">
                      {result.description}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => resetIdentification()}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                    >
                      Identify Another
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all group relative"
      >
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        <Leaf
          size={24}
          className="group-hover:rotate-12 transition-transform"
        />
      </motion.button>
    </div>
  );
};

export default SpeciesIdentifier;
