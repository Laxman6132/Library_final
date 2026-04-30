import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import bgImage from '../assets/library_image_for_background.jpg';

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 1, delay: 1.5, ease: 'power3.out' }
    );
    gsap.fromTo(subtitleRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 1, delay: 2, ease: 'power3.out' }
    );

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 600);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen" style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.6s ease' }}>
      {/* Blurred background */}
      <div className="splash-bg" style={{ backgroundImage: `url(${bgImage})` }} />

      {/* Content */}
      <div className="splash-content">
        {/* Animated SVG Logo */}
        <div className="splash-logo">
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            {/* Outer rounded rectangle */}
            <rect
              className="svg-draw"
              x="10" y="10" width="100" height="100" rx="20" ry="20"
              strokeWidth="3"
            />
            {/* S letter */}
            <path
              className="svg-draw"
              d="M45 40 Q45 32 55 32 L65 32 Q75 32 75 40 Q75 48 65 48 L55 48 Q45 48 45 56 L45 60 Q45 68 55 68 L65 68 Q75 68 75 60"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ animationDelay: '0.5s' }}
            />
            {/* N letter */}
            <path
              className="svg-draw"
              d="M42 88 L42 72 L58 88 L58 72"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animationDelay: '1s' }}
            />
            {/* Small decorative lines */}
            <line className="svg-draw" x1="64" y1="72" x2="64" y2="88" strokeWidth="2" style={{ animationDelay: '1.2s' }} />
            <line className="svg-draw" x1="70" y1="76" x2="78" y2="76" strokeWidth="2" style={{ animationDelay: '1.4s' }} />
            <line className="svg-draw" x1="70" y1="84" x2="78" y2="84" strokeWidth="2" style={{ animationDelay: '1.6s' }} />
          </svg>
        </div>

        {/* App Name */}
        <div ref={titleRef} className="splash-title" style={{ animation: 'none' }}>SCAN NEXUS</div>
        <div ref={subtitleRef} className="splash-subtitle" style={{ animation: 'none' }}>Library Management System</div>

        {/* Loading bar */}
        <div className="splash-loader">
          <div className="splash-loader-bar" />
        </div>
      </div>
    </div>
  );
}
