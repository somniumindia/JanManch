import { Language, SurveyChoice, Topic, Region } from './types';

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
    en: 'Back',
    hi: 'समर्थन',
    color: 'text-emerald-900',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    activeBg: 'bg-emerald-700',
    activeText: 'text-white',
    ring: 'ring-emerald-600',
    barColor: 'bg-emerald-700',
    score: 5,
  },
  agree: {
    en: 'Lean',
    hi: 'झुकाव',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200',
    activeBg: 'bg-emerald-500',
    activeText: 'text-white',
    ring: 'ring-emerald-400',
    barColor: 'bg-emerald-500',
    score: 4,
  },
  neutral: {
    en: 'Neutral',
    hi: 'तटस्थ',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    activeBg: 'bg-slate-600',
    activeText: 'text-white',
    ring: 'ring-slate-400',
    barColor: 'bg-slate-400',
    score: 3,
  },
  disagree: {
    en: 'Dissent',
    hi: 'विरोध',
    color: 'text-rose-700',
    bg: 'bg-rose-50/60',
    border: 'border-rose-200',
    activeBg: 'bg-rose-500',
    activeText: 'text-white',
    ring: 'ring-rose-400',
    barColor: 'bg-rose-400',
    score: 2,
  },
  strongly_disagree: {
    en: 'Oppose',
    hi: 'कड़ा विरोध',
    color: 'text-rose-900',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    activeBg: 'bg-rose-800',
    activeText: 'text-white',
    ring: 'ring-rose-700',
    barColor: 'bg-rose-800',
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
    tagline: 'Democratic Discourse & Policy Referendums',
    agoraBadge: 'Citizen Agora',
    regionLabel: 'Region:',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    profile: 'My Profile',
    pts: 'pts',
    latest: 'Latest',
    mostActive: 'Most Active',
    searchPlaceholder: 'Search civic debates, policies, propositions...',
    clear: 'Clear',
    debatesCount: 'debates',
    openCitizenAgora: 'Live Discussions',
    noDebatesFound: 'No deliberations match this query',
    noDebatesSubtext: 'Try adjusting your search keywords, region, or topic filter.',
    totalVoted: 'Total Citizens Voted:',
    joinDebateFloor: 'Join Debate Floor',
    share: 'Share',
    copied: 'Link copied to clipboard!',
    bookmarked: 'Saved to your debate bookmarks!',
    bookmarkRemoved: 'Removed from bookmarks',
    evidenceAttached: 'Evidence / Media Attached',
    newsArticle: 'Relevant News / Source',
    viewSource: 'Open Link',
    aiSummary: 'AI Summary',
    aiGenerating: 'Synthesizing...',
    aiSummaryHeading: 'JanManch AI Executive Synthesis',
    hideSummary: 'Hide Summary',
    refineWithAi: 'Refine with AI',
    aiRefining: 'Polishing...',
    micListening: 'Listening...',
    micSpeakNow: 'Speak now (Hindi or English)',
    micStop: 'Stop recording',
    micNotSupported: 'Speech recognition is not supported in this browser.',
    publishProposition: 'Publish to Agora (+30 Karma)',
    newProp: 'New Prop',
    topicCategory: '1. Topic Category',
    propositionQuestion: '2. Proposition & Region',
    targetRegion: 'Target Region / Constituency',
    contextPerspective: '3. Perspective & Preview',
    mediaUrlLabel: 'Attach Evidence / Media URL (Google Drive, PDF, Image)',
    mediaUrlPlaceholder: 'https://drive.google.com/... or image link',
    newsUrlLabel: 'Add Relevant Article / News Link',
    newsUrlPlaceholder: 'https://thehindu.com/... or news report',
    allSides: 'All Sides',
    inFavor: 'In Favor',
    against: 'Against',
    postArgument: 'Post Argument',
    posting: 'Posting...',
    argueInFavor: 'In Favor (Pro)',
    argueAgainst: 'Against (Con)',
    arguePlaceholderPro: 'State your argument in favor...',
    arguePlaceholderCon: 'State your counterpoint against...',
    karmaReward: '+20 Karma',
    close: 'Close',
    back: 'Back',
    continueToProp: 'Continue to Proposition',
    perspectivePreview: 'Perspective & Live Preview',
    livePreview: 'Live Agora Card Preview',
    pulseTrends: 'Pulse Trends',
  },
  hi: {
    appName: 'जनमंच',
    tagline: 'लोकतांत्रिक विमर्श एवं जनमत संग्रह',
    agoraBadge: 'नागरिक अखाड़ा',
    regionLabel: 'क्षेत्र:',
    signIn: 'प्रवेश करें',
    signOut: 'लॉग आउट',
    profile: 'मेरी प्रोफ़ाइल',
    pts: 'अंक',
    latest: 'नवीनतम',
    mostActive: 'सक्रिय',
    searchPlaceholder: 'नागरिक बहस, नीतियां और प्रस्ताव खोजें...',
    clear: 'हटाएं',
    debatesCount: 'मुद्दे',
    openCitizenAgora: 'लाइव विमर्श',
    noDebatesFound: 'इस खोज के लिए कोई बहस उपलब्ध नहीं है',
    noDebatesSubtext: 'कृपया अपना खोज शब्द, क्षेत्र या विषय बदलकर देखें।',
    totalVoted: 'कुल नागरिक मत:',
    joinDebateFloor: 'बहस में शामिल हों',
    share: 'साझा करें',
    copied: 'लिंक कॉपी हो गया!',
    bookmarked: 'बुकमार्क में सहेजा गया!',
    bookmarkRemoved: 'बुकमार्क से हटाया गया',
    evidenceAttached: 'संलग्न साक्ष्य / दस्तावेज़',
    newsArticle: 'प्रासंगिक समाचार / संदर्भ',
    viewSource: 'स्रोत देखें',
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
    publishProposition: 'जनमंच पर प्रकाशित करें (+30 कर्म)',
    newProp: 'नया प्रस्ताव',
    topicCategory: '1. नीति का विषय चुनें',
    propositionQuestion: '2. प्रस्ताव व लक्षित क्षेत्र',
    targetRegion: 'लक्षित क्षेत्र / निर्वाचन क्षेत्र',
    contextPerspective: '3. संदर्भ व पूर्वावलोकन',
    mediaUrlLabel: 'साक्ष्य / दस्तावेज़ URL संलग्न करें (Google Drive, PDF, छवि)',
    mediaUrlPlaceholder: 'https://drive.google.com/... या छवि लिंक',
    newsUrlLabel: 'प्रासंगिक समाचार या लेख का लिंक जोड़ें',
    newsUrlPlaceholder: 'https://dainikbhaskar.com/... या समाचार लिंक',
    allSides: 'सभी पक्ष',
    inFavor: 'पक्ष में',
    against: 'विपक्ष में',
    postArgument: 'तर्क प्रस्तुत करें',
    posting: 'प्रकाशित हो रहा है...',
    argueInFavor: 'पक्ष में तर्क (Pro)',
    argueAgainst: 'विरोध में तर्क (Con)',
    arguePlaceholderPro: 'पक्ष में अपना ठोस तर्क लिखें...',
    arguePlaceholderCon: 'विरोध में अपना विचार लिखें...',
    karmaReward: '+20 कर्म',
    close: 'बंद करें',
    back: 'पीछे',
    continueToProp: 'प्रस्ताव विवरण पर आगे बढ़ें',
    perspectivePreview: 'संदर्भ व सजीव पूर्वावलोकन',
    livePreview: 'सजीव कार्ड पूर्वावलोकन',
    pulseTrends: 'जनमत रुझान',
  },
};
