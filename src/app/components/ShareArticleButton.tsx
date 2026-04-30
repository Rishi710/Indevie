"use client";

import React from "react";

interface ShareArticleButtonProps {
  title: string;
  url: string;
  className?: string;
}

export default function ShareArticleButton({ title, url, className = "" }: ShareArticleButtonProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: fullUrl
        });
      } catch (err) {
        // User cancelled or error occurred, ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className={`text-[10px] uppercase tracking-widest font-bold px-6 py-3 border border-gray-200 hover:bg-gray-50 transition-colors ${className}`}
    >
      Share Article
    </button>
  );
}
