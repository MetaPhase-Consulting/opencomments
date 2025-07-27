import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SecurityBanner from './SecurityBanner';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ 
  children, 
  title = "OpenComments", 
  description = "Public commenting platform for transparent government" 
}) => {
  React.useEffect(() => {
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [title, description]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;