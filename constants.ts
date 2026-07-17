
import React from 'react';
import { NepaliMonth, Language, TranslationStrings } from './types';

export const NEPALI_MONTHS: NepaliMonth[] = [
  { value: 1, name: 'Baishakh', neName: 'बैशाख' }, { value: 2, name: 'Jestha', neName: 'जेठ' }, { value: 3, name: 'Ashadh', neName: 'असार' },
  { value: 4, name: 'Shrawan', neName: 'साउन' }, { value: 5, name: 'Bhadra', neName: 'भदौ' }, { value: 6, name: 'Ashwin', neName: 'असोज' },
  { value: 7, name: 'Kartik', neName: 'कात्तिक' }, { value: 8, name: 'Mangsir', neName: 'मंसिर' }, { value: 9, name: 'Poush', neName: 'पुस' },
  { value: 10, name: 'Magh', neName: 'माघ' }, { value: 11, name: 'Falgun', neName: 'फागुन' }, { value: 12, name: 'Chaitra', neName: 'चैत' }
];

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  en: {
    title: "Village Calculator | Nepali Compound Interest",
    description: "Calculate interest based on Bikram Sambat (BS) dates. Perfect for village loans.",
    principalLabel: "Principal Amount (रु)",
    quickAddLabel: "Tap to add:",
    quickSelectLabel: "Quick select:",
    npr: "NPR",
    startDateLabel: "Start Date (BS)",
    endDateLabel: "End Date (BS)",
    today: "Today",
    interestRateLabel: "Monthly Interest Rate (%)",
    calculateBtn: "Calculate Interest",
    resultsHeading: "Calculation Results",
    interestPeriod: "Interest Period:",
    totalInterest: "Total Interest Earned:",
    totalAmount: "Total Amount (Principal + Interest):",
    note: "Note: Interest is compounded annually for full years. For any remaining period (months and days), simple interest is calculated on the compounded principal using a daily rate derived from the monthly rate (assuming 30 days per month for conversion). The duration (Saal, Mahina, Din) also assumes a 30-day month when calculating the 'Din' component if borrowing from a previous month is necessary.",
    footer: "Powered by React, Tailwind CSS, and NepaliDateConverter.",
    saal: "Saal",
    mahina: "Mahina",
    din: "Din",
    loading: "Loading Date Utilities...",
    errorPrincipal: "Principal amount must be a positive number.",
    errorRate: "Monthly interest rate must be a non-negative number.",
    errorLibrary: "Nepali date library is not loaded yet. Please wait a moment.",
    errorConversion: "Error converting BS to AD dates. Library may not be fully functional for these dates.",
    errorEndDate: "End date must be on or after the start date.",
    errorGeneral: "Error during calculation. Please check dates and inputs. Ensure dates are valid BS dates.",
    savePng: "Save as PNG",
    bs: "BS",
    history: "Calculation History",
    noHistory: "No history yet.",
    delete: "Delete",
    deleteConfirm: "Delete this entry from history? This cannot be undone.",
    clearHistory: "Clear History",
    clearHistoryConfirm: "Clear all calculation history? This cannot be undone.",
    clearLabel: "Clear",
    aboutTitle: "About Nepali Compound Interest Calculator",
    aboutText: "This tool is specifically designed for the Nepali context, where interest is often calculated based on Bikram Sambat (BS) dates. Whether you are looking for a 'Village Compound Calculator' for local lending or a professional 'Nepali Interest Calculator' for personal finance, our app provides accurate results using standard Nepali calendar rules.",
    faqTitle: "Frequently Asked Questions",
    faq1Q: "What is a Village Compound Calculator?",
    faq1A: "In many parts of Nepal, local lenders quote a monthly interest rate but compound it annually. This calculator simplifies that process by allowing you to input the principal and monthly rate directly in BS dates, then compounding annually for full years and applying simple interest for any remaining months and days.",
    faq2Q: "How accurate is the Nepali Date conversion?",
    faq2A: "We use the standard NepaliDateConverter library to ensure that Bikram Sambat dates are correctly handled, including leap years and varying month lengths in the BS calendar.",
    developerTitle: "Developer",
    developerNameLabel: "Name",
    developerEmailLabel: "Email",
    developerWebsiteLabel: "Website",
    contactTitle: "Need a Website, App, or Custom Solution?",
    contactText: "I build websites, mobile apps, and custom software solutions for businesses. If you have a project in mind, let's talk about how I can help bring it to life.",
    contactBtn: "Contact Me",
    contactWebsiteBtn: "Visit My Portfolio",
    contactModalTitle: "Contact Me",
    contactPhoneNepalLabel: "Phone (Nepal)",
    contactPhoneIndiaLabel: "Phone (India)",
    closeLabel: "Close",
    supportTitle: "Support the Developer",
    supportText: "This calculator is free to use. If it helped you, consider supporting its development with a small tip. Scan the Citizens Bank QR below from any banking or payment app. Every bit is appreciated and keeps the project running.",
    supportQrCaption: "Scan to pay via Citizens Bank",
    supportThanks: "Thank you for your support!"
  },
  ne: {
    title: "गाउँले ब्याज क्याल्कुलेटर (Village Calculator)",
    description: "विक्रम संवत (BS) मितिहरूको आधारमा ब्याज गणना गर्नुहोस्।",
    principalLabel: "साँवा रकम (रु)",
    quickAddLabel: "थप्न ट्याप गर्नुहोस्:",
    quickSelectLabel: "छिटो छान्नुहोस्:",
    npr: "नेपाली रुपैयाँ",
    startDateLabel: "सुरु मिति (BS)",
    endDateLabel: "अन्तिम मिति (BS)",
    today: "आज",
    interestRateLabel: "मासिक ब्याज दर (%)",
    calculateBtn: "ब्याज गणना गर्नुहोस्",
    resultsHeading: "गणनाको नतिजा",
    interestPeriod: "ब्याज अवधि:",
    totalInterest: "कुल आर्जित ब्याज:",
    totalAmount: "कुल रकम (साँवा + ब्याज):",
    note: "नोट: पूर्ण वर्षहरूको लागि ब्याज वार्षिक रूपमा चक्रवृद्धि गरिन्छ। बाँकी अवधिका लागि (महिना र दिनहरू), मासिक दरबाट निकालिएको दैनिक दर प्रयोग गरी साधारण ब्याज गणना गरिन्छ (परिवर्तनको लागि महिनामा ३० दिन मानिएको छ)। अवधि (साल, महिना, दिन) गणना गर्दा अघिल्लो महिनाबाट सापटी लिनुपर्ने भएमा ३० दिनको महिना मानिएको छ।",
    footer: "React, Tailwind CSS, र NepaliDateConverter द्वारा संचालित।",
    saal: "साल",
    mahina: "महिना",
    din: "दिन",
    loading: "मिति उपयोगिताहरू लोड हुँदैछ...",
    errorPrincipal: "साँवा रकम सकारात्मक संख्या हुनुपर्छ।",
    errorRate: "मासिक ब्याज दर गैर-नकारात्मक संख्या हुनुपर्छ।",
    errorLibrary: "नेपाली मिति पुस्तकालय अझै लोड भएको छैन। कृपया एकछिन पर्खनुहोस्।",
    errorConversion: "BS बाट AD मिति परिवर्तन गर्दा त्रुटि भयो।",
    errorEndDate: "अन्तिम मिति सुरु मिति भन्दा पछि वा सोही दिन हुनुपर्छ।",
    errorGeneral: "गणनाको क्रममा त्रुटि भयो। कृपया मिति र इनपुटहरू जाँच गर्नुहोस्।",
    savePng: "PNG को रूपमा बचत गर्नुहोस्",
    bs: "वि.सं.",
    history: "गणनाको इतिहास",
    noHistory: "अझै कुनै इतिहास छैन।",
    delete: "हटाउनुहोस्",
    deleteConfirm: "यो प्रविष्टि इतिहासबाट मेटाउने हो? यो फिर्ता लिन सकिँदैन।",
    clearHistory: "इतिहास मेटाउनुहोस्",
    clearHistoryConfirm: "सम्पूर्ण गणना इतिहास मेटाउने हो? यो फिर्ता लिन सकिँदैन।",
    clearLabel: "खाली गर्नुहोस्",
    aboutTitle: "नेपाली चक्रवृद्धि ब्याज क्याल्कुलेटरको बारेमा",
    aboutText: "यो उपकरण विशेष गरी नेपाली सन्दर्भको लागि डिजाइन गरिएको हो, जहाँ ब्याज प्रायः विक्रम संवत (BS) मितिहरूको आधारमा गणना गरिन्छ। चाहे तपाईं स्थानीय ऋणको लागि 'गाउँले ब्याज क्याल्कुलेटर' खोज्दै हुनुहुन्छ वा व्यक्तिगत वित्तको लागि व्यावसायिक 'नेपाली ब्याज क्याल्कुलेटर', हाम्रो एपले मानक नेपाली क्यालेन्डर नियमहरू प्रयोग गरेर सही नतिजाहरू प्रदान गर्दछ।",
    faqTitle: "बारम्बार सोधिने प्रश्नहरू",
    faq1Q: "गाउँले ब्याज क्याल्कुलेटर के हो?",
    faq1A: "नेपालका धेरै भागहरूमा, स्थानीय ऋणदाताहरूले मासिक ब्याज दर तोक्छन् तर वार्षिक रूपमा चक्रवृद्धि गर्छन्। यो क्याल्कुलेटरले तपाईंलाई साँवा र मासिक दर सिधै BS मितिहरूमा इनपुट गर्न दिन्छ, अनि पूर्ण वर्षका लागि वार्षिक चक्रवृद्धि र बाँकी महिना/दिनका लागि साधारण ब्याज गणना गर्छ।",
    faq2Q: "नेपाली मिति परिवर्तन कत्तिको सही छ?",
    faq2A: "हामी विक्रम संवत मितिहरू सही रूपमा ह्यान्डल गरिएको सुनिश्चित गर्न मानक NepaliDateConverter पुस्तकालय प्रयोग गर्छौं।",
    developerTitle: "विकासकर्ता",
    developerNameLabel: "नाम",
    developerEmailLabel: "इमेल",
    developerWebsiteLabel: "वेबसाइट",
    contactTitle: "वेबसाइट, एप, वा अनुकूल समाधान चाहिन्छ?",
    contactText: "म व्यवसायहरूको लागि वेबसाइट, मोबाइल एप, र अनुकूल सफ्टवेयर समाधानहरू बनाउँछु। यदि तपाईंसँग कुनै प्रोजेक्ट छ भने, म कसरी मद्दत गर्न सक्छु भन्ने बारे कुरा गरौं।",
    contactBtn: "मलाई सम्पर्क गर्नुहोस्",
    contactWebsiteBtn: "मेरो पोर्टफोलियो हेर्नुहोस्",
    contactModalTitle: "मलाई सम्पर्क गर्नुहोस्",
    contactPhoneNepalLabel: "फोन (नेपाल)",
    contactPhoneIndiaLabel: "फोन (भारत)",
    closeLabel: "बन्द गर्नुहोस्",
    supportTitle: "विकासकर्तालाई सहयोग गर्नुहोस्",
    supportText: "यो क्याल्कुलेटर निःशुल्क छ। यदि यसले तपाईंलाई मद्दत गर्‍यो भने, सानो सहयोग गरेर यसको विकासमा सहयोग गर्न सक्नुहुन्छ। तलको Citizens Bank QR कुनै पनि बैंकिङ वा भुक्तानी एपबाट स्क्यान गर्नुहोस्। तपाईंको सानो सहयोगले पनि यो परियोजनालाई निरन्तरता दिन मद्दत गर्छ।",
    supportQrCaption: "Citizens Bank मार्फत भुक्तानी गर्न स्क्यान गर्नुहोस्",
    supportThanks: "तपाईंको सहयोगको लागि धन्यवाद!"
  }
};

