
import React from 'react';
import { TranslationStrings } from '../types';
import { MailIcon, GlobeAltIcon } from '../constants';

interface InfoSectionsProps {
  t: TranslationStrings;
  onContactClick: () => void;
}

// About / FAQ / Developer / Contact sections, shared between the loading
// state and the main app state so the markup (and anchor ids) never diverge.
const InfoSections: React.FC<InfoSectionsProps> = ({ t, onContactClick }) => (
  <div className="mt-12 w-full max-w-4xl px-4 pb-12">
    <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 shadow-sm mb-8 dark:border dark:border-slate-800" id="about">
      <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-4">{t.aboutTitle}</h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t.aboutText}</p>
    </section>

    <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 shadow-sm dark:border dark:border-slate-800" id="faq">
      <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-6">{t.faqTitle}</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-400 mb-2">{t.faq1Q}</h3>
          <p className="text-gray-700 dark:text-gray-300">{t.faq1A}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-400 mb-2">{t.faq2Q}</h3>
          <p className="text-gray-700 dark:text-gray-300">{t.faq2A}</p>
        </div>
      </div>
    </section>

    {/* Developer Section */}
    <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 shadow-sm mt-8 dark:border dark:border-slate-800" id="developer">
      <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-6">{t.developerTitle}</h2>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="flex-shrink-0">
          <img
            src="/avatar.jpg"
            alt="Gyan Kumar Sah"
            width={112}
            height={112}
            loading="lazy"
            className="w-28 h-28 rounded-full object-cover border-4 border-emerald-200 dark:border-emerald-800 shadow-lg"
          />
        </div>
        <div className="flex-1 text-center sm:text-left space-y-4" itemScope itemType="https://schema.org/Person">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">{t.developerNameLabel}</span>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100" itemProp="name">Gyan Kumar Sah</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <a
              href="mailto:sahgyan9@gmail.com"
              itemProp="email"
              aria-label={t.developerEmailLabel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium rounded-full border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <MailIcon className="w-4 h-4" />
              sahgyan9@gmail.com
            </a>
            <a
              href="https://gyankumarsah.com.np/"
              target="_blank"
              rel="me author noopener noreferrer"
              itemProp="url"
              title="Gyan Kumar Sah - Web & App Developer Portfolio"
              aria-label={t.developerWebsiteLabel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium rounded-full border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <GlobeAltIcon className="w-4 h-4" />
              gyankumarsah.com.np
            </a>
          </div>
        </div>
      </div>
    </section>

    {/* Contact Section */}
    <section className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 shadow-sm mt-8 text-center" id="contact">
      <h2 className="text-2xl font-bold text-white mb-3">{t.contactTitle}</h2>
      <p className="text-emerald-100 max-w-xl mx-auto mb-6">{t.contactText}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onContactClick}
          className="px-6 py-2.5 bg-white text-emerald-700 font-semibold rounded-full shadow-md hover:bg-emerald-50 transition-colors"
        >
          {t.contactBtn}
        </button>
        <a
          href="https://gyankumarsah.com.np/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2.5 bg-white/10 text-white font-semibold rounded-full border border-white/40 hover:bg-white/20 transition-colors"
        >
          {t.contactWebsiteBtn}
        </a>
      </div>
    </section>
  </div>
);

export default InfoSections;
