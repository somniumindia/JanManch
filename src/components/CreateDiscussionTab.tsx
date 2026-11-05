'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Region, Topic, VotingMode } from '@/lib/types';
import {
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
} from '@/constants/regions';
import { CascadingRegionModal } from './CascadingRegionModal';

const TOPICS: {
  id: Topic;
  labelEn: string;
  labelHi: string;
  descEn: string;
  descHi: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'Economy',
    labelEn: 'Economy & Markets',
    labelHi: 'अर्थव्यवस्था एवं बाज़ार',
    descEn: 'Taxation, digital currency, fiscal policies, and subsidies.',
    descHi: 'कराधान, डिजिटल मुद्रा, वित्तीय नीतियां और प्रत्यक्ष सब्सिडी।',
    icon: TrendingUp,
  },
  {
    id: 'Education',
    labelEn: 'Education & Future',
    labelHi: 'शिक्षा एवं भविष्य',
    descEn: 'Curricula reform, board exams, skills training, and schools.',
    descHi: 'पाठ्यक्रम सुधार, बोर्ड परीक्षाएं, कौशल प्रशिक्षण और स्कूल।',
    icon: GraduationCap,
  },
  {
    id: 'Civic Life',
    labelEn: 'Civic Life & Urban Living',
    labelHi: 'नागरिक जीवन एवं शहरी विकास',
    descEn: 'Transit, clean air, road infrastructure, and public spaces.',
    descHi: 'परिवहन, स्वच्छ हवा, सड़क संरचना और नागरिक सुविधाएं।',
    icon: Building2,
  },
  {
    id: 'Technology',
    labelEn: 'Technology & AI Policy',
    labelHi: 'प्रौद्योगिकी एवं AI नीतियां',
    descEn: 'AI regulation, data privacy, open mobility, and digital rights.',
    descHi: 'एआई विनियमन, डेटा गोपनीयता, खुली गतिशीलता और डिजिटल अधिकार।',
    icon: Cpu,
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
          ? 'अमान्य फ़ाइल प्रकार। केवल चित्र, वीडियो या PDF दस्तावेज़ अपलोड करें।'
          : 'Invalid file type. Please upload images, videos, or PDF documents.'
      );
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setValidationError(
        isHindi
          ? 'फ़ाइल का आकार 25MB से कम होना चाहिए।'
          : 'File size must be under 25MB.'
      );
      return;
    }

    setSelectedFile(file);
    setFileMediaType(type);
    setValidationError(null);

    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl) {
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
    if (!title.trim()) {
      setValidationError(
        isHindi
          ? 'कृपया अपने प्रस्ताव का शीर्षक या नीतिगत प्रश्न लिखें।'
          : 'Please enter a proposition title or question.'
      );
      return;
    }
    if (title.trim().length < 10) {
      setValidationError(
        isHindi
          ? 'शीर्षक कम से कम 10 अक्षरों का होना चाहिए।'
          : 'Proposition title must be at least 10 characters.'
      );
      return;
    }
    setValidationError(null);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal(
        isHindi
          ? 'बहस प्रकाशित करने और नागरिक कर्म अर्जित करने के लिए प्रवेश करें।'
          : 'Sign in to publish your debate and earn civic karma.'
      );
      return;
    }

    if (!title.trim()) {
      setValidationError(
        isHindi ? 'कृपया शीर्षक दर्ज करें।' : 'Please enter a proposition title.'
      );
      setStep(2);
      return;
    }

    if (!description.trim()) {
      setValidationError(
        isHindi
          ? 'कृपया नागरिकों के विचारार्थ कुछ पृष्ठभूमि या संदर्भ अवश्य लिखें।'
          : 'Please provide some background context for fellow citizens.'
      );
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

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
          className="p-3.5 rounded-xl bg-paper border border-rule text-xs text-ink flex items-center justify-between cursor-pointer hover:bg-rule/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent shrink-0" />
            <p className="font-normal text-ink-muted">
              {isHindi
                ? 'आप अतिथि के रूप में देख रहे हैं। बहस शुरू करने के लिए प्रवेश करें।'
                : 'You are browsing as guest. Sign in to publish debates and earn karma.'}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-accent underline shrink-0">{t.signIn}</span>
        </div>
      )}

      {/* Stepper Header & Thin Progress Bar */}
      <div className="p-4 rounded-xl bg-surface border border-rule space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink font-serif">
              {isHindi ? 'नई बहस' : 'New debate'}
            </h2>
            <p className="text-[11px] text-ink-muted">
              {step === 1
                ? isHindi ? 'विषय एवं मतदान का प्रकार' : 'Topic & voting mode'
                : step === 2
                  ? isHindi ? 'नीतिगत प्रश्न एवं क्षेत्र' : 'Question & region'
                  : isHindi ? 'पृष्ठभूमि एवं पूर्वावलोकन' : 'Background & preview'}
            </p>
          </div>
          <span className="text-xs font-semibold text-accent">
            {step} / 3
          </span>
        </div>

        {/* Step Indicator - Thin 1px/2px Progress Bar */}
        <div className="h-1 w-full bg-rule rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3 rounded-xl bg-oppose-soft border border-oppose-strong/30 text-xs text-oppose-strong font-medium animate-fade-in">
          {validationError}
        </div>
      )}

      {/* STEP 1: SELECT TOPIC CATEGORY & CONSENSUS VOTING MODE */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Section A: Topic Category */}
          <div className="space-y-2">
            <div className="space-y-0.5">
              <h3 className="text-xs font-semibold text-ink">
                {isHindi ? 'विषय चुनें' : 'Select topic'}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {isHindi
                  ? 'वह नीतिगत क्षेत्र चुनें जहां यह बहस संबंधित है।'
                  : 'Select the domain where this policy debate belongs.'}
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
                    className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 min-h-[44px] ${
                      isSelected
                        ? 'border-accent bg-accent-soft/40'
                        : 'border-rule bg-surface hover:bg-paper'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-paper text-ink border border-rule">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-ink">{titleText}</h4>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-accent text-surface flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                        {descText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Voting Mode Selection */}
          <div className="space-y-2 pt-2 border-t border-rule">
            <div className="space-y-0.5">
              <h3 className="text-xs font-semibold text-ink">
                {isHindi ? 'मतदान का प्रकार' : 'Voting mode'}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {isHindi
                  ? 'नागरिक इस बहस पर किस प्रकार मतदान करेंगे।'
                  : 'Decide how citizens participate: clear 2-way verdict or 5-tier spectrum meter.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {VOTING_MODES.map((mode) => {
                const isSelected = votingMode === mode.id;
                const titleText = isHindi ? mode.titleHi : mode.titleEn;
                const descText = isHindi ? mode.descHi : mode.descEn;
                const Icon = mode.id === 'verdict' ? Scale : Sliders;

                return (
                  <div
                    key={mode.id}
                    onClick={() => setVotingMode(mode.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 min-h-[44px] ${
                      isSelected
                        ? 'border-accent bg-accent-soft/40'
                        : 'border-rule bg-surface hover:bg-paper'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-accent text-surface border-accent'
                          : 'bg-paper text-ink-muted border-rule'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-ink">{titleText}</h4>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-paper text-ink border border-rule">
                            {mode.badge}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-accent text-surface flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
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
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-accent text-surface font-semibold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <span>{isHindi ? 'आगे बढ़ें' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: WRITE PROPOSITION QUESTION & GEOGRAPHIC REGION */}
      {step === 2 && (
        <div className="space-y-3.5">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-ink">
              {isHindi ? 'नीतिगत प्रश्न एवं क्षेत्र' : 'Proposition question & region'}
            </h3>
            <p className="text-[11px] text-ink-muted">
              {isHindi
                ? 'अपना प्रश्न स्पष्ट रूप से लिखें ताकि नागरिक अपना स्पष्ट रुख दर्ज कर सकें।'
                : 'Frame your question clearly so citizens can record their stance with conviction.'}
            </p>
          </div>

          {/* Geographic Selector */}
          <div className="p-3.5 rounded-xl bg-surface border border-rule space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-ink">
                {isHindi ? 'लक्षित क्षेत्र' : 'Target region'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setModalStartView('country');
                  setIsRegionModalOpen(true);
                }}
                className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
              >
                {isHindi ? 'बदलें' : 'Change'}
              </button>
            </div>

            {/* Country Picker Button */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setModalStartView('country');
                  setIsRegionModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-paper border border-rule hover:bg-rule/40 transition-colors flex items-center justify-between text-left text-xs font-medium text-ink min-h-[44px] cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base leading-none">{currentCountryConfig?.flag || '🌐'}</span>
                  <span className="truncate">
                    {isHindi ? currentCountryConfig?.nameHi : currentCountryConfig?.nameEn}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-ink-muted shrink-0" />
              </button>
            </div>

            {/* Level 2 & 3: Revealed when Country is India */}
            {isIndia ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* State / UT Selector */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setModalStartView('state');
                      setIsRegionModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-paper border border-rule hover:bg-rule/40 transition-colors flex items-center justify-between text-left text-xs font-medium text-ink min-h-[44px] cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="truncate">{REGION_NAMES[region]?.[language] || region}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  </button>
                </div>

                {/* Lok Sabha Constituency Selector */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setModalStartView('constituency');
                      setIsRegionModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-paper border border-rule hover:bg-rule/40 transition-colors flex items-center justify-between text-left text-xs font-medium text-ink min-h-[44px] cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="truncate">
                        {constituency === 'All Constituencies'
                          ? isHindi
                            ? 'सभी सीटें (राज्यव्यापी)'
                            : 'All seats (Statewide)'
                          : constituency}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-paper border border-rule text-xs text-ink-muted flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-accent shrink-0" />
                <span>
                  {isHindi
                    ? `${currentCountryConfig?.nameHi} में देशव्यापी नागरिक संवाद लागू होगा।`
                    : `Countrywide civic deliberations across ${currentCountryConfig?.nameEn}.`}
                </span>
              </div>
            )}
          </div>

          {/* Title Input with Voice-to-Text Microphone Button */}
          <div className="p-3.5 rounded-xl bg-surface border border-rule space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-ink">
                {isHindi ? 'प्रस्ताव प्रश्न / शीर्षक' : 'Proposition title / question'}
              </label>

              {/* Microphone Button */}
              <button
                type="button"
                onClick={handleStartTitleMic}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer min-h-[32px] ${
                  isListening && micTarget === 'title'
                    ? 'bg-oppose-strong text-surface'
                    : 'bg-paper text-ink hover:bg-rule/40 border border-rule'
                }`}
                title={isHindi ? 'बोलकर लिखें' : 'Voice dictation'}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>
                  {isListening && micTarget === 'title' ? t.micListening : isHindi ? 'बोलें' : 'Dictate'}
                </span>
              </button>
            </div>

            <input
              type="text"
              placeholder={
                isHindi
                  ? 'उदा. क्या भारी यातायात वाले शहरी गलियारों में पीक-ऑवर भीड़भाड़ शुल्क लगाया जाना चाहिए?'
                  : 'e.g. Should variable congestion pricing be introduced on urban arterial corridors?'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent text-ink font-normal min-h-[44px]"
            />

            {/* Listening Indicator */}
            {isListening && micTarget === 'title' && (
              <div className="p-2.5 rounded-xl bg-oppose-soft border border-oppose-strong/30 flex items-center justify-between text-xs text-oppose-strong">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-oppose-strong animate-ping" />
                  <span className="font-medium">
                    {isHindi ? 'सुन रहे हैं... (रोकने के लिए दोबारा टैप करें)' : 'Listening... Tap again to stop'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleStartTitleMic}
                  className="text-xs bg-oppose-strong text-surface px-2.5 py-1 rounded-md font-medium cursor-pointer"
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
              className="py-2.5 px-4 rounded-xl border border-rule bg-surface text-ink font-medium text-xs hover:bg-paper transition-colors flex items-center gap-1 cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHindi ? 'पीछे' : 'Back'}</span>
            </button>
            <button
              onClick={handleNextFromStep2}
              className="flex-1 py-2.5 px-4 rounded-xl bg-accent text-surface font-semibold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span>{isHindi ? 'पूर्वावलोकन देखें' : 'Continue to preview'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONTEXT, EVIDENCE ATTACHMENTS & LIVE PREVIEW */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-ink">
              {isHindi ? 'पृष्ठभूमि व संदर्भ' : 'Context & perspective'}
            </h3>
            <p className="text-[11px] text-ink-muted">
              {isHindi
                ? 'तथ्यात्मक पृष्ठभूमि, साक्ष्य और संदर्भ जोड़ें ताकि नागरिक दोनों पक्षों पर विचार कर सकें।'
                : 'Provide factual background, evidence, and nuances to help citizens deliberate.'}
            </p>
          </div>

          {/* Description Textarea with Mic Button */}
          <div className="p-3.5 rounded-xl bg-surface border border-rule space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-ink">
                {isHindi ? 'विस्तृत पृष्ठभूमि व संदर्भ' : 'Background context / perspective'}
              </label>

              <button
                type="button"
                onClick={handleStartDescMic}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer min-h-[32px] ${
                  isListening && micTarget === 'description'
                    ? 'bg-oppose-strong text-surface'
                    : 'bg-paper text-ink hover:bg-rule/40 border border-rule'
                }`}
                title={isHindi ? 'बोलकर लिखें' : 'Voice dictation'}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>
                  {isListening && micTarget === 'description' ? t.micListening : isHindi ? 'बोलें' : 'Dictate'}
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
              className="w-full p-3 text-xs rounded-xl bg-paper border border-rule focus:bg-surface focus:outline-none focus:border-accent leading-relaxed text-ink"
            />

            {isListening && micTarget === 'description' && (
              <div className="p-2.5 rounded-xl bg-oppose-soft border border-oppose-strong/30 flex items-center justify-between text-xs text-oppose-strong">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-oppose-strong animate-ping" />
                  <span className="font-medium">
                    {isHindi ? 'सुन रहे हैं... (रोकने के लिए दोबारा टैप करें)' : 'Listening... Tap again to stop'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleStartDescMic}
                  className="text-xs bg-oppose-strong text-surface px-2.5 py-1 rounded-md font-medium cursor-pointer"
                >
                  {isHindi ? 'रोकें' : 'Stop'}
                </button>
              </div>
            )}
          </div>

          {/* Multi-Media Attachments */}
          <div className="p-3.5 rounded-xl bg-surface border border-rule space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-accent" />
                <h4 className="text-xs font-semibold text-ink">
                  {isHindi ? 'प्रमाण संलग्न करें' : 'Attach supporting evidence'}
                </h4>
              </div>
              <span className="text-[10px] text-ink-muted">
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
                className="border-2 border-dashed border-rule hover:border-accent bg-paper rounded-xl p-4 text-center cursor-pointer transition-colors space-y-1.5 min-h-[44px]"
              >
                <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="text-xs font-medium text-ink">
                  {isHindi ? 'फ़ाइल चुनने के लिए टैप करें' : 'Tap to upload evidence file'}
                </div>
                <p className="text-[10px] text-ink-muted">
                  {isHindi
                    ? 'छवि (PNG, JPG), वीडियो (MP4), या रिपोर्ट दस्तावेज़ (PDF)'
                    : 'Photos (PNG, JPG, WebP), Videos (MP4, WebM) or Documents (PDF)'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-rule p-3 bg-paper space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-ink">
                    {fileMediaType === 'image' && <ImageIcon className="w-4 h-4 text-support" />}
                    {fileMediaType === 'video' && <VideoIcon className="w-4 h-4 text-accent" />}
                    {fileMediaType === 'document' && <FileText className="w-4 h-4 text-oppose-strong" />}
                    <span className="truncate max-w-[190px]">{selectedFile.name}</span>
                    <span className="text-[10px] text-ink-muted font-normal">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded-lg text-oppose-strong hover:bg-oppose-soft transition-colors cursor-pointer"
                    title={isHindi ? 'हटाएं' : 'Remove attachment'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {fileMediaType === 'image' && filePreviewUrl && (
                  <div className="rounded-lg overflow-hidden max-h-48 border border-rule bg-ink/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={filePreviewUrl}
                      alt="Evidence Preview"
                      className="w-full h-auto max-h-48 object-cover"
                    />
                  </div>
                )}

                {fileMediaType === 'video' && filePreviewUrl && (
                  <div className="rounded-lg overflow-hidden max-h-48 border border-rule bg-ink">
                    <video
                      src={filePreviewUrl}
                      controls
                      playsInline
                      className="w-full max-h-48"
                    />
                  </div>
                )}

                {fileMediaType === 'document' && (
                  <div className="p-3 rounded-lg bg-surface border border-rule flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-oppose-soft text-oppose-strong flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <p className="text-xs font-medium text-ink truncate max-w-[180px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-ink-muted">
                          {isHindi ? 'सत्यापित PDF साक्ष्य' : 'Verified PDF evidence document'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optional Reference Link */}
            <div className="pt-1 border-t border-rule">
              <label className="block text-[11px] font-medium text-ink mb-1">
                {isHindi ? 'समाचार या संदर्भ लिंक (वैकल्पिक)' : 'News or reference link (optional)'}
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-3 w-4 h-4 text-ink-muted" />
                <input
                  type="url"
                  placeholder="https://thehindu.com/news/national/article"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-paper border border-rule text-ink focus:bg-surface focus:outline-none focus:border-accent min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Live Card Preview with Neutral 0-Vote Bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-ink-muted block px-1">
              {isHindi ? 'लाइव पूर्वावलोकन' : 'Live preview'}
            </span>
            <div className="bg-surface border border-rule rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-paper text-ink border border-rule">
                  {TOPIC_NAMES[topic]?.[language] || topic}
                </span>
                <span className="text-[10px] text-ink-muted">
                  {isIndia ? (REGION_NAMES[region]?.[language] || region) : country} &bull; {isHindi ? 'अभी' : 'Just now'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-ink">
                <div className="w-5 h-5 rounded-full bg-accent text-surface text-[10px] flex items-center justify-center font-bold">
                  {user ? user.name.charAt(0) : 'Y'}
                </div>
                <span className="font-medium">{user ? user.name : (isHindi ? 'आप (नागरिक)' : 'You (Citizen)')}</span>
                <span className="text-[10px] text-ink-muted">
                  @{user ? user.username : 'citizen'}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-ink leading-snug font-serif">
                {title || (isHindi ? 'आपका नीतिगत प्रश्न यहां दिखाई देगा...' : 'Your proposition question will appear here...')}
              </h4>

              <p className="text-[11px] text-ink-muted leading-relaxed line-clamp-3">
                {description || (isHindi ? 'आपका पृष्ठभूमि विवरण और संदर्भ यहां प्रदर्शित होगा...' : 'Your context, policy explanation, and evidence will appear here...')}
              </p>

              {/* Realistic Empty Stance Bar Preview */}
              <div className="space-y-1 pt-1">
                <div className="h-2 w-full bg-paper rounded-full border border-rule flex items-center justify-center">
                  <span className="text-[9px] text-ink-muted">
                    {isHindi ? 'अभी तक कोई मत नहीं। पहले बनें।' : 'No votes yet. Be the first.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-2.5 px-4 rounded-xl border border-rule bg-surface text-ink font-medium text-xs hover:bg-paper transition-colors flex items-center gap-1 cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHindi ? 'पीछे' : 'Back'}</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingMedia}
              className="flex-1 py-2.5 px-4 rounded-xl bg-accent text-surface font-semibold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer min-h-[44px]"
            >
              <span>
                {isUploadingMedia
                  ? isHindi ? 'साक्ष्य अपलोड हो रहा है...' : 'Uploading evidence...'
                  : isSubmitting
                    ? isHindi ? 'प्रकाशित हो रहा है...' : 'Publishing...'
                    : isHindi ? 'बहस प्रकाशित करें' : 'Publish debate'}
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
