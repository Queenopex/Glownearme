import { useEffect, useRef, useState } from 'react';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';
import { loginConfig } from '../config';
import { login } from '../lib/api';
import gsap from 'gsap';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'client' | 'artist';
  onLoginSuccess?: (user: {
    id: string;
    role: 'client' | 'artist';
    artistId?: string;
    name: string;
    email: string;
    location: string;
  }) => void;
}

const LoginModal = ({
  isOpen,
  onClose,
  defaultType = 'client',
  onLoginSuccess,
}: LoginModalProps) => {
  const [activeTab, setActiveTab] = useState<'client' | 'artist'>(defaultType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(defaultType);
  }, [defaultType]);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultType === 'client' ? 'maya@glownearme.com' : 'chioma@glownearme.com');
      setPassword('demo123');
      setErrorMessage('');
    }
  }, [defaultType, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Animate in
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, y: 50, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', delay: 0.1 }
      );
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(contentRef.current, {
      scale: 0.9,
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });
    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await login({
        role: activeTab,
        email,
        password,
      });

      onLoginSuccess?.(response.data);
      handleClose();
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid login details. Use the demo credentials prefilled in the form.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm opacity-0"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-md bg-neutral-900 border border-white/10 overflow-hidden opacity-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink/10 -translate-y-1/2 translate-x-1/2 rotate-45" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('client')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-display font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'client'
                ? 'bg-pink text-black'
                : 'bg-transparent text-white/60 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Client
          </button>
          <button
            onClick={() => setActiveTab('artist')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-display font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'artist'
                ? 'bg-pink text-black'
                : 'bg-transparent text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Artist
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight mb-2">
              {activeTab === 'client' ? loginConfig.clientTitle : loginConfig.artistTitle}
            </h2>
            <p className="font-body text-white/50 text-sm">
              {activeTab === 'client' ? loginConfig.clientSubtitle : loginConfig.artistSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginConfig.emailPlaceholder}
                className="w-full bg-black border border-white/10 pl-12 pr-4 py-3 font-body text-white placeholder:text-white/30 focus:border-pink focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={loginConfig.passwordPlaceholder}
                className="w-full bg-black border border-white/10 pl-12 pr-4 py-3 font-body text-white placeholder:text-white/30 focus:border-pink focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a href="#" className="font-body text-xs text-pink hover:text-white transition-colors">
                {loginConfig.forgotPasswordText}
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink text-black font-display font-bold text-sm uppercase tracking-wider py-4 hover:bg-white transition-colors duration-300"
            >
              {isSubmitting
                ? 'Signing in...'
                : activeTab === 'client'
                  ? loginConfig.clientButtonText
                  : loginConfig.artistButtonText}
            </button>
            {errorMessage ? (
              <p className="font-body text-sm text-red-400">{errorMessage}</p>
            ) : null}
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-body text-xs text-white/40 uppercase">{loginConfig.orText}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-display font-bold text-sm uppercase tracking-wider py-4 hover:bg-white/90 transition-colors duration-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loginConfig.googleButtonText}
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <span className="font-body text-sm text-white/50">
              {loginConfig.noAccountText}{' '}
            </span>
            <a href="#" className="font-body text-sm text-pink hover:text-white transition-colors">
              {loginConfig.signupLinkText}
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-pink/20" />
      </div>
    </div>
  );
};

export default LoginModal;