// Quick-add principal amounts shown as tappable chips below the principal input.
export const QUICK_ADD_PRINCIPALS: number[] = [10000, 20000, 30000, 100000];

// Quick-select monthly interest rates shown as tappable chips below the rate input.
export const QUICK_SELECT_RATES: number[] = [2, 2.5, 3];

export const NEPALI_YEAR_START = 2075; // Bikram Sambat year
export const NEPALI_YEAR_END = 2100;   // Bikram Sambat year

// Fixed: Rewrote component using React.createElement to resolve JSX parsing errors.
export const CalendarIcon: React.FC<{className?: string}> = ({ className = "w-5 h-5" }) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5M12 12.75h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm-3-3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm-3-3h.008v.008H6v-.008Zm0 3h.008v.008H6v-.008Zm6-3h.008v.008H15v-.008Zm0 3h.008v.008H15v-.008Z"
    })
  )
);

// Renders the Indian/Nepali Rupee sign (₹). Previously used a Euro-sign icon path by mistake.
export const CurrencyNPRIcon: React.FC<{className?: string}> = ({ className = "w-5 h-5" }) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    className: className,
    'aria-hidden': "true"
  },
    React.createElement('text', {
      x: "12",
      y: "13",
      textAnchor: "middle",
      dominantBaseline: "central",
      fontSize: "15",
      fontWeight: "700",
      fill: "currentColor",
      fontFamily: "Arial, Helvetica, sans-serif"
    }, 'रु')
  )
);

// Fixed: Rewrote component using React.createElement to resolve JSX parsing errors.
export const PercentIcon: React.FC<{className?: string}> = ({ className = "w-5 h-5" }) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6 2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25-2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
    }),
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M15.5 17.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
    }),
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M8.5 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
    })
  )
);

export const MailIcon: React.FC<{className?: string}> = ({ className = "w-5 h-5" }) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
    })
  )
);

export const GlobeAltIcon: React.FC<{className?: string}> = ({ className = "w-5 h-5" }) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247"
    })
  )
);

export const DEFAULT_NEPALI_YEAR = 2080;
export const DEFAULT_NEPALI_MONTH = 1; // Baishakh (1-indexed)
export const DEFAULT_NEPALI_DAY = 1;
