"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import AnnouncementBar from "./AnnouncementBar";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function Header({ 
  isLoggedIn = false, 
  userName = null 
}: { 
  isLoggedIn?: boolean;
  userName?: string | null;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { setIsCartOpen, totalQuantity } = useCart();

  const isHome = pathname === "/";
  const shouldBeSolid = isScrolled || isMenuOpen || !isHome;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

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
        {showAnnouncement && !isMenuOpen && (
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
          shouldBeSolid
            ? "bg-white border-b border-gray-100 py-4 shadow-sm" 
            : "bg-transparent border-transparent py-6"
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center z-50">
            <Link 
              href="/" 
              className="relative h-8 w-28 md:h-[45px] md:w-[180px] transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <Image
                src="/images/logo.png"
                alt="INDEVIE"
                fill
                sizes="(max-width: 768px) 112px, 180px"
                className={`object-contain transition-all duration-300 ${
                  shouldBeSolid ? "brightness-0" : "brightness-0 invert"
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
                  shouldBeSolid ? "text-gray-800 hover:text-black" : "text-white/90 hover:text-white"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-[1px] transition-all group-hover:w-full ${
                  isScrolled ? "bg-black" : "bg-white"
                }`}></span>
              </Link>
            ))}
          </nav>
          
          {/* Icons and Hamburger */}
          <div className={`flex items-center space-x-4 md:space-x-6 transition-colors duration-300 z-50 ${
            shouldBeSolid ? "text-gray-800" : "text-white"
          }`}>
            {/* <button className="hover:opacity-70 transition-opacity hidden sm:block" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button> */}
             <Link 
              href={isLoggedIn ? "/account" : "/login"} 
              className="hover:opacity-70 transition-opacity hidden sm:flex items-center gap-2 group relative" 
              aria-label="Account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
               <span className={`text-[11px] font-poppins font-bold tracking-[0.2em] uppercase transition-colors ${
                 shouldBeSolid ? "text-[#6c3518]" : "text-white"
               }`}>
                 {isLoggedIn ? `${userName || "User"}` : "Login"}
               </span>
               {/* {isLoggedIn && (
                 <span className="absolute -top-1 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
               )} */}
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="hover:opacity-70 transition-opacity relative group" 
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {totalQuantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#6c3518] text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white shadow-sm animate-in zoom-in duration-300">
                  {totalQuantity}
                </span>
              )}
            </button>

            {/* Hamburger Button */}
            <button 
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <motion.span 
                animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className={`block w-6 h-0.5 transition-colors duration-300 will-change-transform ${shouldBeSolid ? "bg-gray-800" : "bg-white"}`}
              ></motion.span>
              <motion.span 
                animate={isMenuOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                className={`block w-6 h-0.5 transition-colors duration-300 will-change-transform ${shouldBeSolid ? "bg-gray-800" : "bg-white"}`}
              ></motion.span>
              <motion.span 
                animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className={`block w-6 h-0.5 transition-colors duration-300 will-change-transform ${shouldBeSolid ? "bg-gray-800" : "bg-white"}`}
              ></motion.span>
            </button>
          </div>
          
        </div>
      </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-white z-40 pt-24 px-6 md:hidden will-change-transform"
          >
            <nav className="flex flex-col space-y-6">
              {/* Mobile Account Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="pb-6 border-b border-gray-100"
              >
                <Link 
                  href={isLoggedIn ? "/account" : "/login"}
                  className="flex items-center gap-4 text-gray-900 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-12 h-12 bg-[#f5f1e6] rounded-full flex items-center justify-center text-[#6c3518]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-poppins font-bold tracking-widest text-gray-400 uppercase">
                      {isLoggedIn ? "Account Dashboard" : "Welcome to Indevie"}
                    </p>
                    <p className="text-xl font-poppins font-medium text-[#6c3518]">
                      {isLoggedIn ? `Hello, ${userName || "User"}` : "Login / Register"}
                    </p>
                  </div>
                </Link>
              </motion.div>

              {links.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <Link 
                    href={link.href}
                    className="text-3xl font-serif text-gray-900 hover:text-red-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
            
            {/* Mobile Menu Bottom Info */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-12 left-6 right-6 border-t border-gray-100 pt-8"
            >
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Follow Us</p>
              <div className="flex space-x-6">
                <span className="text-sm font-medium">Instagram</span>
                <span className="text-sm font-medium">Facebook</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
