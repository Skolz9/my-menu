import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Benefits } from './Benefits';
import { Steps } from './Steps';
import { Pricing } from './Pricing';
import { PaymentInfo } from './PaymentInfo';
import { Faq } from './Faq';
import { Footer } from './Footer';
import { SeoHead } from './SeoHead';

export const LandingPage: React.FC = () => {
  const { lang, dir } = useLanguage();

  return (
    <div dir={dir} className="min-h-screen bg-white text-neutral-900">
      <SeoHead pathname="/" lang={lang} />
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Steps />
        <Pricing />
        <PaymentInfo />
        <Faq />
      </main>
      <Footer />
    </div>
  );
};
