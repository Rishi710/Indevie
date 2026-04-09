"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormState({ name: "", email: "", subject: "", message: "" });
    }, 5000);
  };

  return (
    <main className="relative min-h-screen bg-[#f5f1e6] overflow-x-hidden">
      {/* 🌿 SIMPLIFIED HERO SECTION (Parallax) */}
      <section className="relative h-[95vh] md:h-[95vh] w-full overflow-hidden">
        <div 
          className="fixed inset-0 w-full h-[100vh] md:h-[100vh] z-0 opacity-90"
          style={{
            backgroundImage: "url('/images/connect.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Soft Overlay for depth */}
          <div className="absolute inset-0 bg-[#6c3518]/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-7xl font-Poppins italic text-white mb-4 drop-shadow-xl00">
              Connect With Us
            </h1>
            <p className="text-white/100 text-[10px] md:text-xs uppercase tracking-[0.5em] font-light max-w-lg mx-auto leading-loose">
              Where nature meets timeless beauty rituals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 🍶 CLEAN CONTENT SECTION */}
      <section className="relative z-20 bg-[#f5f1e6] pt-24 pb-40 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* --- LEFT: DETAILS --- */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-16"
          >
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#6c3518]/40 italic">Inquiries</h3>
              <h2 className="text-4xl font-popins text-[#6c3518] leading-tight">
                Get in touch with <br/> Indevie beauty experts.
              </h2>
              <p className="text-sm md:text-base font-poppins text-[#6c3518] leading-relaxed max-w-md">
                Whether you have a question about our products, need guidance on your skincare journey, or want to share your experience,we&apos;re here to listen.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6 group">
                <Mail size={18} strokeWidth={1.5} className="text-[#6c3518]/60" />
                <div className="space-y-1">
                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-popins-bold text-[#6c3518]/50s">Email</h4>
                  <a href="mailto:care@indevie.com" className="text-lg font-popins text-[#6c3518] hover:opacity-60 transition-opacity">care@indevie.com</a>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <Phone size={18} strokeWidth={1.5} className="text-[#6c3518]/60" />
                <div className="space-y-1">
                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-popins-bold text-[#6c3518]/50s">Phone</h4>
                  <a href="tel:+919826604580" className="text-lg font-popins text-[#6c3518] hover:opacity-60 transition-opacity">+919826604580</a>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <MapPin size={18} strokeWidth={1.5} className="text-[#6c3518]/60" />
                <div className="space-y-1">
                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-popins-bold text-[#6c3518]/50s">Location</h4>
                  <p className="text-lg font-popins text-[#6c3518]">Indore, Madhya Pradesh, India</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- RIGHT: MINIMAL FORM --- */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-12 rounded-2xl border border-[#6c3518]/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input 
                  type="text" 
                  placeholder="YOUR NAME"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                  className="bg-transparent border-b border-[#6c3518]/50 py-4 text-[11px] tracking-widest font-popins-medium text-[#6c3518] focus:outline-none focus:border-[#6c3518] transition-all placeholder:text-[#6c3518]/70 uppercase"
                />
                <input 
                  type="email" 
                  placeholder="YOUR EMAIL"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({...formState, email: e.target.value})}
                  className="bg-transparent border-b border-[#6c3518]/50 py-4 text-[11px] tracking-widest font-popins-medium text-[#6c3518] focus:outline-none focus:border-[#6c3518] transition-all placeholder:text-[#6c3518]/70 uppercase"
                />
              </div>

              <input 
                type="text" 
                placeholder="SUBJECT"
                required
                value={formState.subject}
                onChange={(e) => setFormState({...formState, subject: e.target.value})}
                className="w-full bg-transparent border-b border-[#6c3518]/50 py-4 text-[11px] tracking-widest font-medium text-[#6c3518] focus:outline-none focus:border-[#6c3518] transition-all placeholder:text-[#6c3518]/70 uppercase"
              />

              <textarea 
                rows={4}
                placeholder="MESSAGE"
                required
                value={formState.message}
                onChange={(e) => setFormState({...formState, message: e.target.value})}
                className="w-full bg-transparent border-b border-[#6c3518]/50 py-4 text-[11px] tracking-widest font-medium text-[#6c3518] focus:outline-none focus:border-[#6c3518] transition-all placeholder:text-[#6c3518]/70 uppercase resize-none"
              />

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitted}
                  className="group relative w-full h-[60px] bg-[#6c3518] text-[#f5f1e6] rounded-xl overflow-hidden transition-all hover:bg-[#5a2c14] disabled:bg-[#6c3518]/50"
                >
                  <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                      <motion.div 
                        key="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-3"
                      >
                        <span className="text-[10px] uppercase tracking-[0.5em] font-popins-bold">Send Message</span>
                        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="thanks"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-3"
                      >
                        <span className="text-[10px] uppercase tracking-[0.5em] font-bold">Message Sent</span>
                        <CheckCircle2 size={16} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
