'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Region, Topic, VotingMode } from '@/lib/types';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Send,
  TrendingUp,
  GraduationCap,
  Building2,
  Cpu,
  MapPin,
  Lock,
  Mic,
  FileText,
  ExternalLink,
  ChevronDown,
  UploadCloud,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Scale,
  Sliders,
  Globe2,
} from 'lucide-react';
import { DICTIONARY, TOPIC_NAMES, REGION_NAMES } from '@/lib/translations';
import { useSpeechDictation } from '@/lib/speech';
import { uploadMediaFile } from '@/lib/storage';
import {
  VOTING_MODES,
  WORLD_COUNTRIES,
  CountryInfo,
} from '@/constants/regions';
import { CascadingRegionModal } from './CascadingRegionModal';

const TOPICS: {
  id: Topic;
  labelEn: string;
  labelHi: string;
  descEn: string;
  descHi: string;
  icon: any;
  color: string;
}[] = [
  {
    id: 'Economy',
    labelEn: 'Economy & Markets',
    labelHi: 'अर्थव्यवस्था एवं बाज़ार',
    descEn: 'Taxation, digital currency, fiscal policies, and subsidies.',
    descHi: 'कराधान, डिजिटल मुद्रा, वित्तीय नीतियां और प्रत्यक्ष सब्सिडी।',
    icon: TrendingUp,
    color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  },
  {
    id: 'Education',
    labelEn: 'Education & Future',
    labelHi: 'शिक्षा एवं भविष्य',
    descEn: 'Curricula reform, board exams, skills training, and schools.',
    descHi: 'पाठ्यक्रम सुधार, बोर्ड परीक्षाएं, कौशल प्रशिक्षण और स्कूल।',
    icon: GraduationCap,
    color: 'bg-blue-50 text-blue-900 border-blue-200',
  },
  {
    id: 'Civic Life',
    labelEn: 'Civic Life & Urban Living',
    labelHi: 'नागरिक जीवन एवं शहरी विकास',
    descEn: 'Transit, clean air, road infrastructure, and public spaces.',
    descHi: 'परिवहन, स्वच्छ हवा, सड़क संरचना और नागरिक सुविधाएं।',
    icon: Building2,
    color: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  {
    id: 'Technology',
    labelEn: 'Technology & AI Policy',
    labelHi: 'प्रौद्योगिकी एवं AI नीतियां',
    descEn: 'AI regulation, data privacy, open mobility, and digital rights.',
    descHi: 'एआई विनियमन, डेटा गोपनीयता, खुली गतिशीलता और डिजिटल अधिकार।',
    icon: Cpu,
    color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  },
];

export const CreateDiscussionTab: React.FC = () => {
  const { createDiscussion, activeCountry, activeRegion, user, openAuthModal, language } = useApp();
  const t = DICTIONARY[language];
  const isHindi = language === 'hi';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [topic, setTopic] = useState<Topic>('Economy');
  const [votingMode, setVotingMode] = useState<VotingMode>('verdict');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState<string>(activeCountry || 'India');
  const [region, setRegion] = useState<Region>(activeRegion || 'All India');
  const [constituency, setConstituency] = useState<string>('All Constituencies');
  const [mediaUrl, setMediaUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [modalStartView, setModalStartView] = useState<'country' | 'state' | 'constituency'>('country');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // File upload state for images, videos, documents
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileMediaType, setFileMediaType] = useState<'image' | 'video' | 'document' | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Active dictation target: 'title' | 'description' | null
  const [micTarget, setMicTarget] = useState<'title' | 'description' | null>(null);

  const { isListening, stopListening, toggleListening } = useSpeechDictation({
    lang: isHindi ? 'hi-IN' : 'en-IN',
    onTranscript: (text) => {
      if (micTarget === 'title') {
        setTitle((prev) => (prev ? `${prev} ${text}` : text));
      } else if (micTarget === 'description') {
        setDescription((prev) => (prev ? `${prev} ${text}` : text));
      }
    },
  });

  const handleStartTitleMic = () => {
    if (isListening && micTarget === 'title') {
      stopListening();
      setMicTarget(null);
    } else {
      setMicTarget('title');
      toggleListening();
    }
  };

  const handleStartDescMic = () => {
    if (isListening && micTarget === 'description') {
      stopListening();
      setMicTarget(null);
    } else {
      setMicTarget('description');
      toggleListening();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: 'image' | 'video' | 'document' | null = null;
    if (file.type.startsWith('image/')) {
      type = 'image';
    } else if (file.type.startsWith('video/')) {
      type = 'video';
    } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      type = 'document';
    } else {
      setValidationError(
        isHindi
          ? 'कृपया मान्य छवि (PNG, JPG, WebP), वीडियो (MP4, WebM) या PDF दस्तावेज़ चुनें।'
          : 'Please select a valid image (PNG, JPG, WebP), video (MP4, WebM), or PDF document.'
      );
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
    setFileMediaType(type);
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setFileMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNextFromStep1 = () => {
    setValidationError(null);
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setValidationError(null);
    if (!title.trim()) {
      setValidationError(
        isHindi
          ? 'कृपया एक स्पष्ट नीति प्रश्न या प्रस्ताव लिखें।'
          : 'Please enter a clear proposition question or discussion statement.'
      );
      return;
    }
    stopListening();
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    stopListening();

    if (!user) {
      openAuthModal(
        isHindi ? 'प्रस्ताव प्रकाशित करने के लिए प्रवेश करें।' : 'Sign in to publish a civic proposition.'
      );
      return;
    }

    if (!title.trim()) {
      setValidationError(isHindi ? 'कृपया एक प्रस्ताव प्रश्न लिखें।' : 'Please enter a proposition question.');
      return;
    }
    if (!description.trim()) {
      setValidationError(
        isHindi ? 'कृपया पृष्ठभूमि और संदर्भ लिखें।' : 'Please add contextual background or perspective.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let finalMediaUrl = mediaUrl.trim() || undefined;
      let finalMediaType: 'image' | 'video' | 'document' | undefined = undefined;
      let finalMediaFilename: string | undefined = undefined;

      if (selectedFile) {
        setIsUploadingMedia(true);
        const uploadResult = await uploadMediaFile(selectedFile);
        finalMediaUrl = uploadResult.url;
        finalMediaType = uploadResult.type;
        finalMediaFilename = uploadResult.filename;
      } else if (finalMediaUrl) {
        const lower = finalMediaUrl.toLowerCase();
        if (lower.match(/\.(mp4|webm|mov)($|\?)/)) {
          finalMediaType = 'video';
        } else if (lower.match(/\.(pdf|doc|docx)($|\?)/)) {
          finalMediaType = 'document';
          finalMediaFilename = finalMediaUrl.split('/').pop()?.split('?')[0] || 'Document.pdf';
        } else {
          finalMediaType = 'image';
        }
      }

      await createDiscussion({
        title: title.trim(),
        description: description.trim(),
        topic,
        country,
        region: country === 'India' ? region : 'Countrywide',
        constituency: country === 'India' ? constituency || 'All Constituencies' : 'Countrywide',
        voting_mode: votingMode,
        media_url: finalMediaUrl,
        media_type: finalMediaType,
        media_filename: finalMediaFilename,
        source_url: sourceUrl.trim() || undefined,
      });

      handleRemoveFile();
      setTitle('');
      setDescription('');
      setMediaUrl('');
      setSourceUrl('');
      setStep(1);
    } catch {
      setValidationError(
        isHindi ? 'प्रकाशन में त्रुटि आई। कृपया पुनः प्रयास करें।' : 'Failed to publish. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingMedia(false);
    }
  };

  const isIndia = country === 'India';
  const currentCountryConfig = WORLD_COUNTRIES.find((c) => c.id === country) || WORLD_COUNTRIES[1];

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Guest Notice if not logged in */}
      {!user && (
        <div
          onClick={() => openAuthModal()}
          className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between cursor-pointer shadow-2xs hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <p className="font-semibold">
              {isHindi
                ? 'आप अतिथि के रूप में देख रहे हैं। प्रस्ताव रखने के लिए प्रवेश करें।'
                : 'You are browsing as Guest. Sign in to publish discussions and earn Karma.'}
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-800 underline shrink-0">{t.signIn}</span>
        </div>
      )}

      {/* Wizard Header & Progress */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {step}/3
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {t.newProp}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {step === 1
                  ? isHindi ? 'डोमेन एवं वोटिंग मोड' : 'Domain & Voting Mode'
                  : step === 2
                    ? t.propositionQuestion
                    : t.contextPerspective}
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-fade-in">
          {validationError}
        </div>
      )}

      {/* STEP 1: SELECT TOPIC CATEGORY & CONSENSUS VOTING MODE */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Section A: Topic Category */}
          <div className="space-y-2">
            <div className="space-y-0.5">
              <h3 className="text-sm font-extrabold text-slate-900">
                {t.topicCategory}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? 'वह नीतिगत क्षेत्र चुनें जहां यह बहस संबंधित है।'
                  : 'Select the domain where this policy debate belongs for targeted civic engagement.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {TOPICS.map((tItem) => {
                const Icon = tItem.icon;
                const isSelected = topic === tItem.id;
                const titleText = isHindi ? tItem.labelHi : tItem.labelEn;
                const descText = isHindi ? tItem.descHi : tItem.descEn;

                return (
                  <div
                    key={tItem.id}
                    onClick={() => setTopic(tItem.id)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200/90 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${tItem.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{titleText}</h4>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {descText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Voting Mode Selection */}
          <div className="space-y-2 pt-1 border-t border-slate-200/80">
            <div className="space-y-0.5">
              <h3 className="text-sm font-extrabold text-slate-900">
                {isHindi ? 'जनमत वोटिंग मोड चुनें' : 'Choose Consensus Voting Mode'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? 'नागरिक इस प्रस्ताव पर किस प्रकार मतदान करेंगे।'
                  : 'Decide how citizens participate: clear 2-way verdict or 5-tier spectrum meter.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {VOTING_MODES.map((mode) => {
                const isSelected = votingMode === mode.id;
                const titleText = isHindi ? mode.titleHi : mode.titleEn;
                const descText = isHindi ? mode.descHi : mode.descEn;
                const Icon = mode.id === 'verdict' ? Scale : Sliders;

                return (
                  <div
                    key={mode.id}
                    onClick={() => setVotingMode(mode.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200/90 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{titleText}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {mode.badge}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {descText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleNextFromStep1}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <span>{t.continueToProp}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: WRITE PROPOSITION QUESTION & GEOGRAPHIC REGION */}
      {step === 2 && (
        <div className="space-y-3.5">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900">
              {t.propositionQuestion}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi
                ? 'अपना प्रश्न स्पष्ट रूप से लिखें ताकि नागरिक अपना स्पष्ट रुख दर्ज कर सकें।'
                : 'Frame your question clearly so citizens can record their stance with conviction.'}
            </p>
          </div>

          {/* Cascading Country, State & Constituency Geographic Selector */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                {t.targetRegion}
              </label>
              <button
                type="button"
                onClick={() => {
                  setModalStartView('country');
                  setIsRegionModalOpen(true);
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
              >
                {isHindi ? 'देश या क्षेत्र बदलें' : 'Change Jurisdiction'}
              </button>
            </div>

            {/* Level 1: Country Picker Button */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500">
                {isHindi ? '1. देश (Country)' : '1. Country'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setModalStartView('country');
                  setIsRegionModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-between text-left text-xs font-bold text-slate-900"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base leading-none">{currentCountryConfig?.flag || '🌐'}</span>
                  <span className="truncate">
                    {isHindi ? currentCountryConfig?.nameHi : currentCountryConfig?.nameEn}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </div>

            {/* Level 2 & 3: Revealed when Country is India */}
            {isIndia ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* State / UT Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {isHindi ? '2. राज्य / UT' : '2. State / UT'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setModalStartView('state');
                      setIsRegionModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-between text-left text-xs font-bold text-slate-900"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{REGION_NAMES[region]?.[language] || region}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                </div>

                {/* Lok Sabha Constituency Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {isHindi ? '3. लोकसभा सीट' : '3. Lok Sabha Seat'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setModalStartView('constituency');
                      setIsRegionModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-between text-left text-xs font-bold text-slate-900"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {constituency === 'All Constituencies'
                          ? isHindi
                            ? 'सभी सीटें (राज्यव्यापी)'
                            : 'All Seats (Statewide)'
                          : constituency}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {isHindi
                    ? `${currentCountryConfig?.nameHi} में देशव्यापी नागरिक संवाद लागू होगा।`
                    : `Countrywide civic deliberations across ${currentCountryConfig?.nameEn}.`}
                </span>
              </div>
            )}
          </div>

          {/* Title Input with Voice-to-Text Microphone Button */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                {isHindi ? 'प्रस्ताव प्रश्न / शीर्षक' : 'Proposition Title / Question'}
              </label>

              {/* Microphone Button */}
              <button
                type="button"
                onClick={handleStartTitleMic}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  isListening && micTarget === 'title'
                    ? 'bg-rose-600 text-white pulse-listening shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={isHindi ? 'बोलकर लिखें' : 'Voice Dictation'}
              >
                <Mic className={`w-3.5 h-3.5 ${isListening && micTarget === 'title' ? 'animate-pulse' : ''}`} />
                <span>
                  {isListening && micTarget === 'title' ? t.micListening : isHindi ? 'बोलें (Mic)' : 'Dictate (Mic)'}
                </span>
              </button>
            </div>

            <input
              type="text"
              placeholder={
                isHindi
                  ? 'उदा. क्या भारी यातायात वाले शहरी गलियारों में पीक-ऑवर भीड़भाड़ शुल्क लगाया जाना चाहिए?'
                  : 'e.g. Should variable congestion pricing be introduced on urban arterial tech corridors?'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-900"
            />

            {/* Listening Indicator */}
            {isListening && micTarget === 'title' && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  <span className="font-bold">
                    {isHindi ? 'सुन रहे हैं... (रोकने के लिए दोबारा टैप करें)' : 'Listening... Tap again to stop'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleStartTitleMic}
                  className="text-xs bg-rose-600 text-white px-2.5 py-1 rounded-md font-bold hover:bg-rose-700 transition-colors"
                >
                  {isHindi ? 'रोकें' : 'Stop'}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>
            <button
              onClick={handleNextFromStep2}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t.perspectivePreview}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONTEXT, EVIDENCE ATTACHMENTS & LIVE PREVIEW */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900">
              {t.contextPerspective}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi
                ? 'तथ्यात्मक पृष्ठभूमि, साक्ष्य और संदर्भ जोड़ें ताकि नागरिक दोनों पक्षों पर विचार कर सकें।'
                : 'Provide factual background, evidence, and nuances to help neighbors deliberate.'}
            </p>
          </div>

          {/* Description Textarea with Mic Button */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                {isHindi ? 'विस्तृत पृष्ठभूमि व संदर्भ' : 'Background Context / Perspective'}
              </label>

              <button
                type="button"
                onClick={handleStartDescMic}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  isListening && micTarget === 'description'
                    ? 'bg-rose-600 text-white pulse-listening shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={isHindi ? 'बोलकर लिखें' : 'Voice Dictation'}
              >
                <Mic className={`w-3.5 h-3.5 ${isListening && micTarget === 'description' ? 'animate-pulse' : ''}`} />
                <span>
                  {isListening && micTarget === 'description' ? t.micListening : isHindi ? 'बोलें (Mic)' : 'Dictate (Mic)'}
                </span>
              </button>
            </div>

            <textarea
              rows={4}
              placeholder={
                isHindi
                  ? 'समस्या की पृष्ठभूमि, वित्तीय प्रभाव, या वर्तमान कमियों को विस्तार से समझाएं...'
                  : 'Explain the background problem, trade-offs, financial implications, or why current solutions fall short...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed text-slate-800"
            />

            {isListening && micTarget === 'description' && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  <span className="font-bold">
                    {isHindi ? 'सुन रहे हैं... (रोकने के लिए दोबारा टैप करें)' : 'Listening... Tap again to stop'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleStartDescMic}
                  className="text-xs bg-rose-600 text-white px-2.5 py-1 rounded-md font-bold hover:bg-rose-700 transition-colors"
                >
                  {isHindi ? 'रोकें' : 'Stop'}
                </button>
              </div>
            )}
          </div>

          {/* MULTI-MEDIA ATTACHMENTS (Photos, Videos, Documents) */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {isHindi ? 'प्रमाण संलग्न करें (फ़ोटो, वीडियो, PDF)' : 'Attach Supporting Evidence'}
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">
                {isHindi ? 'वैकल्पिक' : 'Optional'}
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,application/pdf"
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/40 rounded-2xl p-4 text-center cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {isHindi ? 'फ़ाइल चुनने के लिए टैप करें' : 'Tap to upload evidence file'}
                </div>
                <p className="text-[10px] text-slate-500">
                  {isHindi
                    ? 'छवि (PNG, JPG), वीडियो (MP4), या रिपोर्ट दस्तावेज़ (PDF)'
                    : 'Photos (PNG, JPG, WebP), Videos (MP4, WebM) or Documents (PDF)'}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    {fileMediaType === 'image' && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                    {fileMediaType === 'video' && <VideoIcon className="w-4 h-4 text-purple-600" />}
                    {fileMediaType === 'document' && <FileText className="w-4 h-4 text-rose-600" />}
                    <span className="truncate max-w-[190px]">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                    title={isHindi ? 'हटाएं' : 'Remove attachment'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {fileMediaType === 'image' && filePreviewUrl && (
                  <div className="rounded-xl overflow-hidden max-h-48 border border-slate-200 bg-black/5">
                    <img
                      src={filePreviewUrl}
                      alt="Evidence Preview"
                      className="w-full h-auto max-h-48 object-cover"
                    />
                  </div>
                )}

                {fileMediaType === 'video' && filePreviewUrl && (
                  <div className="rounded-xl overflow-hidden max-h-48 border border-slate-200 bg-black">
                    <video
                      src={filePreviewUrl}
                      controls
                      playsInline
                      className="w-full max-h-48"
                    />
                  </div>
                )}

                {fileMediaType === 'document' && (
                  <div className="p-3 rounded-xl bg-white border border-rose-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs">
                        PDF
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {isHindi ? 'सत्यापित PDF साक्ष्य' : 'Verified PDF Evidence Document'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optional Reference Link */}
            <div className="pt-1 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {t.newsUrlLabel}
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://thehindu.com/news/national/article"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Live Card Preview Showing Selected Voting Mode */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              {t.livePreview} ({votingMode === 'verdict' ? 'The Verdict' : 'The Spectrum'})
            </span>
            <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {TOPIC_NAMES[topic]?.[language] || topic}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {isIndia ? (REGION_NAMES[region]?.[language] || region) : country} &bull; {isHindi ? 'अभी' : 'Just Now'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                  {user ? user.name.charAt(0) : 'Y'}
                </div>
                <span>{user ? user.name : (isHindi ? 'आप (नागरिक)' : 'You (Citizen)')}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  @{user ? user.username : 'citizen'}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {title || (isHindi ? 'आपका नीतिगत प्रश्न यहां दिखाई देगा...' : 'Your proposition question will appear here...')}
              </h4>

              <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                {description || (isHindi ? 'आपका पृष्ठभूमि विवरण और साक्ष्य यहां प्रदर्शित होगा...' : 'Your context, policy explanation, and evidence will appear here...')}
              </p>

              {/* Mode-Specific Interactive Preview */}
              {votingMode === 'verdict' ? (
                <div className="space-y-2 pt-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: '65%' }} className="h-full bg-emerald-600" />
                    <div style={{ width: '35%' }} className="h-full bg-rose-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                      {isHindi ? 'समर्थन (Endorse)' : 'Endorse'} • 65%
                    </div>
                    <div className="py-1.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center">
                      {isHindi ? 'विरोध (Oppose)' : 'Oppose'} • 35%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: '30%' }} className="h-full bg-emerald-700" />
                    <div style={{ width: '25%' }} className="h-full bg-emerald-500" />
                    <div style={{ width: '15%' }} className="h-full bg-slate-400" />
                    <div style={{ width: '15%' }} className="h-full bg-rose-400" />
                    <div style={{ width: '15%' }} className="h-full bg-rose-800" />
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-[9px] font-bold text-center text-slate-600">
                    <div className="p-1 rounded bg-emerald-50 text-emerald-800">{isHindi ? 'दृढ़ समर्थन' : 'Back'}</div>
                    <div className="p-1 rounded bg-emerald-50 text-emerald-700">{isHindi ? 'समर्थक' : 'Lean'}</div>
                    <div className="p-1 rounded bg-slate-100 text-slate-700">{isHindi ? 'अनिर्णित' : 'Neutral'}</div>
                    <div className="p-1 rounded bg-rose-50 text-rose-700">{isHindi ? 'असहमत' : 'Dissent'}</div>
                    <div className="p-1 rounded bg-rose-50 text-rose-800">{isHindi ? 'दृढ़ विरोधी' : 'Oppose'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingMedia}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <span>
                {isUploadingMedia
                  ? isHindi ? 'साक्ष्य अपलोड हो रहा है...' : 'Uploading Evidence...'
                  : isSubmitting
                    ? t.posting
                    : t.publishProposition}
              </span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Slide-Up Bottom Sheet for Geographic Selector */}
      <CascadingRegionModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        initialCountry={country}
        initialState={region}
        initialConstituency={constituency}
        initialView={modalStartView}
        onSelect={(st, ct, cty) => {
          if (cty) setCountry(cty);
          setRegion(st);
          setConstituency(ct || 'All Constituencies');
        }}
      />
    </div>
  );
};
