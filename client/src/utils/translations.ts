export type SupportedLanguage = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Bengali';

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  English: {
    // Navigation & Common
    home: 'Home',
    matches: 'Matches',
    verification: 'Verification',
    profile: 'Profile',
    trades: 'Trades & Airborne',
    dashboard: 'Dashboard',
    girlsProfiles: 'Girls Profiles',
    staffMembers: 'Staff Members',
    users: 'Users',
    tradeRequests: 'Trade Requests',
    paymentSettings: 'Payment Settings',
    announcements: 'Announcements',
    customerService: 'Customer Service',
    logout: 'Sign Out',
    signIn: 'Sign In',
    createAccount: 'Create Account',

    // Dashboard & Profiles
    recommendedProfiles: "Recommended Girl's Profiles",
    officialVipClub: 'OFFICIAL VIP CLUB',
    girlsLove: "Girls' Love",
    claimVipCard: 'Claim Gold VIP Card',
    viewDetail: 'View Detail',
    applyForDate: 'Apply for a Date',
    availableBalance: 'Available Balance',
    frozenBalance: 'Frozen Balance',
    confirmAirborneTrade: 'Confirm Airborne Trade',
    roundActive: 'Round Active',

    // Admin & Staff
    adminCenter: 'Admin Command Center',
    staffDashboard: 'Staff Dashboard',
    generalSettings: 'General Settings',
    saveSettings: 'Save Settings',
    status: 'Status',
    outcome: 'Outcome',
    action: 'Actions',
  },

  Hindi: {
    // Navigation & Common
    home: 'मुख्य पृष्ठ',
    matches: 'मुलाकातें',
    verification: 'सत्यापन',
    profile: 'प्रोफाइल',
    trades: 'ट्रेडिंग व गतिविधियां',
    dashboard: 'डैशबोर्ड',
    girlsProfiles: 'गर्ल्स प्रोफाइल',
    staffMembers: 'स्टाफ सदस्य',
    users: 'उपयोगकर्ता',
    tradeRequests: 'ट्रेड अनुरोध',
    paymentSettings: 'भुगतान सेटिंग्स',
    announcements: 'घोषणाएं',
    customerService: 'ग्राहक सेवा',
    logout: 'साइन आउट',
    signIn: 'साइन इन',
    createAccount: 'खाता बनाएं',

    // Dashboard & Profiles
    recommendedProfiles: 'अनुशंसित गर्ल्स प्रोफाइल',
    officialVipClub: 'आधिकारिक वीआईपी क्लब',
    girlsLove: 'गर्ल्स लव',
    claimVipCard: 'गोल्ड वीआईपी कार्ड प्राप्त करें',
    viewDetail: 'विवरण देखें',
    applyForDate: 'डेट के लिए आवेदन करें',
    availableBalance: 'उपलब्ध शेष राशि',
    frozenBalance: 'फ्रीज बैलेंस',
    confirmAirborneTrade: 'ट्रेड की पुष्टि करें',
    roundActive: 'दौर सक्रिय है',

    // Admin & Staff
    adminCenter: 'एडमिन कमांड सेंटर',
    staffDashboard: 'स्टाफ डैशबोर्ड',
    generalSettings: 'सामान्य सेटिंग्स',
    saveSettings: 'सेटिंग्स सहेजें',
    status: 'स्थिति',
    outcome: 'परिणाम',
    action: 'कार्रवाई',
  },

  Tamil: {
    // Navigation & Common
    home: 'முகப்பு',
    matches: 'பொருத்தங்கள்',
    verification: 'சரிபார்ப்பு',
    profile: 'சுயவிவரம்',
    trades: 'வர்த்தகம்',
    dashboard: 'டாஷ்போர்டு',
    girlsProfiles: 'பெண்கள் சுயவிவரங்கள்',
    staffMembers: 'ஊழியர்கள்',
    users: 'பயனர்கள்',
    tradeRequests: 'வர்த்தக கோரிக்கைகள்',
    paymentSettings: 'கட்டண அமைப்புகள்',
    announcements: 'அறிவிப்புகள்',
    customerService: 'வாடிக்கையாளர் சேவை',
    logout: 'வெளியேறு',
    signIn: 'உள்நுழை',
    createAccount: 'கணக்கை உருவாக்கு',

    // Dashboard & Profiles
    recommendedProfiles: 'பரிந்துரைக்கப்பட்ட சுயவிவரங்கள்',
    officialVipClub: 'அதிகாரப்பூர்வ VIP கிளப்',
    girlsLove: 'গার்ள்ஸ் லவ்',
    claimVipCard: 'VIP கார்டைப் பெறுங்கள்',
    viewDetail: 'விவரங்களைப் பார்க்கவும்',
    applyForDate: 'தேதிக்கு விண்ணப்பிக்கவும்',
    availableBalance: 'கிடைக்கும் இருப்பு',
    frozenBalance: 'முடக்கப்பட்ட இருப்பு',
    confirmAirborneTrade: 'வர்த்தகத்தை உறுதிப்படுத்தவும்',
    roundActive: 'சுற்று செயல்படுகிறது',

    // Admin & Staff
    adminCenter: 'நிர்வாக மையம்',
    staffDashboard: 'ஊழியர் டாஷ்போர்டு',
    generalSettings: 'பொது அமைப்புகள்',
    saveSettings: 'சேமிக்க',
    status: 'நிலை',
    outcome: 'முடிவு',
    action: 'நடவடிக்கைகள்',
  },

  Telugu: {
    // Navigation & Common
    home: 'హోమ్',
    matches: 'జంటలు',
    verification: 'ధృవీకరణ',
    profile: 'ప్రొఫైల్',
    trades: 'ట్రేడింగ్',
    dashboard: 'డాష్‌బోర్డ్',
    girlsProfiles: 'అమ్మాయిల ప్రొఫైల్స్',
    staffMembers: 'సిబ్బంది',
    users: 'వినియోగదారులు',
    tradeRequests: 'ట్రేడ్ కోరికలు',
    paymentSettings: 'చెల్లింపు సెట్టింగ్‌లు',
    announcements: 'ప్రకటనలు',
    customerService: 'కస్టమర్ సర్వీస్',
    logout: 'సైన్ అవుట్',
    signIn: 'సైన్ ఇన్',
    createAccount: 'ఖాతాను సృష్టించండి',

    // Dashboard & Profiles
    recommendedProfiles: 'సిఫార్సు చేసిన ప్రొఫైల్స్',
    officialVipClub: 'అధికారిక VIP క్లబ్',
    girlsLove: 'గర్ల్స్ లవ్',
    claimVipCard: 'VIP కార్డ్ పొందండి',
    viewDetail: 'వివరాలు చూడండి',
    applyForDate: 'డేట్ కోసం అప్లై చేయండి',
    availableBalance: 'అందుబాటులో ఉన్న బ్యాలెన్స్',
    frozenBalance: 'ఫ్రోజెన్ బ్యాలెన్స్',
    confirmAirborneTrade: 'ట్రేడ్‌ను నిర్ధారించండి',
    roundActive: 'రౌండ్ యాక్టివ్',

    // Admin & Staff
    adminCenter: 'అడ్మిన్ కమాండ్ సెంటర్',
    staffDashboard: 'స్టాఫ్ డాష్‌బోర్డ్',
    generalSettings: 'జనరల్ సెట్టింగ్‌లు',
    saveSettings: 'సేవ్ చేయండి',
    status: 'స్థితి',
    outcome: 'ఫలితం',
    action: 'చర్యలు',
  },

  Bengali: {
    // Navigation & Common
    home: 'হোম',
    matches: 'ম্যাচসমূহ',
    verification: 'যাচাইকরণ',
    profile: 'প্রোফাইল',
    trades: 'ট্রেডিং ও অ্যাক্টিভিটি',
    dashboard: 'ড্যাশবোর্ড',
    girlsProfiles: 'গার্লস প্রোফাইল',
    staffMembers: 'স্টাফ মেম্বার',
    users: 'ব্যবহারকারী',
    tradeRequests: 'ট্রেড রিকোয়েস্ট',
    paymentSettings: 'পেমেন্ট সেটিংস',
    announcements: 'ঘোষণা',
    customerService: 'কাস্টমার সার্ভিস',
    logout: 'সাইন আউট',
    signIn: 'সাইন ইন',
    createAccount: 'একাউন্ট তৈরি করুন',

    // Dashboard & Profiles
    recommendedProfiles: 'সুপারিশকৃত প্রোফাইলসমূহ',
    officialVipClub: 'অফিসিয়াল ভিআইপি ক্লাব',
    girlsLove: 'গার্লস লাভ',
    claimVipCard: 'গোল্ড ভিআইপি কার্ড পান',
    viewDetail: 'বিস্তারিত দেখুন',
    applyForDate: 'ডেটের জন্য আবেদন করুন',
    availableBalance: 'অবশিষ্ট ব্যালেন্স',
    frozenBalance: 'ফ্রিজ ব্যালেন্স',
    confirmAirborneTrade: 'ট্রেড নিশ্চিত করুন',
    roundActive: 'রাউন্ড অ্যাক্টিভ',

    // Admin & Staff
    adminCenter: 'এডমিন কমান্ড সেন্টার',
    staffDashboard: 'স্টাফ ড্যাশবোর্ড',
    generalSettings: 'সাধারণ সেটিংস',
    saveSettings: 'সেটিংস সেভ করুন',
    status: 'স্ট্যাটাস',
    outcome: 'ফলাফল',
    action: 'অ্যাকশন',
  },
};

export const getTranslation = (lang: SupportedLanguage = 'English', key: string): string => {
  const selectedLangDict = translations[lang] || translations.English;
  return selectedLangDict[key] || translations.English[key] || key;
};
