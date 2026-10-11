import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LogIn,
  MessageCircle,
  AlertCircle,
  Check,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../menus';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  signInWithEmailPassword,
  requestPasswordReset,
} from '../lib/store';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOGIN_TEXT: Record<
  Language,
  {
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    forgotPassword: string;
    resetSentMessage: string;
    signInBtn: string;
    signingIn: string;
    requestAccountWaMsg: string;
    backToHome: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
  }
> = {
  ar: {
    title: 'تسجيل الدخول إلى لوحة التحكم',
    subtitle: 'أدر قائمة مقهاك أو مطعمك، الطلبات المباشرة ورموز QR للطاولات.',
    emailLabel: 'البريد الإلكتروني المهني',
    passwordLabel: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetSentMessage:
      'إذا كان البريد مسجلاً، فقد تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.',
    signInBtn: 'Se connecter',
    signingIn: 'Connexion en cours...',
    requestAccountWaMsg:
      'السلام عليكم My Menu، أرغب في طلب حساب ولوحة تحكم لمقهاي / مطعمي.',
    backToHome: 'العودة إلى الرئيسية',
    emailRequired: 'يرجى إدخال البريد الإلكتروني.',
    emailInvalid: 'صيغة البريد الإلكتروني غير صحيحة.',
    passwordRequired: 'يرجى إدخال كلمة المرور.',
  },
  fr: {
    title: 'Espace Client & Restaurant',
    subtitle: 'Gérez votre menu digital, vos commandes en direct et vos QR de tables.',
    emailLabel: 'Adresse e-mail',
    passwordLabel: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    resetSentMessage:
      'Si un compte existe avec cet e-mail, un lien de réinitialisation vous a été envoyé.',
    signInBtn: 'Se connecter',
    signingIn: 'Connexion en cours...',
    requestAccountWaMsg:
      'Bonjour My Menu, je souhaite demander la création de mon compte restaurant et mon menu QR.',
    backToHome: 'Retour à l’accueil',
    emailRequired: 'Veuillez saisir votre adresse e-mail.',
    emailInvalid: 'Veuillez saisir une adresse e-mail valide.',
    passwordRequired: 'Veuillez saisir votre mot de passe.',
  },
  en: {
    title: 'Restaurant Owner Sign In',
    subtitle: 'Manage your digital menu, live orders, customers, and table QR codes.',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    resetSentMessage:
      'If an account matches this email, a password reset link has been sent.',
    signInBtn: 'Se connecter',
    signingIn: 'Signing in...',
    requestAccountWaMsg:
      'Hello My Menu, I would like to request an account for my cafe / restaurant.',
    backToHome: 'Back to home',
    emailRequired: 'Please enter your email address.',
    emailInvalid: 'Please enter a valid email address.',
    passwordRequired: 'Please enter your password.',
  },
};

export const LoginPage: React.FC = () => {
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const txt = LOGIN_TEXT[lang];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const validateEmailField = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) return txt.emailRequired;
    if (!EMAIL_REGEX.test(trimmed)) return txt.emailInvalid;
    return null;
  };

  const validatePasswordField = (val: string): string | null => {
    if (!val) return txt.passwordRequired;
    return null;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSent(false);

    const eErr = validateEmailField(email);
    const pErr = validatePasswordField(password);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (!isSupabaseConfigured) {
      setError('Connexion indisponible (configuration manquante)');
      return;
    }

    if (eErr || pErr) {
      return;
    }

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
    } catch (err) {
      if (err instanceof Error && err.message === 'CONFIG_MISSING') {
        setError('Connexion indisponible (configuration manquante)');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetSent(false);

    const eErr = validateEmailField(email);
    setEmailError(eErr);
    if (eErr) {
      return;
    }
    if (!isSupabaseConfigured) {
      setError('Connexion indisponible (configuration manquante)');
      return;
    }
    try {
      await requestPasswordReset(email);
    } catch {
      // Never reveal whether the email exists
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
            <div
              role="alert"
              className="rounded-2xl bg-rose-950 text-white p-3.5 flex items-center gap-2.5 text-xs font-bold"
            >
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div
              role="status"
              className="rounded-2xl bg-emerald-950 text-white p-3.5 flex items-center gap-2.5 text-xs font-bold"
            >
              <Check className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{txt.resetSentMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} noValidate className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-extrabold text-neutral-800"
                >
                  {txt.emailLabel}
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    if (emailError) setEmailError(validateEmailField(val));
                    if (error) setError(null);
                  }}
                  onBlur={() => {
                    if (email.length > 0) {
                      setEmailError(validateEmailField(email));
                    }
                  }}
                  placeholder="name@restaurant.com"
                  aria-invalid={Boolean(emailError)}
                  className={`w-full rounded-xl bg-neutral-50 border px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6BBF3A] ${
                    emailError ? 'border-rose-500' : 'border-neutral-200'
                  }`}
                />
                {emailError && (
                  <p className="text-[11px] font-bold text-rose-600">
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-extrabold text-neutral-800"
                  >
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
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    dir="ltr"
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPassword(val);
                      if (passwordError) setPasswordError(validatePasswordField(val));
                      if (error) setError(null);
                    }}
                    placeholder="••••••••"
                    aria-invalid={Boolean(passwordError)}
                    className={`w-full rounded-xl bg-neutral-50 border px-3.5 py-2.5 pe-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6BBF3A] ${
                      passwordError ? 'border-rose-500' : 'border-neutral-200'
                    }`}
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
                {passwordError && (
                  <p className="text-[11px] font-bold text-rose-600">
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
                style={{ backgroundColor: config.colors.primary }}
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>{loading ? txt.signingIn : txt.signInBtn}</span>
              </button>
            </div>
          </form>

          {/* Request Account via Agency WhatsApp (No Public Signup) */}
          <div className="pt-4 border-t border-neutral-100 space-y-3 text-center">
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Pas de compte public. Les comptes sont créés par nos soins.
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
              <span>Demander mon compte</span>
            </a>
          </div>
        </div>
      </main>

      <footer className="py-3 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} {config.brandName} — {config.agencyName}
      </footer>
    </div>
  );
};
