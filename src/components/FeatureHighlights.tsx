import React from 'react';
import { Clock, Eye, Shield } from 'lucide-react';

const FeatureHighlights = () => {
  const features = [
    {
      icon: Clock,
      title: 'Quick Setup',
      description: 'Publish a comment period in minutes.'
    },
    {
      icon: Eye,
      title: 'Accessible Design',
      description: 'USWDS components, WCAG AA compliant.'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Industry-standard security practices protect your information.'
    }
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center">
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                  style={{ backgroundColor: '#0050D8' }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;