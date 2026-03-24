import React, { useState } from "react";
import {
  Camera,
  MapPin,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Upload,
  X,
  Tag,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Observation {
  id: string;
  type: "plant" | "animal" | "environmental";
  species: string;
  commonName: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  photos: string[];
  conditions: {
    temperature?: number;
    humidity?: number;
    weather?: string;
    windSpeed?: number;
  };
  tags: string[];
  notes: string;
  timestamp: Date;
  contributor: string;
  verified: boolean;
}

export default function ObservationContribution() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [observationType, setObservationType] = useState<
    "plant" | "animal" | "environmental"
  >("animal");
  const [photos, setPhotos] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState({
    species: "",
    commonName: "",
    location: "",
    temperature: "",
    humidity: "",
    weather: "",
    windSpeed: "",
    notes: "",
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const suggestedTags = {
    plant: [
      "Flowering",
      "Endangered",
      "Invasive",
      "Native",
      "Medicinal",
      "Rare",
    ],
    animal: [
      "Migratory",
      "Endangered",
      "Nocturnal",
      "Predator",
      "Herbivore",
      "Rare",
    ],
    environmental: [
      "Pollution",
      "Erosion",
      "Deforestation",
      "Climate Change",
      "Habitat Loss",
    ],
  };

  const handleSubmit = () => {
    // Submit observation to Firebase/backend
    console.log("Submitting observation:", {
      type: observationType,
      ...formData,
      photos,
      tags,
    });

    // Reset form
    setIsOpen(false);
    setStep(1);
    setPhotos([]);
    setTags([]);
    setFormData({
      species: "",
      commonName: "",
      location: "",
      temperature: "",
      humidity: "",
      weather: "",
      windSpeed: "",
      notes: "",
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all z-40"
      >
        <Camera className="w-6 h-6" />
      </motion.button>

      {/* Contribution Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Contribute Observation
                    </h2>
                    <p className="text-emerald-100 text-sm mt-1">
                      Help us map biodiversity - Step {step} of 4
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    className="bg-white h-full rounded-full"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Step 1: Type Selection */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      What did you observe?
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          type: "animal",
                          icon: "🦋",
                          label: "Animal",
                          desc: "Wildlife sighting",
                        },
                        {
                          type: "plant",
                          icon: "🌿",
                          label: "Plant",
                          desc: "Flora observation",
                        },
                        {
                          type: "environmental",
                          icon: "🌍",
                          label: "Environmental",
                          desc: "Conditions",
                        },
                      ].map((option) => (
                        <button
                          key={option.type}
                          onClick={() => setObservationType(option.type as any)}
                          className={`p-6 rounded-2xl border-2 transition-all ${
                            observationType === option.type
                              ? "border-emerald-500 bg-emerald-50 shadow-lg"
                              : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="text-4xl mb-2">{option.icon}</div>
                          <div className="font-bold text-gray-800">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {option.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Observation Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Scientific Name
                        </label>
                        <input
                          type="text"
                          value={formData.species}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              species: e.target.value,
                            })
                          }
                          placeholder="e.g., Panthera leo"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Common Name
                        </label>
                        <input
                          type="text"
                          value={formData.commonName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              commonName: e.target.value,
                            })
                          }
                          placeholder="e.g., Lion"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="e.g., Serengeti National Park, Tanzania"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes & Behavior
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Describe what you observed..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Photos & Environmental Conditions */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Photos & Evidence
                      </h3>

                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer"
                        >
                          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600 font-medium">
                            Click to upload photos
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            PNG, JPG up to 10MB each
                          </p>
                        </label>
                      </div>

                      {photos.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={photo}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover rounded-xl"
                              />
                              <button
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Environmental Conditions
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Thermometer className="w-4 h-4 inline mr-2" />
                            Temperature (°C)
                          </label>
                          <input
                            type="number"
                            value={formData.temperature}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                temperature: e.target.value,
                              })
                            }
                            placeholder="25"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Droplets className="w-4 h-4 inline mr-2" />
                            Humidity (%)
                          </label>
                          <input
                            type="number"
                            value={formData.humidity}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                humidity: e.target.value,
                              })
                            }
                            placeholder="65"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Cloud className="w-4 h-4 inline mr-2" />
                            Weather
                          </label>
                          <select
                            value={formData.weather}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                weather: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            <option value="">Select weather</option>
                            <option value="sunny">Sunny</option>
                            <option value="cloudy">Cloudy</option>
                            <option value="rainy">Rainy</option>
                            <option value="stormy">Stormy</option>
                            <option value="foggy">Foggy</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Wind className="w-4 h-4 inline mr-2" />
                            Wind Speed (km/h)
                          </label>
                          <input
                            type="number"
                            value={formData.windSpeed}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                windSpeed: e.target.value,
                              })
                            }
                            placeholder="15"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Tags & Review */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        <Tag className="w-5 h-5 inline mr-2" />
                        Add Tags
                      </h3>

                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addTag()}
                          placeholder="Add a tag..."
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <button
                          onClick={addTag}
                          className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-2"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="hover:text-emerald-900"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Suggested tags:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedTags[observationType].map((tag) => (
                            <button
                              key={tag}
                              onClick={() =>
                                !tags.includes(tag) && setTags([...tags, tag])
                              }
                              disabled={tags.includes(tag)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                tags.includes(tag)
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 rounded-2xl p-6">
                      <h4 className="font-bold text-emerald-900 mb-3">
                        Review Your Observation
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {observationType}
                        </p>
                        <p>
                          <span className="font-medium">Species:</span>{" "}
                          {formData.species || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Location:</span>{" "}
                          {formData.location || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Photos:</span>{" "}
                          {photos.length} uploaded
                        </p>
                        <p>
                          <span className="font-medium">Tags:</span>{" "}
                          {tags.length} added
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 flex justify-between">
                <button
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>

                {step < 4 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Submit Observation
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
