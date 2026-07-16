
import React, { useEffect, useRef } from 'react';
import { TranslationStrings } from '../types';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  t: TranslationStrings;
}

// Simple accessible dialog: closes on Escape, traps Tab focus inside,
// and restores focus to the trigger element on close.
const ContactModal: React.FC<ContactModalProps> = ({ open, onClose, t }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative animate-fade-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label={t.closeLabel}
          className="absolute top-3 right-3 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 id="contact-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t.contactModalTitle}</h2>
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t.developerEmailLabel}</span>
            <p><a href="mailto:sahgyan9@gmail.com" className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:underline transition-colors font-medium">sahgyan9@gmail.com</a></p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t.contactPhoneNepalLabel}</span>
            <p><a href="tel:+9779816836293" className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:underline transition-colors font-medium">+977 9816836293</a></p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t.contactPhoneIndiaLabel}</span>
            <p><a href="tel:+916301781885" className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:underline transition-colors font-medium">+91 6301781885</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
