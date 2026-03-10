import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TutorialStep {
  title: string;
  description: string;
  target?: string;
  image?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Internet of Nature! 🌿",
    description:
      "Your comprehensive ecosystem intelligence platform. Let's take a quick tour to get you started.",
  },
  {
    title: "Real-Time Dashboard",
    description:
      "Monitor live sensor data from 10,000+ IoT devices worldwide. Track temperature, humidity, air quality, and biodiversity metrics in real-time.",
    target: "dashboard",
  },
  {
    title: "Genie AI Assistant",
    description:
      "Click the floating Genie button (bottom right) to chat with our AI assistant. Ask questions about your ecosystem data, get insights, and receive recommendations.",
    target: "genie",
  },
  {
    title: "Predictive Analytics",
    description:
      "View AI-powered predictions for plant stress, disease outbreaks, and weather shifts. Get proactive alerts before issues occur.",
    target: "analytics",
  },
  {
    title: "Species Identification",
    description:
      "Upload photos to identify species instantly using AI. Get detailed information about habitat, conservation status, and ecological role.",
    target: "species",
  },
  {
    title: "Developer Tools",
    description:
      "Access our comprehensive API, code editor, and documentation. Build custom integrations and contribute to the ecosystem.",
    target: "developer",
  },
  {
    title: "Save & Export",
    description:
      "Your work is automatically saved. Export data in CSV or JSON format. Use version control to track changes over time.",
  },
  {
    title: "You're All Set! 🎉",
    description:
      "Start exploring your ecosystem data. Need help? Click the Genie button anytime or visit our documentation.",
  },
];

interface UserTutorialProps {
  onComplete: () => void;
}

export default function UserTutorial({ onComplete }: UserTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass rounded-[40px] max-w-2xl w-full overflow-hidden shadow-2xl"
        >
          {/* Progress Bar */}
          <div className="h-2 bg-nature-100">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-nature-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-nature-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                  {currentStep + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-nature-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-nature-600">
                    Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 hover:bg-nature-100 rounded-xl transition-all"
              >
                <X size={24} className="text-nature-600" />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-nature-700 text-lg leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 rounded-2xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nature-100"
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <div className="flex gap-2">
                {TUTORIAL_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? "bg-nature-600 w-8"
                        : index < currentStep
                          ? "bg-emerald-500"
                          : "bg-nature-200"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-nature-600 text-white rounded-2xl flex items-center gap-2 hover:from-emerald-600 hover:to-nature-700 transition-all font-medium"
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? (
                  <>
                    Get Started
                    <Check size={20} />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-nature-50 border-t border-nature-100 flex items-center justify-between">
            <p className="text-sm text-nature-600">
              You can restart this tutorial anytime from Settings
            </p>
            <button
              onClick={handleSkip}
              className="text-sm text-nature-600 hover:text-nature-900 underline"
            >
              Skip tutorial
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
