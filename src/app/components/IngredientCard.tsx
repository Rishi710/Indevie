import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';

export interface Ingredient {
  word: string;
  image?: string;
  tags?: string[];
  about?: string;
  subtitle?: string;
  work?: string;
  foundIn?: string[];
}

interface IngredientCardProps {
  ing: Ingredient;
  onToggle: () => void;
}

export default function IngredientCard({ ing, onToggle }: IngredientCardProps) {
  // Validate image URL
  let imageUrl = ing.image;
  if (imageUrl && imageUrl.startsWith('//')) {
    imageUrl = `https:${imageUrl}`;
  }

  return (
    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#6c3518]/10 flex flex-col group">
      {/* Top Image Section */}
      <div className="relative w-full aspect-[5/4] bg-[#f5f1e6] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={ing.word}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6c3518]/20">
            <span className="font-seasons text-2xl">No Image</span>
          </div>
        )}
        
        {/* Overlaid Tags */}
        {ing.tags && ing.tags.length > 0 && (
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10 items-start">
            {ing.tags.map((tag, idx) => tag && (
              <span 
                key={idx} 
                className="inline-block px-4 py-1.5 bg-white/90 backdrop-blur-sm text-[#6c3518] border border-[#6c3518]/20 rounded-full text-xs uppercase tracking-wider font-poppins font-medium shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Content Section */}
      <div className="p-6 md:p-8 flex flex-col flex-grow bg-white">
        <h3 className="text-xl md:text-2xl font-poppins text-[#6c3518] mb-4">
          {ing.word}
        </h3>
        
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm md:text-sm text-[#6c3518]/70 font-poppins leading-tight max-w-[100%]">
            {ing.subtitle || (ing.about && ing.about.substring(0, 100) + '...')}
          </p>
          
          <button 
            onClick={onToggle}
            className="flex-shrink-0 w-12 h-12 rounded-full border border-[#6c3518]/20 flex items-center justify-center transition-all duration-300 focus:outline-none text-[#6c3518] hover:border-[#6c3518] hover:bg-[#f5f1e6]"
            aria-label="Expand details"
          >
            <Plus strokeWidth={1.5} size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
