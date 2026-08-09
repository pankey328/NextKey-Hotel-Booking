import React from "react";
import { Link } from "react-router-dom";
import aboutHeroImage from "../assets/about-bg.avif";
import {
  GlobeAltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; 

const About = () => {
  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-neutral-950 transition-colors duration-500 font-sans text-neutral-900 dark:text-neutral-100 pb-24">
      {/* HERO SECTION */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-neutral-900">
          <LazyLoadImage
            src={aboutHeroImage}
            alt="Luxury Architecture"
            effect="blur"
            fetchPriority="high"
            wrapperClassName="w-full h-full block bg-neutral-900"
            className="w-full h-full object-cover opacity-50 scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfd] via-[#fdfdfd]/20 to-transparent dark:from-neutral-950 dark:via-neutral-950/40 transition-colors duration-500"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center mt-12">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-white mb-6">
            Our Story
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-tight leading-tight">
            Elevating the way you <br className="hidden md:block" />
            <span className="italic font-light text-white/90">
              experience the world.
            </span>
          </h1>
        </div>
      </section>

      {/* VISION SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 relative z-20 -mt-12 sm:-mt-20">
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-black/5 dark:shadow-black/40 border border-neutral-100 dark:border-neutral-800 text-center">
          <h2 className="text-2xl md:text-4xl font-serif mb-6 leading-relaxed">
            NextKey was born from a simple idea: booking a luxury stay should
            feel as premium as the stay itself.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-base md:text-lg leading-loose font-light max-w-2xl mx-auto">
            We bridge the gap between discerning travelers and extraordinary
            properties. By strictly curating our collection to include only the
            finest hotels, private villas, and bespoke boutique spaces, we
            remove the noise of endless scrolling. Whether you are escaping to a
            remote coastal villa or an urban penthouse, NextKey is your key to
            the extraordinary.
          </p>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-3">
            What Sets Us Apart
          </h2>
          <h3 className="text-3xl md:text-5xl font-serif">
            The NextKey Standard
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <SparklesIcon className="w-8 h-8" />,
              title: "Curated Excellence",
              desc: "Every property on our platform is handpicked and rigorously vetted for design, service, and location.",
            },
            {
              icon: <ShieldCheckIcon className="w-8 h-8" />,
              title: "Secure & Transparent",
              desc: "No hidden fees, strict verification processes, and bank-level security for every transaction you make.",
            },
            {
              icon: <GlobeAltIcon className="w-8 h-8" />,
              title: "Global Reach",
              desc: "From hidden domestic gems to international luxury destinations, we unlock doors around the globe.",
            },
            {
              icon: <UserGroupIcon className="w-8 h-8" />,
              title: "24/7 Concierge",
              desc: "Our dedicated support team is available around the clock to ensure your journey is absolutely flawless.",
            },
          ].map((value, idx) => (
            <div
              key={idx}
              className="bg-neutral-50 dark:bg-neutral-900/50 p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                {value.icon}
              </div>
              <h4 className="text-xl font-serif font-medium mb-3">
                {value.title}
              </h4>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed font-light">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* DUAL PURPOSE SECTION (Travelers & Partners) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-black dark:bg-neutral-900 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 p-12 md:p-20 flex flex-col justify-center">
            <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white w-max mb-6">
              For Property Owners
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight">
              Elevate your hospitality business.
            </h2>
            <p className="text-white/70 text-lg font-light mb-10 leading-relaxed max-w-md">
              NextKey isn't just for travelers. We provide a powerful, seamless
              dashboard for vendors and hoteliers to manage properties, track
              reservations, and reach a premium global audience.
            </p>
            <Link
              to="/partner-registration"
              className="inline-flex items-center justify-center gap-3 bg-white text-black hover:bg-neutral-200 px-8 py-4 rounded-xl font-bold transition-all active:scale-95 w-max"
            >
              Register as Vendor <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
          <div className="w-full lg:w-1/2 h-80 lg:h-auto relative">
            <LazyLoadImage
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop"
              placeholderSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=10&w=50&auto=format&fit=crop"
              alt="Vendor Dashboard"
              effect="blur"
              wrapperClassName="absolute inset-0 w-full h-full block bg-neutral-200 dark:bg-neutral-800"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-32 text-center">
        <h2 className="text-4xl md:text-6xl font-serif mb-8 tracking-tight">
          Ready to find your next stay?
        </h2>
        <Link
          to="/search"
          className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white hover:bg-blue-700 px-10 py-5 rounded-full font-bold text-lg transition-transform active:scale-95 shadow-xl shadow-blue-600/20"
        >
          Explore The Collection <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
};

export default About;
