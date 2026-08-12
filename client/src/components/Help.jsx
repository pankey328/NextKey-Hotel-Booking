import React, { useState } from "react";
import { Link } from "react-router-dom";
import helpHeroImage from "../assets/help-bg.avif";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  LifebuoyIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; 

const categories = [
  {
    id: "travelers",
    name: "For Travelers",
    icon: <LifebuoyIcon className="w-6 h-6" />,
  },
  {
    id: "booking",
    name: "Booking Process",
    icon: <CalendarDaysIcon className="w-6 h-6" />,
  },
  {
    id: "vendors",
    name: "For Partners",
    icon: <BuildingOfficeIcon className="w-6 h-6" />,
  },
  {
    id: "account",
    name: "Account Security",
    icon: <UserCircleIcon className="w-6 h-6" />,
  },
];

const allFaqs = [
  {
    id: 1,
    category: "booking",
    question: "How does the booking process work?",
    answer:
      "Once you select a room and choose your check-in and check-out dates, you can submit a reservation request. Your booking will initially be marked as 'Pending'. The property manager will then review and confirm your stay.",
  },
  {
    id: 2,
    category: "booking",
    question: "What do the different colors on the booking calendar mean?",
    answer:
      "Our live calendar prevents double bookings. Red dates are fully booked and unavailable. Yellow dates mean another user has a 'Pending' request awaiting approval. Gray dates are temporarily locked because another user is currently filling out the booking form for those dates.",
  },
  {
    id: 3,
    category: "booking",
    question: "How do I apply promotional coupons?",
    answer:
      "When you open the reservation modal and select your dates, any active offers for that specific property will automatically appear. If your total base rate meets the minimum spend requirement, simply click 'Apply' to instantly deduct the discount from your total.",
  },

  {
    id: 4,
    category: "travelers",
    question: "How do I search for a specific type of room or amenity?",
    answer:
      "You can use our comprehensive filter system on the 'Explore Stays' page. Once you select a hotel, you can further refine your room search by bed size, price range, cancellation policy, and specific amenities like Wi-Fi, Pool Access, or a Balcony.",
  },
  {
    id: 5,
    category: "travelers",
    question: "How do I know if my booking is confirmed?",
    answer:
      "After submitting a reservation, it goes into a 'Pending' state. You can track its progress in your 'My Trips' dashboard. Once the hotel manager approves the request based on availability, the status will change to 'Confirmed'.",
  },
  {
    id: 6,
    category: "travelers",
    question: "Are there any hidden fees?",
    answer:
      "No, NextKey prides itself on transparency. The 'Total Payable' amount shown to you before clicking 'Confirm Reservation' is the final price, inclusive of any applied promotional discounts.",
  },
  {
    id: 7,
    category: "travelers",
    question: "How do I cancel or modify my reservation?",
    answer:
      "You can easily manage your bookings by navigating to the 'My Trips' section in your account dropdown. From there, you can view the status of your pending or confirmed stays and request cancellations based on the property's policy.",
  },
  {
    id: 8,
    category: "travelers",
    question: "What time is check-in and check-out?",
    answer:
      "Standard check-in is typically at 3:00 PM and check-out is at 11:00 AM local time. However, this varies by property. You can find the exact timings on the property details page before you book.",
  },

  {
    id: 9,
    category: "vendors",
    question: "What is the difference between a Vendor and a Hotel account?",
    answer:
      "A 'Vendor' account (accessed via the Admin Dashboard) is for business owners who manage multiple properties. Vendors can add new hotels, manage global coupons, and oversee all properties. A 'Hotel' account (accessed via the Manager Panel) is assigned to a specific property to manage day-to-day operations like room inventory and localized reservations.",
  },
  {
    id: 10,
    category: "vendors",
    question: "How do I list a new hotel or property?",
    answer:
      "If you are an approved Vendor, navigate to your Admin Dashboard and click 'Manage Properties', then select 'Add Hotel'. You will need to provide property details, location, and images. Once submitted, your property will be reviewed by our Super Admin before going live on the platform.",
  },
  {
    id: 11,
    category: "vendors",
    question: "How do I add and manage rooms?",
    answer:
      "Whether you are using the Vendor Portal or the Hotel Manager Panel, navigate to the 'Rooms' section. Click 'Add New Room' to upload room images, specify bed types, set maximum capacities, select amenities, and define your price per night.",
  },
  {
    id: 12,
    category: "vendors",
    question: "How do I manage incoming booking requests?",
    answer:
      "Inside your dashboard, go to the 'Reservations' tab. Here, you will see a list of all guest booking requests. New requests will appear as 'Pending'. You have the authority to review the dates and either 'Approve' or 'Decline' the reservation based on your actual availability.",
  },
  {
    id: 13,
    category: "vendors",
    question: "How do I create promotional coupons for my guests?",
    answer:
      "Vendors can navigate to the 'Coupons' section in their Admin Dashboard. You can generate custom discount codes, set a discount percentage, establish a maximum discount cap, require a minimum spend, and define the active date range. These will automatically appear to eligible users at checkout.",
  },
  {
    id: 14,
    category: "vendors",
    question: "How can I check my vendor registration status?",
    answer:
      "If you recently registered to become a partner, you can click 'Check Vendor Status' in the website footer. Enter your details to see if our Super Admin has approved your application. Once approved, you will gain full access to the Vendor Portal.",
  },

  {
    id: 15,
    category: "account",
    question: "How do I change or recover my password?",
    answer:
      "If you know your current password and want to change it, log in and select 'Reset Password' from your account dropdown to securely update it. If you have forgotten your password, click 'Forgot Password' on the login screen. We will send a secure OTP to your registered email address, which you can use to create a new password.",
  },
];

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("travelers"); 
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = allFaqs.filter((faq) => {
    if (searchQuery) {
      return (
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return faq.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-neutral-950 transition-colors duration-500 font-sans text-neutral-900 dark:text-neutral-100 pb-24">
      {/* HERO SECTION WITH SEARCH */}
      <section className="relative w-full py-32 flex flex-col items-center justify-center overflow-hidden bg-neutral-900">
        <img
          src={helpHeroImage}
          alt="Support Team"
          fetchPriority="high"
          rel="preload"
          className="absolute inset-0 w-full h-full object-cover opacity-30 bg-neutral-900"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfd] via-transparent to-transparent dark:from-neutral-950 transition-colors duration-500"></div>

        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 tracking-tight">
            How can we assist you?
          </h1>

          <div className="relative max-w-2xl mx-auto shadow-2xl">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neutral-400" />
            <input
              type="text"
              placeholder="Search for articles, booking steps, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border-none rounded-full py-5 pl-16 pr-6 text-lg outline-none focus:ring-4 ring-blue-500/30 transition-all dark:text-white placeholder-neutral-400"
            />
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 -mt-10">
        {/* CATEGORY SELECTOR */}
        {!searchQuery && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black shadow-xl scale-105"
                    : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                {cat.icon}
                <span className="text-xs font-bold uppercase tracking-widest text-center">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* FAQ ACCORDION LIST */}
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/5 dark:shadow-black/40 border border-neutral-100 dark:border-neutral-800">
          <div className="mb-10 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-6">
            <h2 className="text-2xl md:text-3xl font-serif">
              {searchQuery ? "Search Results" : "Frequently Asked Questions"}
            </h2>
            {searchQuery && (
              <span className="text-sm font-bold bg-neutral-100 dark:bg-neutral-800 px-4 py-1.5 rounded-full">
                {filteredFaqs.length} found
              </span>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 font-light">
              We couldn't find any articles matching "{searchQuery}". Try
              adjusting your search or contact support below.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden transition-colors duration-300 bg-neutral-50 dark:bg-neutral-950/50"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className="text-lg font-medium pr-8">
                      {faq.question}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                        expandedFaq === faq.id
                          ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white transform rotate-180"
                          : "bg-transparent text-neutral-400 border-neutral-300 dark:border-neutral-700"
                      }`}
                    >
                      <ChevronDownIcon className="w-4 h-4 stroke-[3]" />
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-500 ease-in-out ${
                      expandedFaq === faq.id
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <div className="p-6 pt-0 text-neutral-500 dark:text-neutral-400 font-light leading-relaxed border-t border-neutral-100 dark:border-neutral-800/50 mt-2">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STILL NEED HELP CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-12">
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-8">
          <div>
            <h3 className="text-2xl font-serif text-blue-900 dark:text-blue-100 mb-2">
              Still can't find what you're looking for?
            </h3>
            <p className="text-blue-700 dark:text-blue-300/70 font-light">
              Our luxury concierge team is available 24/7 to assist you with any
              inquiries.
            </p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 inline-flex items-center justify-center gap-3 bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-blue-600/20"
          >
            Contact Support <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Help;
