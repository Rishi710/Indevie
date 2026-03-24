"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import AnnouncementBar from "./AnnouncementBar";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Ingredients", href: "/ingredients" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <div className="fixed top-0 w-full z-50">
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnnouncementBar onClose={() => setShowAnnouncement(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <header 
        className={`w-full transition-all duration-300 ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm" 
            : "bg-transparent border-transparent py-6"
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              href="/" 
              className="relative h-8 w-32 md:h-[45px] md:w-[180px] transition-all duration-300"
            >
              <Image
                src="/images/logo.png"
                alt="INDEVIE"
                fill
                className={`object-contain transition-all duration-300 ${
                  isScrolled ? "brightness-0" : "brightness-0 invert"
                }`}
                priority
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-[13px] font-medium transition-all uppercase tracking-widest relative group ${
                  isScrolled ? "text-gray-800 hover:text-black" : "text-white/90 hover:text-white"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-[1px] transition-all group-hover:w-full ${
                  isScrolled ? "bg-black" : "bg-white"
                }`}></span>
              </Link>
            ))}
          </nav>
          
          {/* Icons (Cart, Account, etc.) */}
          <div className={`flex items-center space-x-6 transition-colors duration-300 ${
            isScrolled ? "text-gray-800" : "text-white"
          }`}>
            <button className="hover:opacity-70 transition-opacity" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <button className="hover:opacity-70 transition-opacity" aria-label="Account">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
               </svg>
            </button>
            <button className="hover:opacity-70 transition-opacity" aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </button>
          </div>
          
        </div>
      </div>
      </header>
    </div>
  );
}
