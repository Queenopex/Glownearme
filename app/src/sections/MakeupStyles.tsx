import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';
import { makeupStylesConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const MakeupStyles = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const cards = grid.querySelectorAll('.style-card');

    // Grid line draw animation
    const lineTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    });

    lineTl.fromTo(
      '.grid-line-h',
      { scaleX: 0 },
      { scaleX: 1, duration: 1, stagger: 0.1, ease: 'expo.out' }
    );

    lineTl.fromTo(
      '.grid-line-v',
      { scaleY: 0 },
      { scaleY: 1, duration: 1, stagger: 0.1, ease: 'expo.out' },
      0
    );

    if (lineTl.scrollTrigger) {
      triggersRef.current.push(lineTl.scrollTrigger);
    }

    // Cards flip in
    const cardsTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        toggleActions: 'play none none reverse',
      },
    });

    cardsTl.fromTo(
      cards,
      {
        rotateY: 90,
        opacity: 0,
      },
      {
        rotateY: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out',
      }
    );

    if (cardsTl.scrollTrigger) {
      triggersRef.current.push(cardsTl.scrollTrigger);
    }

    return () => {
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
    };
  }, []);

  const handleCardClick = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  if (makeupStylesConfig.styles.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="styles"
      className="relative min-h-screen w-full bg-black py-24 overflow-hidden"
    >
      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal lines */}
        {[0, 33.33, 66.66, 100].map((pos, i) => (
          <div
            key={`h-${i}`}
            className="grid-line-h absolute left-0 right-0 h-px bg-white/10 origin-left"
            style={{ top: `${pos}%` }}
          />
        ))}
        {/* Vertical lines */}
        {[0, 25, 50, 75, 100].map((pos, i) => (
          <div
            key={`v-${i}`}
            className="grid-line-v absolute top-0 bottom-0 w-px bg-white/10 origin-top"
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 text-center">
          {makeupStylesConfig.sectionLabel && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-px bg-pink" />
              <span className="font-body text-pink text-sm uppercase tracking-[0.3em]">
                {makeupStylesConfig.sectionLabel}
              </span>
              <div className="w-12 h-px bg-pink" />
            </div>
          )}
          {(makeupStylesConfig.headingMain || makeupStylesConfig.headingAccent) && (
            <h2 className="font-display font-black text-5xl md:text-7xl text-white uppercase tracking-tight">
              {makeupStylesConfig.headingMain}<span className="text-pink">{makeupStylesConfig.headingAccent}</span>
            </h2>
          )}
        </div>

        {/* Styles grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {makeupStylesConfig.styles.map((style, index) => (
            <div
              key={style.name}
              className={`style-card relative bg-neutral-900 border border-white/10 overflow-hidden cursor-pointer group hover:border-pink transition-all duration-500 ${
                activeIndex === index ? 'ring-2 ring-pink z-10' : ''
              }`}
              onClick={() => handleCardClick(index)}
              data-cursor-hover
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={style.image}
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-custom-expo group-hover:scale-110"
                />
                
                {/* Color overlay */}
                <div 
                  className="absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-60"
                  style={{ backgroundColor: style.color }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Style name on image */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-pink" />
                    <span className="font-body text-pink text-xs uppercase tracking-wider">
                      {style.nameSecondary}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-3xl text-white uppercase tracking-tight">
                    {style.name}
                  </h3>
                </div>
              </div>

              {/* Expanded content */}
              <div className={`p-6 bg-neutral-900 transition-all duration-500 ${
                activeIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
              }`}>
                <p className="font-body text-white/60 text-sm mb-4">
                  {style.description}
                </p>
                <button className="flex items-center gap-2 text-pink font-display font-bold text-xs uppercase tracking-wider hover:text-white transition-colors">
                  Explore Artists
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Corner accent */}
              <div 
                className="absolute top-4 right-4 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: style.color }}
              />
            </div>
          ))}
        </div>

        {/* Bottom text */}
        {makeupStylesConfig.bottomText && (
          <div className="mt-16 text-center">
            <p className="font-body text-white/40 text-sm uppercase tracking-wider">
              {makeupStylesConfig.bottomText}
            </p>
          </div>
        )}
      </div>

      {/* Decorative text */}
      {makeupStylesConfig.decorativeText && (
        <div className="absolute bottom-0 right-0 font-display font-black text-[8rem] md:text-[15rem] text-white/[0.02] leading-none pointer-events-none select-none">
          {makeupStylesConfig.decorativeText}
        </div>
      )}
    </section>
  );
};

export default MakeupStyles;
