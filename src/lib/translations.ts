import { Language, SurveyChoice, Topic } from './types';

export interface Translations {
  appName: string;
  tagline: string;
  agoraBadge: string;
  regionLabel: string;
  signIn: string;
  signOut: string;
  profile: string;
  pts: string;
  latest: string;
  mostActive: string;
  searchPlaceholder: string;
  clear: string;
  debatesCount: string;
  openCitizenAgora: string;
  noDebatesFound: string;
  noDebatesSubtext: string;
  totalVoted: string;
  joinDebateFloor: string;
  share: string;
  copied: string;
  bookmarked: string;
  bookmarkRemoved: string;
  evidenceAttached: string;
  newsArticle: string;
  viewSource: string;
  aiSummary: string;
  aiGenerating: string;
  aiSummaryHeading: string;
  hideSummary: string;
  refineWithAi: string;
  aiRefining: string;
  micListening: string;
  micSpeakNow: string;
  micStop: string;
  micNotSupported: string;
  publishProposition: string;
  newProp: string;
  topicCategory: string;
  propositionQuestion: string;
  targetRegion: string;
  contextPerspective: string;
  mediaUrlLabel: string;
  mediaUrlPlaceholder: string;
  newsUrlLabel: string;
  newsUrlPlaceholder: string;
  allSides: string;
  inFavor: string;
  against: string;
  postArgument: string;
  posting: string;
  argueInFavor: string;
  argueAgainst: string;
  arguePlaceholderPro: string;
  arguePlaceholderCon: string;
  karmaReward: string;
  close: string;
  back: string;
  continueToProp: string;
  perspectivePreview: string;
  livePreview: string;
  pulseTrends: string;
}

export const SURVEY_OPTIONS: Record<
  SurveyChoice,
  {
    en: string;
    hi: string;
    color: string;
    bg: string;
    border: string;
    activeBg: string;
    activeText: string;
    ring: string;
    barColor: string;
    score: number;
  }
> = {
  strongly_agree: {
    en: 'Strongly support',
    hi: 'दृढ़ समर्थन',
    color: 'text-support-strong',
    bg: 'bg-support-soft',
    border: 'border-rule',
    activeBg: 'bg-support-strong',
    activeText: 'text-surface',
    ring: 'ring-support-strong',
    barColor: 'bg-support-strong',
    score: 5,
  },
  agree: {
    en: 'Lean support',
    hi: 'समर्थन',
    color: 'text-support',
    bg: 'bg-support-soft',
    border: 'border-rule',
    activeBg: 'bg-support',
    activeText: 'text-surface',
    ring: 'ring-support',
    barColor: 'bg-support',
    score: 4,
  },
  neutral: {
    en: 'Neutral',
    hi: 'तटस्थ',
    color: 'text-ink-muted',
    bg: 'bg-paper',
    border: 'border-rule',
    activeBg: 'bg-neutral',
    activeText: 'text-surface',
    ring: 'ring-neutral',
    barColor: 'bg-neutral',
    score: 3,
  },
  disagree: {
    en: 'Lean oppose',
    hi: 'विरोध',
    color: 'text-oppose',
    bg: 'bg-oppose-soft',
    border: 'border-rule',
    activeBg: 'bg-oppose',
    activeText: 'text-surface',
    ring: 'ring-oppose',
    barColor: 'bg-oppose',
    score: 2,
  },
  strongly_disagree: {
    en: 'Strongly oppose',
    hi: 'कड़ा विरोध',
    color: 'text-oppose-strong',
    bg: 'bg-oppose-soft',
    border: 'border-rule',
    activeBg: 'bg-oppose-strong',
    activeText: 'text-surface',
    ring: 'ring-oppose-strong',
    barColor: 'bg-oppose-strong',
    score: 1,
  },
};

export const TOPIC_NAMES: Record<Topic, { en: string; hi: string }> = {
  'All Topics': { en: 'All Topics', hi: 'सभी विषय' },
  Economy: { en: 'Economy', hi: 'अर्थव्यवस्था' },
  Education: { en: 'Education', hi: 'शिक्षा' },
  'Civic Life': { en: 'Civic Life', hi: 'नागरिक जीवन' },
  Technology: { en: 'Technology', hi: 'प्रौद्योगिकी' },
};

