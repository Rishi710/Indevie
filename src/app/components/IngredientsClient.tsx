"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import Image from 'next/image';

import IngredientCard, { Ingredient } from './IngredientCard';

interface IngredientsClientProps {
  ingredients: Ingredient[];
}

// const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ALPHABET = "ACGJKLOPST".split("");

export default function IngredientsClient({ ingredients }: IngredientsClientProps) {
  const [activeLetter, setActiveLetter] = useState<string>('A');
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIngredients = useMemo(() => {
    let result = ingredients;
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = ingredients.filter(ing => 
        ing.word.toLowerCase().includes(lowerQuery) || 
        (ing.about && ing.about.toLowerCase().includes(lowerQuery)) ||
        (ing.tags && ing.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    } else {
      result = ingredients.filter(ing => ing.word.toUpperCase().startsWith(activeLetter));
    }
    
    // Sort alphabetically
    return result.sort((a, b) => a.word.localeCompare(b.word));
  }, [ingredients, activeLetter, searchQuery]);

  // Find which letters actually have ingredients
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    ingredients.forEach(ing => {
      if (ing.word && ing.word.length > 0) {
        letters.add(ing.word[0].toUpperCase());
      }
    });
    return Array.from(letters).sort();
  }, [ingredients]);

  const toggleExpand = (word: string) => {
    setExpandedWord(prev => (prev === word ? null : word));
  };

  const handleLetterClick = (letter: string) => {
    setActiveLetter(letter);
    setSearchQuery("");
    setExpandedWord(null);
  };

  return (
    <main className="relative min-h-screen bg-[#f5f1e6] overflow-x-hidden">
      {/* 🌿 HERO SECTION (Parallax) */}
      <section className="relative h-[80vh] md:h-[80vh] w-full overflow-hidden">
        <div 
          className="fixed inset-0 w-full h-[100vh] md:h-[100vh] z-0 opacity-90"
          style={{
            backgroundImage: "url('/images/ig-6.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Soft Overlay for depth */}
          <div className="absolute inset-0 bg-[#6c3518]/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-7xl font-Poppins italic text-white mb-4 drop-shadow-xl00">
              Meet the ingredients <br className="hidden md:block" /> behind the science
            </h1>
          </motion.div>
        </div>
      </section>

      {/* 🌿 INGREDIENTS CONTENT SECTION */}
      <section className="relative z-20 bg-[#f5f1e6] pt-16 pb-24 w-full">
        <div className="w-full mx-auto px-[10px]">


        {/* Search Bar */}
        <div className="relative mb-10 max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#6c3518]/50" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-[#6c3518]/20 rounded-full bg-white text-[#6c3518] placeholder-[#6c3518]/50 focus:outline-none focus:ring-2 focus:ring-[#6c3518]/30 font-sans transition-all"
            placeholder="Search ingredients, benefits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Alphabet Tabs */}
        {!searchQuery && (
          <div className="mb-12 relative">
            <div className="flex overflow-x-auto hide-scrollbar bg-white sticky top-20 z-10 shadow-sm rounded-lg mx-auto max-w-xl">
              <div className="flex mx-auto min-w-max px-2">
                {ALPHABET.map((letter) => {
                  const isAvailable = availableLetters.includes(letter);
                  const isActive = activeLetter === letter;
                  
                  return (
                    <button
                      key={letter}
                      onClick={() => isAvailable && handleLetterClick(letter)}
                      disabled={!isAvailable}
                      className={`
                        py-4 px-3 md:px-5 text-sm md:text-base font-sans font-medium transition-all
                        ${isActive 
                          ? 'text-[#6c3518] border-b-2 border-[#6c3518]' 
                          : isAvailable 
                            ? 'text-[#6c3518]/60 hover:text-[#6c3518]' 
                            : 'text-[#6c3518]/20 cursor-not-allowed'}
                      `}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Section Title (Letter or Search Results) */}
        <div className="mb-8 flex items-center max-w-4xl mx-auto">
          <div className="h-px bg-[#6c3518]/20 flex-grow"></div>
          <h2 className="px-6 text-3xl md:text-4xl font-seasons font-semibold text-[#6c3518]">
            {searchQuery ? "Search Results" : activeLetter}
          </h2>
          <div className="h-px bg-[#6c3518]/20 flex-grow"></div>
        </div>

        {/* Ingredients List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4">
          {filteredIngredients.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#6c3518]/60 font-inter">
               No ingredients found matching your criteria.
            </div>
          ) : (
            filteredIngredients.map((ing) => (
              <IngredientCard 
                key={ing.word} 
                ing={ing} 
                onToggle={() => toggleExpand(ing.word)} 
              />
            ))
          )}
        </div>
        </div>
      </section>
      
      {/* Hide scrollbar styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Modal */}
      <AnimatePresence>
        {expandedWord && (
          <IngredientModal 
            ing={ingredients.find(i => i.word === expandedWord)} 
            onClose={() => setExpandedWord(null)} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}

const IngredientModal = ({ ing, onClose }: { ing: Ingredient | undefined, onClose: () => void }) => {
  if (!ing) return null;

  let imageUrl = ing.image;
  if (imageUrl && imageUrl.startsWith('//')) {
    imageUrl = `https:${imageUrl}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#6c3518]/20 "
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[1000px] bg-white rounded-[32px] shadow-2xl flex flex-col md:flex-row z-10 max-h-[90vh] md:max-h-[85vh] overflow-hidden border border-[#6c3518]/10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 flex items-center justify-center rounded-full border border-[#6c3518]/30 text-[#6c3518] hover:bg-gray-50 transition-colors z-20 bg-white shadow-sm"
        >
          <X size={24} strokeWidth={1.5} />
        </button>
        
        {/* Left Side - Image & Title */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col relative bg-white">
          <h2 className="text-4xl md:text-5xl font-seasons text-[#6c3518] mb-3">{ing.word}</h2>
          <p className="text-[#6c3518]/60 font-poppins text-sm md:text-sm mb-10">
             {ing.tags?.join(' • ')}
          </p>
          <div className="w-full aspect-[4/3] md:aspect-[4/3] lg:aspect-square relative rounded-[24px] overflow-hidden shadow-sm mt-auto">
             {imageUrl ? (
               <Image src={imageUrl} alt={ing.word} fill className="object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-[#f5f1e6] text-[#6c3518]/20">
                 <span className="font-seasons text-2xl">No Image</span>
               </div>
             )}
          </div>
        </div>

        {/* Right Side - Text Content */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 overflow-y-auto hide-scrollbar flex flex-col gap-10 pt-20 md:pt-24 border-t md:border-t-0 md:border-l border-gray-100">
          {/* About */}
          {ing.about && (
            <div>
              <h4 className="text-[11px] md:text-xs font-poppins tracking-[0.2em] text-[#6c3518] uppercase mb-4">About the ingredient</h4>
              <p className="text-[#6c3518]/60 font-poppins leading-tight text-sm md:text-sm">
                {ing.about}
              </p>
            </div>
          )}
          
          {/* How it works */}
          {ing.work && (
            <div>
              <h4 className="text-[11px] md:text-xs font-poppins tracking-[0.2em] text-[#6c3518] uppercase mb-4">How it works</h4>
              <p className="text-[#6c3518]/60 font-poppins leading-tight text-sm md:text-sm">
                {ing.work}
              </p>
            </div>
          )}
          
          {/* Found in */}
          {ing.foundIn && ing.foundIn.length > 0 && (
            <div>
              <h4 className="text-[11px] md:text-xs font-poppins tracking-[0.2em] text-[#6c3518] uppercase mb-4">Found In</h4>
              <div className="flex flex-col gap-2">
                 {ing.foundIn.map((item, idx) => (
                   <span key={idx} className="text-[#6c3518]/60 font-poppins text-sm md:text-sm">{item}</span>
                 ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
