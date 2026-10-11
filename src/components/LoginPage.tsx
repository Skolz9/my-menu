import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LogIn,
  MessageCircle,
  AlertCircle,
  Check,
  ShieldCheck,
  Store,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../menus';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  signInWithEmailPassword,
  requestPasswordReset,
} from '../lib/store';

const LOGIN_TEXT: Record<
  Language,
  {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    resetSentMessage: string;
    signInBtn: string;
    signingIn: string;
    noPublicSignupNote: string;
    requestAccountBtn: string;
    requestAccountWaMsg: string;
    invalidCredentialsError: string;
    backToHome: string;
    demoQuickAccessTitle: string;
    demoOwner1Btn: string;
    demoOwner2Btn: string;
    demoAdminBtn: string;
  }
> = {
  ar: {
    title: 'تسجيل الدخول إلى لوحة التحكم',
    subtitle: 'أدر قائمة مقهاك أو مطعمك، الطلبات المباشرة ورموز QR للطاولات.',
    emailLabel: 'البريد الإلكتروني المهني',
    emailPlaceholder: 'owner@mymenu.ma',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetSentMessage:
      'إذا كان البريد مسجلاً، فقد تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.',
    signInBtn: 'تسجيل الدخول',
    signingIn: 'جاري تسجيل الدخول...',
    noPublicSignupNote: 'لا يتوفر تسجيل عام. يتم إنشاء الحسابات حصرياً لعملاء My Menu.',
    requestAccountBtn: 'طلب حسابي عبر واتساب',
    requestAccountWaMsg:
      'السلام عليكم My Menu، أرغب في طلب حساب ولوحة تحكم لمقهاي / مطعمي.',
    invalidCredentialsError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    backToHome: 'العودة إلى الرئيسية',
    demoQuickAccessTitle: 'دخول تجريبي سريع (للتجربة الفورية)',
    demoOwner1Btn: 'مالك المقهى 1 (Marina Sol - demo)',
    demoOwner2Btn: 'مالك المقهى 2 (Atlas Garden - عزل RLS)',
    demoAdminBtn: 'المشرف العام (Super Admin)',
  },
  fr: {
    title: 'Espace Client & Restaurant',
    subtitle: 'Gérez votre menu digital, vos commandes en direct et vos QR de tables.',
    emailLabel: 'Adresse e-mail',
    emailPlaceholder: 'owner@mymenu.ma',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'Mot de passe oublié ?',
    resetSentMessage:
      'Si un compte existe avec cet e-mail, un lien de réinitialisation vous a été envoyé.',
    signInBtn: 'Se connecter',
    signingIn: 'Connexion en cours...',
    noPublicSignupNote:
      'Pas d’inscription publique. Les comptes sont activés par notre équipe pour chaque établissement.',
    requestAccountBtn: 'Demander mon compte',
    requestAccountWaMsg:
      'Bonjour My Menu, je souhaite demander la création de mon compte restaurant et mon menu QR.',
    invalidCredentialsError: 'Adresse e-mail ou mot de passe incorrect.',
    backToHome: 'Retour à l’accueil',
    demoQuickAccessTitle: 'Accès démo rapide (test en 1 clic)',
    demoOwner1Btn: 'Propriétaire 1 (Marina Sol — /m/demo)',
    demoOwner2Btn: 'Propriétaire 2 (Atlas Garden — test RLS)',
    demoAdminBtn: 'Super Admin (/admin)',
  },
  en: {
    title: 'Restaurant Owner Sign In',
    subtitle: 'Manage your digital menu, live orders, customers, and table QR codes.',
    emailLabel: 'Email address',
    emailPlaceholder: 'owner@mymenu.ma',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'Forgot password?',
    resetSentMessage:
      'If an account matches this email, a password reset link has been sent.',
    signInBtn: 'Se connecter',
    signingIn: 'Signing in...',
    noPublicSignupNote:
      'No public signup. Accounts are provisioned directly for partner cafes and restaurants.',
    requestAccountBtn: 'Demander mon compte',
    requestAccountWaMsg:
      'Hello My Menu, I would like to request an account for my cafe / restaurant.',
    invalidCredentialsError: 'Invalid email address or password.',
    backToHome: 'Back to home',
    demoQuickAccessTitle: 'Quick Demo Login (1-Click Verification)',
    demoOwner1Btn: 'Owner 1 (Marina Sol — /m/demo)',
    demoOwner2Btn: 'Owner 2 (Atlas Garden — RLS Isolation)',
    demoAdminBtn: 'Super Admin (/admin)',
  },
};

