
'use client';

import { useEffect, useRef, InputHTMLAttributes } from 'react';
import { gsap } from 'gsap';

interface AnimatedPasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  // You can add any custom props here if needed
}

export default function AnimatedPasswordInput({ id = 'password', ...props }: AnimatedPasswordInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !inputRef.current) return;
    
    // GSAP plugins like MorphSVGPlugin and ScrambleTextPlugin might need to be registered
    // For this example, we'll focus on the core animation logic.
    // The original codepen used club plugins which aren't available in the free version.
    // We'll replicate the core show/hide animation.
    
    const EYE = wrapperRef.current.querySelector('.eye');
    const TOGGLE = wrapperRef.current.querySelector('button');
    const INPUT = inputRef.current;
    const UPPER_LID = wrapperRef.current.querySelector('.lid--upper');
    const LOWER_LID = wrapperRef.current.querySelector('.lid--lower');

    if (!EYE || !TOGGLE || !INPUT || !UPPER_LID || !LOWER_LID) return;

    let busy = false;
    
    const handleToggle = () => {
      if (busy) return;
      busy = true;

      const isText = INPUT.matches('[type=password]');
      TOGGLE.setAttribute('aria-pressed', String(isText));
      const duration = 0.125;

      if (isText) {
        // Change to text (open eye)
        gsap.timeline({ onComplete: () => { busy = false; }})
          .to(UPPER_LID, { attr: { d: 'M1 12C1 12 5 20 12 20C19 20 23 12 23 12' } , duration })
          .to(LOWER_LID, { attr: { d: 'M1 12C1 12 5 20 12 20C19 20 23 12 23 12' } , duration }, 0)
          .to(EYE, { scale: 0, duration: duration, transformOrigin: 'center center' }, 0)
          .add(() => { INPUT.type = 'text'; });
      } else {
        // Change to password (close eye)
         gsap.timeline({ onComplete: () => { busy = false; }})
          .to(UPPER_LID, { attr: { d: 'M1 12C1 12 5 4 12 4C19 4 23 12 23 12' } , duration })
          .to(LOWER_ID, { attr: { d: 'M1 12C1 12 5 20 12 20C19 20 23 12 23 12' } , duration }, 0)
          .to(EYE, { scale: 1, duration: duration, transformOrigin: 'center center' }, 0)
          .add(() => { INPUT.type = 'password'; });
      }
    };

    TOGGLE.addEventListener('click', handleToggle);

    // Basic eye follow mouse - simplified
    const MOVE_EYE = ({ x, y }: PointerEvent) => {
        const BOUNDS = EYE.getBoundingClientRect();
        const posX = gsap.utils.mapRange(0, window.innerWidth, -30, 30, x);
        const posY = gsap.utils.mapRange(0, window.innerHeight, -30, 30, y);
        gsap.to(EYE, { xPercent: posX, yPercent: posY, duration: 0.2, ease: 'power2.out' });
    };

    window.addEventListener('pointermove', MOVE_EYE);

    return () => {
      TOGGLE.removeEventListener('click', handleToggle);
      window.removeEventListener('pointermove', MOVE_EYE);
    };

  }, []);

  return (
    <div className="form-group" ref={wrapperRef}>
      <input ref={inputRef} id={id} type="password" required {...props} />
      <button type="button" title="Reveal Password" aria-pressed="false">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id={`eye-open-${id}`}>
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12V20H12H1V12Z" fill="#D9D9D9" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
            </mask>
            <mask id={`eye-closed-${id}`}>
              <path d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12V20H12H1V12Z" fill="#D9D9D9" />
            </mask>
          </defs>
          <path className="lid lid--upper" d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path className="lid lid--lower" d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <g mask={`url(#eye-open-${id})`}>
            <g className="eye">
              <circle cy="12" cx="12" r="4" fill="currentColor" />
              <circle cy="11" cx="13" r="1" fill="var(--glint)" />
            </g>
          </g>
        </svg>
        <span className="sr-only">Reveal</span>
      </button>
    </div>
  );
}
