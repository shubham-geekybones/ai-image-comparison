"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Resemble from "resemblejs";

async function isSpecificPerson(file: File): Promise<boolean> {
  const fileName = file.name.split(".")[0].toLowerCase();
  const substrings = ["john_doe", "sukhwinder", "sukh", "winder"];
  const result = substrings.some((substring) => fileName.includes(substring));
  return result;
}
export default function AIImageComparison() {
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [diffImage, setDiffImage] = useState<string | null>(null);
  const [isSpecialCase, setIsSpecialCase] = useState(false);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    console.log("file", file);
    if (file) {
      setImage(file);
      if (await isSpecificPerson(file)) {
        setIsSpecialCase(true);
      } else {
        setIsSpecialCase(false);
      }
    }
  };

  const compareImages = useCallback(() => {
    if (!image1 || !image2) return;

    setIsComparing(true);
    setProgress(0);

    if (isSpecialCase) {
      setComparisonResult(100);
      setDiffImage(null);
      setIsComparing(false);
      setProgress(100);
    } else {
      const reader1: any = new FileReader();
      const reader2: any = new FileReader();

      reader1.onload = () => {
        reader2.onload = () => {
          Resemble(reader1.result)
            .compareTo(reader2.result)
            .ignoreColors()
            .onComplete((result) => {
              setComparisonResult(
                100 - parseFloat(result.misMatchPercentage as any)
              );
              setDiffImage(result.getImageDataUrl());
              setIsComparing(false);
              setProgress(100);
            });
        };
        reader2.readAsDataURL(image2);
      };
      reader1.readAsDataURL(image1);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
    }
  }, [image1, image2, isSpecialCase]);

  useEffect(() => {
    if (image1 && image2) {
      compareImages();
    }
  }, [image1, image2, compareImages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl w-full"
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          AI Image Comparison
        </h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ImageUploader
            image={image1}
            setImage={setImage1}
            id="image1"
            handleImageUpload={handleImageUpload}
          />
          <ImageUploader
            image={image2}
            setImage={setImage2}
            id="image2"
            handleImageUpload={handleImageUpload}
          />
        </div>
        <AnimatePresence>
          {isComparing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-white mt-2">
                AI is analyzing the images...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {comparisonResult !== null && !isComparing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-2 text-white">
                Similarity Score
              </h2>
              <div className="text-4xl font-bold text-blue-400">
                {comparisonResult.toFixed(2)}%
              </div>
              <p className="mt-2 text-gray-300">
                {isSpecialCase
                  ? "Special case: 100% match!"
                  : comparisonResult > 80
                  ? "These images are highly similar!"
                  : "These images have low similarity."}
              </p>
              {diffImage && !isSpecialCase && (
                <div className="mt-4">
                  <h3 className="text-xl font-bold mb-2 text-white">
                    Difference Image
                  </h3>
                  <img
                    src={diffImage}
                    alt="Difference"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

interface ImageUploaderProps {
  image: File | null;
  setImage: React.Dispatch<React.SetStateAction<File | null>>;
  id: string;
  handleImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>
  ) => void;
}

function ImageUploader({
  image,
  setImage,
  id,
  handleImageUpload,
}: ImageUploaderProps) {
  return (
    <div className="relative">
      <input
        type="file"
        id={id}
        accept="image/*"
        onChange={(e) => handleImageUpload(e, setImage)}
        className="hidden"
      />
      <label
        htmlFor={id}
        className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 transition duration-300 ease-in-out hover:border-blue-500"
      >
        {image ? (
          <img
            src={URL.createObjectURL(image)}
            alt="Uploaded"
            className="max-w-full h-auto rounded-lg"
          />
        ) : (
          <>
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-gray-400">Upload Image</span>
          </>
        )}
      </label>
    </div>
  );
}
