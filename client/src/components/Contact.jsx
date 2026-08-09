import React, { useState } from "react";
import contactHeroImage from "../assets/contact-bg.avif";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; 

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("submitting");

    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-neutral-950 transition-colors duration-500 font-sans text-neutral-900 dark:text-neutral-100 pb-24">
      {/* HERO SECTION */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-neutral-900">
          <LazyLoadImage
            src={contactHeroImage}
            alt="Luxury Concierge"
            effect="blur"
            fetchPriority="high"
            wrapperClassName="w-full h-full block bg-neutral-900"
            className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfd] via-[#fdfdfd]/20 to-transparent dark:from-neutral-950 dark:via-neutral-950/40 transition-colors duration-500"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center mt-12">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-white mb-6">
            We're Here For You
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 tracking-tight leading-tight">
            Get in Touch
          </h1>
          <p className="text-lg text-white/80 font-light max-w-xl mx-auto">
            Whether you have a question about a reservation, property listing,
            or simply need travel inspiration, our concierge team is ready to
            assist.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/5 dark:shadow-black/40 border border-neutral-100 dark:border-neutral-800">
              <h3 className="text-2xl font-serif mb-8">Contact Information</h3>

              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                    <EnvelopeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-1">
                      Email Us
                    </h4>
                    <a
                      href="mailto:support@nextkey.com"
                      className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      support@nextkey.com
                    </a>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-light">
                      We aim to reply within 2 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                    <PhoneIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-1">
                      Call Us
                    </h4>
                    <a
                      href="tel:+918001234567"
                      className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      +91 (800) 123-4567
                    </a>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-light">
                      Available 24/7 for active reservations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                    <MapPinIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-1">
                      Headquarters
                    </h4>
                    <p className="text-lg font-medium">
                      NextKey Luxury Operations
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-light leading-relaxed">
                      124 Heritage Boulevard, <br />
                      Jaipur, Rajasthan, 302001 <br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Banner */}
            <div className="bg-neutral-900 dark:bg-white text-white dark:text-black rounded-[2rem] p-8 md:p-10 shadow-xl overflow-hidden relative">
              <ChatBubbleBottomCenterTextIcon className="absolute -bottom-6 -right-6 w-40 h-40 text-white/5 dark:text-black/5" />
              <div className="relative z-10">
                <h3 className="text-2xl font-serif mb-3">Partner Support</h3>
                <p className="text-white/80 dark:text-black/80 font-light text-sm mb-6 leading-relaxed max-w-[250px]">
                  Are you a hotelier or property vendor needing immediate
                  assistance with your dashboard?
                </p>
                <button className="text-xs font-bold uppercase tracking-widest border-b-2 border-white dark:border-black pb-1 hover:opacity-70 transition-opacity">
                  Visit Partner Help Center
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5 dark:shadow-black/40 border border-neutral-100 dark:border-neutral-800">
            <h2 className="text-3xl font-serif mb-2">Send us a message</h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-light mb-8">
              Fill out the form below and our team will get back to you shortly.
            </p>

            {status === "success" ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PaperAirplaneIcon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif text-green-800 dark:text-green-400 mb-2">
                  Message Sent!
                </h3>
                <p className="text-green-600 dark:text-green-500 font-light text-sm">
                  Thank you for reaching out. A member of the NextKey concierge
                  team will review your message and reply soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-sm outline-none focus:border-neutral-900 dark:focus:border-white transition-colors dark:text-white placeholder-neutral-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-sm outline-none focus:border-neutral-900 dark:focus:border-white transition-colors dark:text-white placeholder-neutral-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-sm outline-none focus:border-neutral-900 dark:focus:border-white transition-colors dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Select an inquiry type
                    </option>
                    <option value="Booking Modification">
                      Booking Modification or Cancellation
                    </option>
                    <option value="General Inquiry">
                      General Concierge Inquiry
                    </option>
                    <option value="Property Registration">
                      Property Registration Support
                    </option>
                    <option value="Feedback">Feedback & Suggestions</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-sm outline-none focus:border-neutral-900 dark:focus:border-white transition-colors dark:text-white placeholder-neutral-400 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black font-semibold px-10 py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === "submitting" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
