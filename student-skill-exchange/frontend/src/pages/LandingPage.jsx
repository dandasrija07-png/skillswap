import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Stats from '../components/Stats.jsx';
import Categories from '../components/Categories.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import FeaturedStudents from '../components/FeaturedStudents.jsx';
import WhyChooseUs from '../components/WhyChooseUs.jsx';
import Testimonials from '../components/Testimonials.jsx';
import CTASection from '../components/CTASection.jsx';
import Footer from '../components/Footer.jsx';

export default function LandingPage() {
  const location = useLocation();

  // Handle hash scrolling if navigating from another page
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <Stats />
        <Categories />
        <HowItWorks />
        <FeaturedStudents />
        <WhyChooseUs />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

