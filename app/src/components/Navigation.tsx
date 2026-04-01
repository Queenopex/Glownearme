import { useEffect, useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import { navigationConfig } from '../config';

interface NavigationProps {
  onLoginClick: (type: 'client' | 'artist') => void;
}

const Navigation = ({ onLoginClick }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!navigationConfig.logo) return null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-custom-expo ${
          isScrolled
            ? 'bg-black/90 backdrop-blur-md py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="font-display font-black text-xl tracking-tight text-white hover:text-pink transition-colors duration-300"
          >
            {navigationConfig.logo}<span className="text-pink">{navigationConfig.logoAccent}</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigationConfig.navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body text-sm text-white/70 hover:text-pink transition-colors duration-300 uppercase tracking-widest"
              >
                {link.label}
              </a>
            ))}
            
            {/* Login/Signup Buttons */}
            <div className="flex items-center gap-4 ml-4 border-l border-white/20 pl-6">
              <button 
                onClick={() => onLoginClick('client')}
                className="flex items-center gap-2 font-body text-sm text-white/70 hover:text-pink transition-colors duration-300 uppercase tracking-widest"
              >
                <User className="w-4 h-4" />
                {navigationConfig.loginText}
              </button>
              <button 
                onClick={() => onLoginClick('artist')}
                className="px-5 py-2 border border-pink text-pink font-display font-bold text-xs uppercase tracking-wider hover:bg-pink hover:text-black transition-all duration-300"
              >
                {navigationConfig.signupText}
              </button>
            </div>
            
            {navigationConfig.ctaText && (
              <a
                href={navigationConfig.ctaHref}
                className="px-6 py-2 bg-pink text-black font-display font-bold text-sm uppercase tracking-wider hover:bg-white transition-colors duration-300"
              >
                {navigationConfig.ctaText}
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-all duration-500 ease-custom-expo md:hidden ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navigationConfig.navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-display font-bold text-3xl text-white hover:text-pink transition-colors duration-300 uppercase"
              style={{
                transitionDelay: isMobileMenuOpen ? `${index * 100}ms` : '0ms',
                opacity: isMobileMenuOpen ? 1 : 0,
                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              {link.label}
            </a>
          ))}
          
          {/* Mobile Login Buttons */}
          <div className="flex flex-col gap-4 mt-4">
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLoginClick('client');
              }}
              className="font-display font-bold text-2xl text-white hover:text-pink transition-colors duration-300 uppercase"
              style={{
                transitionDelay: isMobileMenuOpen ? `${navigationConfig.navLinks.length * 100}ms` : '0ms',
                opacity: isMobileMenuOpen ? 1 : 0,
              }}
            >
              {navigationConfig.loginText}
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLoginClick('artist');
              }}
              className="font-display font-bold text-2xl text-pink hover:text-white transition-colors duration-300 uppercase"
              style={{
                transitionDelay: isMobileMenuOpen ? `${(navigationConfig.navLinks.length + 1) * 100}ms` : '0ms',
                opacity: isMobileMenuOpen ? 1 : 0,
              }}
            >
              {navigationConfig.signupText}
            </button>
          </div>
          
          {navigationConfig.ctaText && (
            <a
              href={navigationConfig.ctaHref}
              className="mt-8 px-8 py-3 bg-pink text-black font-display font-bold text-lg uppercase tracking-wider"
              style={{
                transitionDelay: isMobileMenuOpen ? `${(navigationConfig.navLinks.length + 2) * 100}ms` : '0ms',
                opacity: isMobileMenuOpen ? 1 : 0,
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {navigationConfig.ctaText}
            </a>
          )}
        </div>
      </div>
    </>
  );
};

export default Navigation;
