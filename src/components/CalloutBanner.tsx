import React from 'react';

const CalloutBanner = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0050D8' }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Open source and free for governments. Get started today.
        </h2>
        <a
          href="/signup"
          className="inline-flex items-center justify-center px-8 py-3 text-base font-medium bg-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white hover:bg-gray-100"
          style={{ color: '#0050D8' }}
        >
          Get Started
        </a>
      </div>
    </section>
  );
};

export default CalloutBanner;