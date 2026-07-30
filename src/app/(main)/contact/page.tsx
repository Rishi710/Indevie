"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2, Landmark, FileText } from "lucide-react";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formsubmit.co/ajax/support@indevie.com", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          subject: formState.subject,
          message: formState.message,
          _subject: `New Contact Form Submission: ${formState.subject}`,
          _template: "table"
        })
      });

      if (response.ok) {
        setSubmittedName(formState.name);
        setIsSubmitted(true);
        setFormState({ name: "", email: "", subject: "", message: "" });
      } else {
        alert("Failed to send message. Please try again later.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-4xl md:text-7xl font-inter text-white mb-4 drop-shadow-xl00">
              Connect With Us
            </h1>
            <p className="text-white/100 text-[10px] md:text-xs uppercase tracking-[0.5em] font-light max-w-lg mx-auto leading-loose">
              Where nature meets timeless beauty rituals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CLEAN CONTENT SECTION */}
      <section className="relative z-20 bg-[#f5f1e6] pt-24 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* --- LEFT: DETAILS --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-inter font-bold text-[#6c3518]/40 italic">Enquiries</h3>
              <h2 className="text-4xl font-inter text-[#6c3518] leading-tight">
                Get in touch with <br /> Indevie beauty experts.
              </h2>
              <p className="text-sm md:text-base font-inter text-[#6c3518] leading-relaxed max-w-md">
                Whether you have a question about our products, need guidance on your skincare journey, or want to share your experience,we&apos;re here to listen.
              </p>
            </div>

            <div className="space-y-4">

              <div className="flex items-center gap-6 group">
                <FileText size={18} strokeWidth={1.5} className="text-[#6c3518]/60" />
                <div className="space-y-1">
                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-inter-bold text-[#6c3518]/50s">Legal Name</h4>
                  <p className="text-lg font-inter text-[#6c3518] hover:opacity-60 transition-opacity">InGoddess Private Limited</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <Landmark size={18} strokeWidth={1.5} className="text-[#6c3518]/60" />
                <div className="space-y-1">
                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-inter-bold text-[#6c3518]/50s">Trade Name</h4>
                  <p className="text-lg font-inter text-[#6c3518] hover:opacity-60 transition-opacity">Indevie Beauty</p>

                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <Mail size={18} strokeWidth={1.5} className="text-[#6c3518]/60" />
                <div className="space-y-1">
                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-inter-bold text-[#6c3518]/50s">Email</h4>
                  <a href="mailto:care@indevie.com" className="text-lg font-inter text-[#6c3518] hover:opacity-60 transition-opacity">care@indevie.com</a>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <Phone size={18} strokeWidth={1.5} className="text-[#6c3518]/60" />
                <div className="space-y-1">
                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-inter-bold text-[#6c3518]/50s">Phone</h4>
                  <a href="tel:+919981300183" className="text-lg font-inter text-[#6c3518] hover:opacity-60 transition-opacity">+919981300183</a>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <MapPin size={18} strokeWidth={1.5} className="text-[#6c3518]/60" />
                <div className="space-y-1">
                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-inter-bold text-[#6c3518]/50s">Head Office Location</h4>
                  <p className="text-lg font-inter text-[#6c3518]">Plot 96, Indralok Colony, Sudama Nagar,<br /> Indore, Madhya Pradesh, India</p>
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
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-8 bg-white p-8 md:p-12 rounded-2xl border border-[#6c3518]/5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <input
                      type="text"
                      placeholder="YOUR NAME"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="bg-transparent border-b border-[#6c3518]/50 py-4 text-[11px] font-inter tracking-widest font-inter-medium text-[#6c3518] focus:outline-none focus:border-[#6c3518] transition-all placeholder:text-[#6c3518]/70"
                    />
                    <input
                      type="email"
                      placeholder="YOUR EMAIL"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="bg-transparent border-b border-[#6c3518]/50 py-4 text-[11px] font-inter tracking-widest font-inter-medium text-[#6c3518] focus:outline-none focus:border-[#6c3518] transition-all placeholder:text-[#6c3518]/70"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="SUBJECT"
                    required
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full bg-transparent border-b border-[#6c3518]/50 py-4 text-[11px] font-inter tracking-widest font-medium text-[#6c3518] focus:outline-none focus:border-[#6c3518] transition-all placeholder:text-[#6c3518]/70"
                  />

                  <textarea
                    rows={4}
                    placeholder="MESSAGE"
                    required
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full bg-transparent border-b border-[#6c3518]/50 py-4 text-[11px] font-inter tracking-widest font-medium text-[#6c3518] focus:outline-none focus:border-[#6c3518] transition-all placeholder:text-[#6c3518]/70 resize-none"
                  />

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full h-[60px] bg-[#6c3518] font-inter text-[#f5f1e6] rounded-xl overflow-hidden transition-all hover:bg-[#5a2c14] disabled:bg-[#6c3518]/50"
                    >
                      <div className="flex items-center justify-center gap-3 font-inter font-bold">
                        <span className="text-[10px] uppercase tracking-[0.5em] ">
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </span>
                        {!isSubmitting && <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                      </div>
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center space-y-6 bg-white p-8 md:p-12 rounded-2xl border border-[#6c3518]/5 text-center min-h-[450px]"
                >
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 size={48} className="text-[#22c55e]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-inter text-[#22c55e]">Form submitted successfully!</h3>
                  <p className="text-sm md:text-base font-inter text-[#6c3518] leading-relaxed max-w-sm">
                    Thank you {submittedName}! The form has been submitted successfully.<br />We will reply to you soon!
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-8 text-sm font-inter-medium text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
                  >
                    Go back
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section >
    </main >
  );
}
