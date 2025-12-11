// src/pages/Subscribe.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // If you need back button
import { Film } from "lucide-react";
import { useState } from 'react';
import axios from 'axios'; // Install if needed: npm i axios

const Subscribe = () => {
  // REPLACE WITH YOUR REAL PAYSTACK LINK
  const paystackLink = "https://paystack.shop/pay/jae4p-9un1";

  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/subscribe/create', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Your Supabase token
      });
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      alert('Error starting subscription');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-lg w-full shadow-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 py-8 px-4">
        {/* Film Icon */}
        <Film className="w-15 h-15 md:w-20 md:h-20 text-primary drop-shadow-lg flex-shrink-0" />

        {/* Gradient Title */}
        <h1 className="text-4xl md:text-4xl lg:text-4xl font-black bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
            WatchParty
        </h1>
        </div>

        {/* Description */}
        <p className="text-xl text-gray-300 text-center mb-8">
          Unlimited syncing movie nights, music sync, flying reactions, HD quality
        </p>

        {/* Price Badge */}
        <div className="inline-block mx-auto mb-12 bg-gradient-to-r from-green-500/20 to-blue-500/20 px-8 py-4 rounded-2xl border border-green-500/30">
          <p className="text-4xl font-bold text-white">50 GHS</p>
          <p className="text-lg text-gray-300">per month</p>
          {/*<p className="text-sm text-green-400 mt-1">7-day free trial</p>*/}
        </div>

        {/* Subscribe Button */}
       {/*} <a
          href={paystackLink}
          target="_blank"
          rel="noopener noreferrer"
          
        >
          Subscribe Now
        </a>*/}

        <button
      onClick={handleSubscribe}
      disabled={loading}
      className="block w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-2xl py-5 px-10 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 text-center"
    >
      {loading ? 'Processing...' : 'Subscribe Now'}
    </button>


        {/* Trust Badges */}
        <div className="mt-8 flex justify-center gap-6 text-gray-400">
          <div className="flex items-center gap-2">
            <span>Visa</span>
            <span>Mastercard</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Mobile Money</span>
            <span>Bank Transfer</span>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-gray-500 text-sm">
          Secure payments by Paystack • Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default Subscribe;