export const REGION_NAMES: Record<string, { en: string; hi: string }> = {
  'All India': { en: 'All India', hi: 'अखिल भारतीय' },
  'Andhra Pradesh': { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' },
  'Arunachal Pradesh': { en: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश' },
  'Assam': { en: 'Assam', hi: 'असम' },
  'Bihar': { en: 'Bihar', hi: 'बिहार' },
  'Chhattisgarh': { en: 'Chhattisgarh', hi: 'छत्तीसगढ़' },
  'Goa': { en: 'Goa', hi: 'गोवा' },
  'Gujarat': { en: 'Gujarat', hi: 'गुजरात' },
  'Haryana': { en: 'Haryana', hi: 'हरियाणा' },
  'Himachal Pradesh': { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश' },
  'Jharkhand': { en: 'Jharkhand', hi: 'झारखंड' },
  'Karnataka': { en: 'Karnataka', hi: 'कर्नाटक' },
  'Kerala': { en: 'Kerala', hi: 'केरल' },
  'Madhya Pradesh': { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' },
  'Maharashtra': { en: 'Maharashtra', hi: 'महाराष्ट्र' },
  'Manipur': { en: 'Manipur', hi: 'मणिपुर' },
  'Meghalaya': { en: 'Meghalaya', hi: 'मेघालय' },
  'Mizoram': { en: 'Mizoram', hi: 'मिज़ोरम' },
  'Nagaland': { en: 'Nagaland', hi: 'नागालैंड' },
  'Odisha': { en: 'Odisha', hi: 'ओडिशा' },
  'Punjab': { en: 'Punjab', hi: 'पंजाब' },
  'Rajasthan': { en: 'Rajasthan', hi: 'राजस्थान' },
  'Sikkim': { en: 'Sikkim', hi: 'सिक्किम' },
  'Tamil Nadu': { en: 'Tamil Nadu', hi: 'तमिलनाडु' },
  'Telangana': { en: 'Telangana', hi: 'तेलंगाना' },
  'Tripura': { en: 'Tripura', hi: 'त्रिपुरा' },
  'Uttar Pradesh': { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
  'Uttarakhand': { en: 'Uttarakhand', hi: 'उत्तराखंड' },
  'West Bengal': { en: 'West Bengal', hi: 'पश्चिम बंगाल' },
  'Delhi (NCT)': { en: 'Delhi (NCT)', hi: 'दिल्ली (एनसीटी)' },
  'Delhi NCR': { en: 'Delhi NCR', hi: 'दिल्ली एनसीआर' },
  'Jammu and Kashmir': { en: 'Jammu & Kashmir', hi: 'जम्मू और कश्मीर' },
  'Ladakh': { en: 'Ladakh', hi: 'लद्दाख' },
  'Puducherry': { en: 'Puducherry', hi: 'पुदुचेरी' },
  'Chandigarh': { en: 'Chandigarh', hi: 'चंडीगढ़' },
  'Andaman and Nicobar Islands': { en: 'Andaman & Nicobar', hi: 'अंडमान और निकोबार' },
  'Dadra and Nagar Haveli and Daman and Diu': { en: 'Dadra & Daman', hi: 'दादरा व दमन' },
  'Lakshadweep': { en: 'Lakshadweep', hi: 'लक्षद्वीप' },
  'Mumbai': { en: 'Mumbai', hi: 'मुंबई' },
  'Bangalore': { en: 'Bangalore', hi: 'बेंगलुरु' },
  'Hyderabad': { en: 'Hyderabad', hi: 'हैदराबाद' },
};

export const DICTIONARY: Record<Language, Translations> = {
  en: {
    appName: 'JanManch',
    tagline: 'A fair stage for public debates and policy consensus',
    agoraBadge: 'JanManch',
    regionLabel: 'Region:',
    signIn: 'Sign in',
    signOut: 'Sign out',
    profile: 'Profile',
    pts: 'pts',
    latest: 'Latest',
    mostActive: 'Most active',
    searchPlaceholder: 'Search debates, policies, topics...',
    clear: 'Clear',
    debatesCount: 'debates',
    openCitizenAgora: 'Live debates',
    noDebatesFound: 'No debates match this search',
    noDebatesSubtext: 'Try adjusting your search keywords, region, or topic filter.',
    totalVoted: 'Total votes:',
    joinDebateFloor: 'Join discussion',
    share: 'Share',
    copied: 'Link copied to clipboard',
    bookmarked: 'Saved to bookmarks',
    bookmarkRemoved: 'Removed from bookmarks',
    evidenceAttached: 'Evidence attached',
    newsArticle: 'Relevant source',
    viewSource: 'Open link',
    aiSummary: 'AI summary',
    aiGenerating: 'Synthesizing...',
    aiSummaryHeading: 'JanManch AI debate synthesis',
    hideSummary: 'Hide summary',
    refineWithAi: 'Refine with AI',
    aiRefining: 'Refining...',
    micListening: 'Listening...',
    micSpeakNow: 'Speak now (Hindi or English)',
    micStop: 'Stop recording',
    micNotSupported: 'Speech recognition is not supported in this browser.',
    publishProposition: 'Publish debate (+30 Karma)',
    newProp: 'New debate',
    topicCategory: '1. Select topic',
    propositionQuestion: '2. Debate question & region',
    targetRegion: 'Target region',
    contextPerspective: '3. Context & preview',
    mediaUrlLabel: 'Attach evidence URL (PDF, image, report)',
    mediaUrlPlaceholder: 'https://... image or document link',
    newsUrlLabel: 'News or reference link',
    newsUrlPlaceholder: 'https://... reference article link',
    allSides: 'All sides',
    inFavor: 'Support',
    against: 'Oppose',
    postArgument: 'Submit point',
    posting: 'Submitting...',
    argueInFavor: 'Support (Pro)',
    argueAgainst: 'Oppose (Con)',
    arguePlaceholderPro: 'State your perspective in support...',
    arguePlaceholderCon: 'State your perspective in opposition...',
    karmaReward: '+20 Karma',
    close: 'Close',
    back: 'Back',
    continueToProp: 'Continue to question',
    perspectivePreview: 'Context & live preview',
    livePreview: 'Live card preview',
    pulseTrends: 'Trends',
  },
  hi: {
    appName: 'जनमंच',
    tagline: 'लोक नीतियों और जनहित के मुद्दों पर निष्पक्ष मंच',
    agoraBadge: 'जनमंच',
    regionLabel: 'क्षेत्र:',
    signIn: 'प्रवेश करें',
    signOut: 'लॉग आउट',
    profile: 'प्रोफ़ाइल',
    pts: 'अंक',
    latest: 'नवीनतम',
    mostActive: 'सक्रिय',
    searchPlaceholder: 'नागरिक बहसें, नीतियां और विषय खोजें...',
    clear: 'हटाएं',
    debatesCount: 'बहसें',
    openCitizenAgora: 'लाइव बहसें',
    noDebatesFound: 'इस खोज के लिए कोई बहस उपलब्ध नहीं है',
    noDebatesSubtext: 'कृपया अपना खोज शब्द, क्षेत्र या विषय बदलकर देखें।',
    totalVoted: 'कुल मत:',
    joinDebateFloor: 'चर्चा में शामिल हों',
    share: 'साझा करें',
    copied: 'लिंक कॉपी हो गया',
    bookmarked: 'बुकमार्क में सहेजा गया',
    bookmarkRemoved: 'बुकमार्क से हटाया गया',
    evidenceAttached: 'संलग्न साक्ष्य',
    newsArticle: 'प्रासंगिक संदर्भ',
    viewSource: 'स्रोत लिंक खोलें',
    aiSummary: 'AI सारांश',
    aiGenerating: 'विश्लेषण जारी...',
    aiSummaryHeading: 'जनमंच AI मुख्य बिंदु एवं निष्कर्ष',
    hideSummary: 'सारांश छुपाएं',
    refineWithAi: 'AI से सुधारें',
    aiRefining: 'सुधारा जा रहा है...',
    micListening: 'सुन रहे हैं...',
    micSpeakNow: 'अब बोलें (हिंदी या अंग्रेज़ी)',
    micStop: 'रिकॉर्डिंग बंद करें',
    micNotSupported: 'आपके ब्राउज़र में आवाज़ पहचान समर्थित नहीं है।',
    publishProposition: 'बहस प्रकाशित करें (+30 कर्म)',
    newProp: 'नई बहस',
    topicCategory: '1. नीति का विषय चुनें',
    propositionQuestion: '2. बहस प्रश्न व लक्षित क्षेत्र',
    targetRegion: 'लक्षित क्षेत्र',
    contextPerspective: '3. संदर्भ व पूर्वावलोकन',
    mediaUrlLabel: 'साक्ष्य / दस्तावेज़ URL संलग्न करें (PDF, छवि)',
    mediaUrlPlaceholder: 'https://... दस्तावेज़ या छवि लिंक',
    newsUrlLabel: 'प्रासंगिक समाचार या संदर्भ का लिंक जोड़ें',
    newsUrlPlaceholder: 'https://... समाचार लिंक',
    allSides: 'सभी पक्ष',
    inFavor: 'समर्थन',
    against: 'विरोध',
    postArgument: 'तर्क प्रस्तुत करें',
    posting: 'प्रकाशित हो रहा है...',
    argueInFavor: 'समर्थन (Pro)',
    argueAgainst: 'विरोध (Con)',
    arguePlaceholderPro: 'समर्थन में अपना विचार लिखें...',
    arguePlaceholderCon: 'विरोध में अपना विचार लिखें...',
    karmaReward: '+20 कर्म',
    close: 'बंद करें',
    back: 'पीछे',
    continueToProp: 'प्रश्न विवरण पर आगे बढ़ें',
    perspectivePreview: 'संदर्भ व पूर्वावलोकन',
    livePreview: 'कार्ड पूर्वावलोकन',
    pulseTrends: 'रुझान',
  },
};
