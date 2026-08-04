"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import AnnouncementBar from "./AnnouncementBar";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import SearchBar from "./SearchBar";
import { useScrollLock } from "@/lib/useScrollLock";

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
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Mobile nav accordions — expanded by default, collapse on tap
  const [isFavouritesOpen, setIsFavouritesOpen] = useState(true);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true);
  const pathname = usePathname();
  const { setIsCartOpen, totalQuantity } = useCart();

  const isProductPage = pathname.startsWith('/products/');
  const shouldBeSolid = isScrolled || isMenuOpen || isProductPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock scroll when menu is open
  useScrollLock(isMenuOpen);

  // Full flat row for desktop nav
  const links = [
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Ingredients", href: "/ingredients" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ];

  // Mobile-only accordion sections — "collection" values map to real Shopify
  // collection handles (fetched from Storefront API), read by the shop page
  // via /shop?collection=<handle> to land directly on that tab.
  const FAVOURITES_LINKS = [
    { name: "Shop All", href: "/shop" },
    { name: "New Launches", href: "/shop?collection=new-launches" },
    { name: "Bestsellers", href: "/shop?collection=single" },
  ];

  const COLLECTIONS_LINKS = [
    { name: "Travel Minis", href: "/shop?collection=minis" },
    { name: "Gifting Box", href: "/shop?collection=gift-box" },
    { name: "Face Care", href: "/shop?collection=face-care-1" },
    { name: "Hair Care", href: "/shop?collection=hair-care" },
    { name: "Body Care", href: "/shop?collection=body-care" },
  ];

  // Mobile flat links — same as desktop minus "Shop" (now under Favourites/Collections)
  const mobileFlatLinks = links.filter((l) => l.name !== "Shop");

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
        className={`w-full transition-all duration-300 relative z-50 ${shouldBeSolid
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
                  src="https://cdn.shopify.com/s/files/1/0649/7301/3058/files/logo_3.webp?v=1778164066"
                  alt="INDEVIE"
                  fill
                  sizes="(max-width: 768px) 112px, 180px"
                  className={`object-contain transition-all duration-300 ${shouldBeSolid ? "brightness-0" : "brightness-0 invert"
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
                  className={`text-[14px] font-inter font-medium transition-all uppercase tracking-widest relative group ${shouldBeSolid ? "text-gray-800 hover:text-black" : "text-white/90 hover:text-white"
                    }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-[1px] transition-all group-hover:w-full ${isScrolled ? "bg-black" : "bg-white"
                    }`}></span>
                </Link>
              ))}
            </nav>

            {/* Icons and Hamburger */}
            <div className={`flex items-center space-x-4 md:space-x-6 transition-colors duration-300 z-50 ${shouldBeSolid ? "text-gray-800" : "text-white"
              }`}>
              <div
                className="relative"
                onMouseEnter={() => isLoggedIn && setShowAccountDropdown(true)}
                onMouseLeave={() => isLoggedIn && setShowAccountDropdown(false)}
              >
{/* Account icon — only shown when logged in; GoKwik handles guest auth */}
                {isLoggedIn && (
                  <Link
                    href="/account"
                    className="hover:opacity-70 transition-opacity hidden sm:flex items-center gap-2 group relative py-2"
                    aria-label="Account"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className={`text-[11px] font-inter font-bold tracking-[0.2em] uppercase transition-colors ${shouldBeSolid ? "text-[#B40417]" : "text-white"
                      }`}>
                      {userName || "Account"}
                    </span>
                  </Link>
                )}

                {/* Account Dropdown */}
                <AnimatePresence>
                  {isLoggedIn && showAccountDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-1 w-56 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-2">
                        <Link
                          href="/account?tab=profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#f5f1e6]/50 rounded-xl transition-colors group/item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover/item:text-[#6c3518]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21.012c-1.735 0-3.347-.489-4.714-1.338m11.963 0a9 9 0 001.053-3.136C22.25 9.209 18.183 5.25 13.235 5.25c-5.03 0-9.135 4.047-9.073 9.082.016 1.341.34 2.61.912 3.731" />
                          </svg>
                          <span className="font-medium">My Profile</span>
                        </Link>

                        <Link
                          href="/account?tab=orders"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#f5f1e6]/50 rounded-xl transition-colors group/item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover/item:text-[#6c3518]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                          </svg>
                          <span className="font-medium">My Orders</span>
                        </Link>

                        <div className="my-1 border-t border-gray-100/50"></div>

                        <button
                          onClick={async () => {
                            const { logoutAction } = await import("../actions/auth");
                            await logoutAction();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors group/item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-400 group-hover/item:text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Search Icon — shared overlay, works on all screen sizes */}
              <SearchBar solidMode={shouldBeSolid} />

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
            className="fixed inset-0 bg-white z-40 pt-24 pb-8 px-6 md:hidden will-change-transform overflow-y-auto flex flex-col"
          >
            <nav className="flex flex-col space-y-6 flex-grow">
              {/* Favourites — expanded by default, collapsible */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                <button
                  onClick={() => setIsFavouritesOpen(!isFavouritesOpen)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="relative inline-block">
                    <span className="absolute inset-x-[-3px] bottom-1 h-3 bg-[#e9c46a]/50 -z-10" />
                    <span className="relative text-3xl font-inter text-gray-900">Favourites</span>
                  </span>
                  <motion.svg
                    animate={{ rotate: isFavouritesOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                    className="text-gray-900 shrink-0"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {isFavouritesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden flex flex-col space-y-4 pt-4"
                    >
                      {FAVOURITES_LINKS.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="text-lg font-inter text-gray-600 hover:text-[#6c3518]"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Collections — expanded by default, collapsible */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="pt-2">
                <button
                  onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="relative inline-block">
                    <span className="absolute inset-x-[-3px] bottom-1 h-3 bg-[#e9c46a]/50 -z-10" />
                    <span className="relative text-3xl font-inter text-gray-900">Collections</span>
                  </span>
                  <motion.svg
                    animate={{ rotate: isCollectionsOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                    className="text-gray-900 shrink-0"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {isCollectionsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden flex flex-col space-y-4 pt-4"
                    >
                      {COLLECTIONS_LINKS.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="text-lg font-inter text-gray-600 hover:text-[#6c3518]"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Flat links */}
              {mobileFlatLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="text-3xl font-inter text-gray-900 hover:text-[#6c3518] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {/* Account / Login — placed after the nav tabs */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + mobileFlatLinks.length * 0.05 }}
                className="pt-6 mt-2 border-t border-gray-100"
              >
{/* Guest login link removed — GoKwik handles customer auth */}
                {isLoggedIn && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-gray-900 font-inter">
                      <div className="w-12 h-12 bg-[#f5f1e6] rounded-full flex items-center justify-center text-[#6c3518]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Account Dashboard
                        </p>
                        <p className="text-xl font-medium text-[#6c3518]">
                          Hello, {userName || "User"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pl-16">
                      <Link
                        href="/account?tab=profile"
                        className="text-xs font-bold uppercase tracking-widest text-[#6c3518]/60 hover:text-[#6c3518] py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/account?tab=orders"
                        className="text-xs font-bold uppercase tracking-widest text-[#6c3518]/60 hover:text-[#6c3518] py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Orders
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </nav>

            {/* Mobile Menu Bottom Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 border-t border-gray-100 pt-8 pb-4"
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