export const LoginPage: React.FC = () => {
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const txt = LOGIN_TEXT[lang];

  const [email, setEmail] = useState('owner@mymenu.ma');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSent(false);
    setLoading(true);
    try {
      const session = await signInWithEmailPassword(email, password);
      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (session.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError(txt.invalidCredentialsError);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (
    demoEmail: string,
    demoPass: string,
    targetRoute: string
  ) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailPassword(demoEmail, demoPass);
      navigate(targetRoute);
    } catch {
      setError(txt.invalidCredentialsError);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    if (!email.trim()) {
      setError(txt.emailLabel);
      return;
    }
    try {
      await requestPasswordReset(email);
    } catch {
      // Show neutral confirmation regardless
    }
    setResetSent(true);
  };

  const requestAccountUrl = getWhatsAppUrl(
    txt.requestAccountWaMsg,
    config.whatsappNumber
  );

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between p-4 sm:p-6"
    >
      {/* Top Bar: Back to home + Language Switcher */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
        >
          {dir === 'rtl' ? (
            <ArrowRight className="w-4 h-4" />
          ) : (
            <ArrowLeft className="w-4 h-4" />
          )}
          <span>{txt.backToHome}</span>
        </Link>

        <LanguageSwitcher />
      </header>

      {/* Centered Login Card */}
      <main className="my-auto py-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center">
              <BrandLogo size="lg" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-950 tracking-tight pt-1">
              {txt.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {txt.subtitle}
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-950 text-white p-3.5 flex items-center gap-2.5 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="rounded-2xl bg-emerald-950 text-white p-3.5 flex items-center gap-2.5 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{txt.resetSentMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-neutral-800">
                {txt.emailLabel}
              </label>
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={txt.emailPlaceholder}
                className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6BBF3A]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-neutral-800">
                  {txt.passwordLabel}
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-[#6BBF3A] hover:underline cursor-pointer"
                >
                  {txt.forgotPassword}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={txt.passwordPlaceholder}
                  className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 pe-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6BBF3A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-2.5 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-sm hover:opacity-95 disabled:opacity-60 transition-opacity cursor-pointer"
              style={{ backgroundColor: config.colors.primary }}
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>{loading ? txt.signingIn : txt.signInBtn}</span>
            </button>
          </form>

          {/* Request Account via Agency WhatsApp (No Public Signup) */}
          <div className="pt-4 border-t border-neutral-100 space-y-3 text-center">
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              {txt.noPublicSignupNote}
            </p>
            <a
              href={requestAccountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle
                className="w-4 h-4 shrink-0"
                style={{ color: config.colors.primary }}
              />
              <span>{txt.requestAccountBtn}</span>
            </a>
          </div>

          {/* 1-Click Demo Evaluator Access Box */}
          <div className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-3.5 space-y-2">
            <p className="text-[11px] font-extrabold text-neutral-600 uppercase tracking-wider">
              {txt.demoQuickAccessTitle}
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('owner@mymenu.ma', 'demo1234', '/dashboard')
                }
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-900 cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#6BBF3A]" />
                  <span>{txt.demoOwner1Btn}</span>
                </span>
                <span dir="ltr" className="text-[10px] font-mono text-neutral-400">
                  owner@mymenu.ma
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('casa@mymenu.ma', 'demo1234', '/dashboard')
                }
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-900 cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{txt.demoOwner2Btn}</span>
                </span>
                <span dir="ltr" className="text-[10px] font-mono text-neutral-400">
                  casa@mymenu.ma
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('admin@mymenu.ma', 'admin1234', '/admin')
                }
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6BBF3A]" />
                  <span>{txt.demoAdminBtn}</span>
                </span>
                <span dir="ltr" className="text-[10px] font-mono text-neutral-400">
                  admin@mymenu.ma
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-3 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} {config.brandName} — {config.agencyName}
      </footer>
    </div>
  );
};
