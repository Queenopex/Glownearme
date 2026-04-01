import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { howItWorksConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

interface HowItWorksProps {
  onJoinClick?: () => void;
}

const HowItWorks = ({ onJoinClick }: HowItWorksProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const diagonalRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const text = textRef.current;
    const diagonal = diagonalRef.current;
    if (!section || !image || !text || !diagonal) return;

    // Diagonal line rotation on scroll
    const diagonalTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    diagonalTl.fromTo(
      diagonal,
      { rotate: 15 },
      { rotate: -15, ease: 'none' }
    );

    if (diagonalTl.scrollTrigger) {
      triggersRef.current.push(diagonalTl.scrollTrigger);
    }

    // Image depth zoom effect
    const imageTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        end: 'center center',
        scrub: 1,
      },
    });

    imageTl.fromTo(
      image,
      {
        scale: 1.2,
        opacity: 0.5,
      },
      {
        scale: 1,
        opacity: 1,
        ease: 'none',
      }
    );

    if (imageTl.scrollTrigger) {
      triggersRef.current.push(imageTl.scrollTrigger);
    }

    // Text reveal
    const textTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        toggleActions: 'play none none reverse',
      },
    });

    textTl.fromTo(
      text.children,
      {
        y: 80,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: 'expo.out',
      }
    );

    if (textTl.scrollTrigger) {
      triggersRef.current.push(textTl.scrollTrigger);
    }

    // Glitch effect on title
    const title = text.querySelector('.glitch-title');
    if (title) {
      const glitchInterval = setInterval(() => {
        gsap.to(title, {
          x: 2,
          duration: 0.05,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            gsap.set(title, { x: 0 });
          },
        });
      }, 5000);

      return () => {
        clearInterval(glitchInterval);
        triggersRef.current.forEach(trigger => trigger.kill());
        triggersRef.current = [];
      };
    }

    return () => {
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
    };
  }, []);

  if (!howItWorksConfig.headingMain && !howItWorksConfig.headingAccent) return null;

  return (
    <section
      ref={sectionRef}
      id="join"
      className="relative min-h-screen w-full bg-black overflow-hidden"
    >
      {/* Diagonal split line */}
      <div
        ref={diagonalRef}
        className="absolute top-0 left-[60%] w-px h-[200%] bg-pink origin-top z-20"
        style={{ transform: 'rotate(15deg)' }}
      />

      <div className="relative z-10 grid lg:grid-cols-5 min-h-screen">
        {/* Text content - 60% */}
        <div className="lg:col-span-3 flex items-center px-6 lg:px-16 py-24">
          <div ref={textRef} className="max-w-2xl">
            {howItWorksConfig.sectionLabel && (
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-px bg-pink" />
                <span className="font-body text-pink text-sm uppercase tracking-[0.3em]">
                  {howItWorksConfig.sectionLabel}
                </span>
              </div>
            )}

            {(howItWorksConfig.headingMain || howItWorksConfig.headingAccent) && (
              <h2 className="glitch-title font-display font-black text-5xl md:text-7xl lg:text-8xl text-white uppercase tracking-tight mb-8 leading-none">
                {howItWorksConfig.headingMain}
                <br />
                <span className="text-pink">{howItWorksConfig.headingAccent}</span>
              </h2>
            )}

            {howItWorksConfig.tagline && (
              <p className="font-body text-white/60 text-lg md:text-xl leading-relaxed mb-8">
                {howItWorksConfig.tagline}
              </p>
            )}

            {howItWorksConfig.features.length > 0 && (
              <div className="space-y-4 mb-12">
                {howItWorksConfig.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-pink flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                    <span className="font-body text-white/70 text-base">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              {howItWorksConfig.ctaText && (
                <button
                  onClick={onJoinClick}
                  className="group inline-flex items-center gap-4 px-8 py-4 bg-pink text-black font-display font-bold text-sm uppercase tracking-wider hover:bg-white transition-all duration-300"
                  data-cursor-hover
                >
                  <Sparkles className="w-5 h-5" />
                  {howItWorksConfig.ctaText}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              )}
              {howItWorksConfig.secondaryCtaText && (
                <a
                  href={howItWorksConfig.secondaryCtaHref || '#'}
                  className="group inline-flex items-center gap-4 px-8 py-4 border-2 border-white text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300"
                  data-cursor-hover
                >
                  {howItWorksConfig.secondaryCtaText}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Image - 40% */}
        {howItWorksConfig.image && (
          <div className="lg:col-span-2 relative overflow-hidden min-h-[400px] lg:min-h-0">
            <div
              ref={imageRef}
              className="absolute inset-0"
              style={{ perspective: '1000px' }}
            >
              <img
                src={howItWorksConfig.image}
                alt={howItWorksConfig.imageAlt}
                className="w-full h-full object-cover"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />

              {/* Pink accent border */}
              <div className="absolute top-8 right-8 bottom-8 w-px bg-pink/50" />
              <div className="absolute top-8 right-8 left-8 h-px bg-pink/50" />
            </div>
          </div>
        )}
      </div>

      {/* Floating text decoration */}
      {howItWorksConfig.decorativeText && (
        <div className="absolute bottom-12 left-6 font-display font-black text-[6rem] md:text-[10rem] text-white/[0.02] leading-none pointer-events-none select-none">
          {howItWorksConfig.decorativeText}
        </div>
      )}
    </section>
  );
};

export default HowItWorks;
