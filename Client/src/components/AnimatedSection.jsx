import { useEffect, useRef, useState } from 'react';

const AnimatedSection = ({ children, direction = 'left', delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left':
          return 'animate-slide-in-left';
        case 'right':
          return 'animate-slide-in-right';
        case 'up':
          return 'animate-slide-in-up';
        case 'down':
          return 'animate-slide-in-down';
        default:
          return 'animate-slide-in-left';
      }
    }
    return 'animate-slide-in-visible';
  };

  return (
    <div
      ref={sectionRef}
      className={`${getAnimationClass()} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;



