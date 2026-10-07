import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowUpRight } from 'lucide-react';
import { config } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SeoHead } from './SeoHead';

export const NotFoundPage: React.FC = () => {
  const { t, lang, dir } = useLanguage();

  return (
    <div dir={dir} className="min-h-screen flex flex-col justify-between bg-white">
      <SeoHead pathname="/404" lang={lang} />
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-extrabold shadow-sm"
          style={{ backgroundColor: config.colors.primary }}
        >
          404
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
          {t.notFound.title}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
          {t.notFound.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
            style={{ backgroundColor: config.colors.primary }}
          >
            <Home className="w-4 h-4" />
            <span>{t.notFound.backHome}</span>
          </Link>

          <Link
            to="/m/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <span>{t.notFound.viewDemo}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};
