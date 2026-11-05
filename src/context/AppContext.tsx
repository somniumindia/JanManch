'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AgoraPost,
  AgoraArgument,
  AgoraUser,
  Region,
  Topic,
  ArgumentStance,
  Language,
  SurveyChoice,
  SurveyVotes,
  VotingMode,
} from '@/lib/types';
import { INITIAL_POSTS, INITIAL_ARGUMENTS } from '@/lib/seedData';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type ActiveTabType = 'agora' | 'pulse' | 'create' | 'profile';
export type FeedSortType = 'latest' | 'active';

interface AppContextType {
  posts: AgoraPost[];
  argumentsList: AgoraArgument[];
  user: AgoraUser | null;
  isAuthChecking: boolean;
  profileError: string | null;
  retryProfile: () => Promise<void>;
  activeCountry: string;
  activeRegion: Region;
  activeConstituency: string;
  activeTopic: Topic;
  activeTab: ActiveTabType;
  feedSort: FeedSortType;
  language: Language;
  searchQuery: string;
  isLiveSupabase: boolean;
  isAuthModalOpen: boolean;
  authModalPrompt: string;
  drawerPost: AgoraPost | null;
  setCountry: (c: string) => void;
  setGeographicFilter: (country: string, region?: string, constituency?: string) => void;
  setRegion: (r: Region) => void;
  setConstituency: (c: string) => void;
  setRegionAndConstituency: (region: string, constituency?: string) => void;
  setTopic: (t: Topic) => void;
  setActiveTab: (t: ActiveTabType) => void;
  setFeedSort: (s: FeedSortType) => void;
  setLanguage: (l: Language) => void;
  toggleLanguage: () => void;
  setSearchQuery: (q: string) => void;
  setDrawerPost: (p: AgoraPost | null) => void;
  openAuthModal: (prompt?: string) => void;
  closeAuthModal: () => void;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    name: string;
    username?: string;
    email: string;
    password: string;
    country?: string;
    region?: Region;
    constituency?: string;
  }) => Promise<{ success: boolean; error?: string; emailConfirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; region?: Region; bio?: string }) => Promise<void>;
  castPropositionVote: (postId: string, voteKey: string) => Promise<void>;
  castSurveyVote: (postId: string, choice: SurveyChoice) => Promise<void>;
  castVote: (postId: string, stance: 'pro' | 'con') => Promise<void>;
  addArgument: (postId: string, stance: ArgumentStance, content: string) => Promise<void>;
  upvoteArgument: (argumentId: string) => Promise<void>;
  createDiscussion: (data: {
    title: string;
    description: string;
    topic: string;
    region: string;
    constituency?: string;
    country?: string;
    voting_mode?: VotingMode;
    media_url?: string;
    media_type?: 'image' | 'video' | 'document';
    media_filename?: string;
    source_url?: string;
  }) => Promise<void>;
  reportDiscussion: (postId: string) => Promise<void>;
  openDebateDrawerById: (postId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_POSTS = 'janmanch_agora_posts_v4';
const STORAGE_KEY_ARGUMENTS = 'janmanch_agora_args_v4';
const STORAGE_KEY_USER = 'janmanch_auth_user_v4';
const STORAGE_KEY_GUEST = 'janmanch_is_guest_mode_v4';
const STORAGE_KEY_REGISTERED_USERS = 'janmanch_registered_citizens_v4';
const STORAGE_KEY_LANG = 'janmanch_language_v4';
const STORAGE_KEY_SORT = 'janmanch_feed_sort_v4';
const STORAGE_KEY_COUNTRY = 'janmanch_active_country_v4';

function computeDefaultSurveyVotes(agrees: number, disagrees: number): SurveyVotes {
  const sa = Math.round(agrees * 0.55);
  const a = Math.max(0, agrees - sa);
  const neutral = Math.max(12, Math.round((agrees + disagrees) * 0.1));
  const sd = Math.round(disagrees * 0.45);
  const d = Math.max(0, disagrees - sd);
  return {
    strongly_agree: sa,
    agree: a,
    neutral,
    disagree: d,
    strongly_disagree: sd,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<AgoraPost[]>(INITIAL_POSTS);
  const [argumentsList, setArgumentsList] = useState<AgoraArgument[]>(INITIAL_ARGUMENTS);
  const [user, setUser] = useState<AgoraUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string>('Worldwide');
  const [activeRegion, setActiveRegion] = useState<Region>('All India');
  const [activeConstituency, setActiveConstituency] = useState<string>('All Constituencies');
  const [activeTopic, setActiveTopic] = useState<Topic>('All Topics');
  const [activeTab, setActiveTab] = useState<ActiveTabType>('agora');
  const [feedSort, setFeedSort] = useState<FeedSortType>('latest');
  const [language, setLanguageState] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalPrompt, setAuthModalPrompt] = useState<string>('Sign in to record your civic stance.');
  const [drawerPost, setDrawerPost] = useState<AgoraPost | null>(null);

  // Fetch citizen profile from Supabase profiles table
  const fetchUserProfile = useCallback(async (authUser: any) => {
    setIsAuthChecking(true);
    setProfileError(null);
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      setIsAuthChecking(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch warning:', error);
      }

      const meta = authUser.user_metadata || {};

      if (profile) {
        const citizenUser: AgoraUser = {
          id: authUser.id,
          email: authUser.email || '',
          name: profile.full_name || meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Citizen',
          username: profile.username || meta.username || authUser.email?.split('@')[0] || 'citizen',
          region: (profile.state as Region) || (meta.state as Region) || (meta.region as Region) || 'All India',
          state: profile.state || meta.state || 'All India',
          constituency: profile.constituency || meta.constituency || 'All Constituencies',
          country: profile.country || meta.country || 'India',
          bio: profile.bio || meta.bio || 'Active Citizen & Deliberator',
          isVerifiedVoter: true,
          karmaScore: profile.karma_score ?? 50,
          votedDebates: meta.voted_debates || {},
          votedSurveys: meta.voted_surveys || {},
          votedPropositions: meta.voted_propositions || {},
          upvotedArgumentIds: meta.upvoted_arguments || [],
        };
        setUser(citizenUser);
      } else {
        // Create initial row in profiles table
        const newProfile = {
          id: authUser.id,
          username: meta.username || authUser.email?.split('@')[0] || `citizen_${authUser.id.slice(0, 6)}`,
          full_name: meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Citizen',
          country: meta.country || 'India',
          state: meta.state || meta.region || 'All India',
          constituency: meta.constituency || 'All Constituencies',
          karma_score: 50,
          bio: meta.bio || 'Active Citizen & Deliberator',
        };

        try {
          await supabase.from('profiles').upsert(newProfile);
        } catch (insertErr) {
          console.warn('Profile upsert warning:', insertErr);
        }

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: newProfile.full_name,
          username: newProfile.username,
          region: newProfile.state as Region,
          state: newProfile.state,
          constituency: newProfile.constituency,
          country: newProfile.country,
          bio: newProfile.bio,
          isVerifiedVoter: true,
          karmaScore: 50,
          votedDebates: {},
          votedSurveys: {},
          votedPropositions: {},
          upvotedArgumentIds: [],
        });
      }
    } catch (err: any) {
      console.error('Failed to load citizen profile from Supabase:', err);
      setProfileError('Failed to load citizen profile. Please check your network and retry.');
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  const retryProfile = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setIsAuthChecking(false);
      }
    } catch {
      setIsAuthChecking(false);
    }
  }, [fetchUserProfile]);

  // Load feed posts and arguments from Supabase
  const loadFeedData = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) return;

    try {
      const [postRes, argRes] = await Promise.allSettled([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('arguments').select('*').order('created_at', { ascending: false }),
      ]);

      if (postRes.status === 'fulfilled' && postRes.value.data && postRes.value.data.length > 0) {
        const mappedPosts: AgoraPost[] = postRes.value.data.map((item: any) => {
          const agreeVotes = item.agree_votes || 0;
          const disagreeVotes = item.disagree_votes || 0;
          const surveyVotes = item.survey_votes || {
            strongly_agree: item.vote_strongly_agree || 0,
            agree: item.vote_agree || 0,
            neutral: item.vote_neutral || 0,
            disagree: item.vote_disagree || 0,
            strongly_disagree: item.vote_strongly_disagree || 0,
          };

          return {
            id: item.id,
            title: item.title,
            description: item.context || item.description || '',
            region: item.state || item.constituency || item.region || 'All India',
            topic: item.topic || item.category || 'Civic Life',
            country: item.country || 'India',
            state: item.state || item.region || 'All India',
            constituency: item.constituency || 'All Constituencies',
            voting_mode: item.voting_mode || 'spectrum',
            author_name: item.author_name || 'Verified Citizen',
            author_username: item.author_username || item.author_name?.toLowerCase().replace(/\s+/g, '_') || 'citizen',
            author_id: item.author_id,
            is_verified_citizen: item.is_verified_citizen ?? true,
            agree_votes: agreeVotes,
            disagree_votes: disagreeVotes,
            survey_votes: surveyVotes,
            media_url: item.media_url,
            media_type: item.media_type,
            media_filename: item.media_filename,
            source_url: item.external_link || item.source_url,
            created_at: item.created_at || new Date().toISOString(),
          };
        });
        setPosts(mappedPosts);
        setIsLiveSupabase(true);
      }

      if (argRes.status === 'fulfilled' && argRes.value.data && argRes.value.data.length > 0) {
        const mappedArgs: AgoraArgument[] = argRes.value.data.map((item: any) => ({
          id: item.id,
          post_id: item.post_id,
          author_name: item.author_name || 'Citizen',
          author_username: item.author_username || item.author_name?.toLowerCase().replace(/\s+/g, '_') || 'citizen',
          author_id: item.author_id,
          stance: item.stance === 'con' ? 'con' : 'pro',
          content: item.content,
          upvotes: item.upvotes || 0,
          created_at: item.created_at || new Date().toISOString(),
        }));
        setArgumentsList(mappedArgs);
      }
    } catch (err) {
      console.warn('Error loading feed data from Supabase:', err);
    }
  }, []);

  // Initialize and subscribe to Supabase Auth & Session state
  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabase();

    // Preferences
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language;
      if (savedLang === 'hi' || savedLang === 'en') {
        if (isMounted) setLanguageState(savedLang);
      }
      const savedSort = localStorage.getItem(STORAGE_KEY_SORT) as FeedSortType;
      if (savedSort === 'latest' || savedSort === 'active') {
        if (isMounted) setFeedSort(savedSort);
      }
      const savedCountry = localStorage.getItem(STORAGE_KEY_COUNTRY);
      if (savedCountry && isMounted) {
        setActiveCountry(savedCountry);
      }
    } catch {}

    loadFeedData();

    if (!supabase || !isSupabaseConfigured()) {
      setIsAuthChecking(false);
      return;
    }

    // 1. Session persistence check using getSession
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return;
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
          setIsAuthChecking(false);
        }
      })
      .catch((err) => {
        console.error('Session get error:', err);
        if (isMounted) setIsAuthChecking(false);
      });

    // 2. onAuthStateChange subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsAuthChecking(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, loadFeedData]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    } catch {}
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ARGUMENTS, JSON.stringify(argumentsList));
    } catch {}
  }, [argumentsList]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.removeItem(STORAGE_KEY_GUEST);
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.setItem(STORAGE_KEY_GUEST, 'true');
      }
    } catch {}
  }, [user]);

  // Language management
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {}
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY_LANG, next);
      } catch {}
      return next;
    });
  }, []);

  // Feed sort
  const setFeedSortOption = useCallback((sort: FeedSortType) => {
    setFeedSort(sort);
    try {
      localStorage.setItem(STORAGE_KEY_SORT, sort);
    } catch {}
  }, []);

  // Auth Helpers
  const openAuthModal = useCallback((prompt?: string) => {
    setAuthModalPrompt(prompt || (language === 'hi' ? 'अपना नागरिक मत दर्ज करने के लिए प्रवेश करें।' : 'Sign in to record your civic stance.'));
    setIsAuthModalOpen(true);
  }, [language]);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const signIn = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      const cleanEmail = email.trim().toLowerCase();
      const supabase = getSupabase();

      if (!supabase || !isSupabaseConfigured()) {
        return { success: false, error: 'Database service is not configured.' };
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (error) {
          const errMsg = error.message || '';
          if (
            errMsg.toLowerCase().includes('email not confirmed') ||
            errMsg.toLowerCase().includes('email_not_confirmed') ||
            errMsg.toLowerCase().includes('not confirmed')
          ) {
            return {
              success: false,
              error:
                language === 'hi'
                  ? 'आपका ईमेल अभी सत्यापित नहीं हुआ है। कृपया अपना इनबॉक्स या स्पैम फ़ोल्डर जांचें।'
                  : 'Your email is not verified yet. Please check your inbox or spam folder.',
            };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Additional safety guard: If user's email is not confirmed, do not let them in
          if (!data.user.email_confirmed_at && !data.session) {
            await supabase.auth.signOut();
            return {
              success: false,
              error:
                language === 'hi'
                  ? 'आपका ईमेल अभी सत्यापित नहीं हुआ है। कृपया अपना इनबॉक्स या स्पैम फ़ोल्डर जांचें।'
                  : 'Your email is not verified yet. Please check your inbox or spam folder.',
            };
          }

          await fetchUserProfile(data.user);
          setIsAuthModalOpen(false);
          return { success: true };
        }

        return { success: false, error: 'Unable to start citizen session.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to sign in. Please check your credentials.' };
      }
    },
    [fetchUserProfile, language]
  );

  const signUp = useCallback(
    async (data: {
      name: string;
      username?: string;
      email: string;
      password: string;
      country?: string;
      region?: Region;
      constituency?: string;
    }): Promise<{ success: boolean; error?: string; emailConfirmationRequired?: boolean }> => {
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanName = data.name.trim();
      const cleanUsername = (data.username || cleanEmail.split('@')[0])
        .trim()
        .toLowerCase()
        .replace(/^@/, '')
        .replace(/[^a-z0-9_]/g, '_');
      const country = data.country || 'India';
      const state = data.region || 'All India';
      const constituency = data.constituency || 'All Constituencies';

      const supabase = getSupabase();
      if (!supabase || !isSupabaseConfigured()) {
        return { success: false, error: 'Database service is not configured.' };
      }

      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
            data: {
              name: cleanName,
              full_name: cleanName,
              username: cleanUsername,
              country,
              state,
              region: state,
              constituency,
            },
          },
        });

        if (authError) {
          return { success: false, error: authError.message };
        }

        if (authData.user) {
          // Upsert row into profiles table so their profile info exists when they confirm
          try {
            await supabase.from('profiles').upsert({
              id: authData.user.id,
              username: cleanUsername,
              full_name: cleanName,
              country,
              state,
              constituency,
              karma_score: 50,
              bio: 'Active Citizen & Deliberator',
            });
          } catch (profileErr) {
            console.warn('Profile upsert warning:', profileErr);
          }

          // STRICT EMAIL CONFIRMATION GATE:
          // Immediately sign out to clear any provisional local session.
          // DO NOT automatically log in or transition to the main app dashboard.
          await supabase.auth.signOut();
          setUser(null);
          setIsAuthChecking(false);

          return { success: true, emailConfirmationRequired: true };
        }

        return { success: true, emailConfirmationRequired: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to register citizen account.' };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    setUser(null);
    setIsAuthChecking(false);
    setProfileError(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_GUEST);
    } catch {}
    setActiveTab('agora');
  }, []);

  const updateProfile = useCallback(
    async (data: { name?: string; region?: Region; bio?: string }) => {
      if (!user) return;
      const updatedUser: AgoraUser = {
        ...user,
        name: data.name !== undefined ? data.name : user.name,
        region: data.region !== undefined ? data.region : user.region,
        bio: data.bio !== undefined ? data.bio : user.bio,
      };
      setUser(updatedUser);

      const supabase = getSupabase();
      if (supabase && isSupabaseConfigured()) {
        try {
          await supabase
            .from('profiles')
            .update({
              full_name: updatedUser.name,
              state: updatedUser.region,
              bio: updatedUser.bio,
            })
            .eq('id', user.id);

          await supabase.auth.updateUser({
            data: {
              name: updatedUser.name,
              region: updatedUser.region,
              bio: updatedUser.bio,
            },
          });
        } catch (err) {
          console.warn('Supabase update profile error:', err);
        }
      }
    },
    [user]
  );

  // 5-Point Likert Consensus Voting
  const castSurveyVote = useCallback(
    async (postId: string, choice: SurveyChoice) => {
      if (!user) {
        openAuthModal(
          language === 'hi'
            ? 'अपना 5-बिंदु जनमत दर्ज करने के लिए प्रवेश करें।'
            : 'Sign in to record your civic stance.'
        );
        return;
      }

      const existingChoice = user.votedSurveys?.[postId];
      if (existingChoice === choice) return;

      // Optimistic update of posts
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const currentSurvey: SurveyVotes = post.survey_votes
            ? { ...post.survey_votes }
            : computeDefaultSurveyVotes(post.agree_votes, post.disagree_votes);

          // Decrement existing choice
          if (existingChoice && currentSurvey[existingChoice] !== undefined) {
            currentSurvey[existingChoice] = Math.max(0, currentSurvey[existingChoice] - 1);
          }

          // Increment new choice
          currentSurvey[choice] = (currentSurvey[choice] || 0) + 1;

          // Recompute agree/disagree votes
          const totalAgrees = (currentSurvey.strongly_agree || 0) + (currentSurvey.agree || 0);
          const totalDisagrees = (currentSurvey.strongly_disagree || 0) + (currentSurvey.disagree || 0);

          return {
            ...post,
            survey_votes: currentSurvey,
            agree_votes: totalAgrees,
            disagree_votes: totalDisagrees,
          };
        })
      );

      // Reward Karma for participation
      const karmaReward = existingChoice ? 0 : 10;
      const binaryStance: 'pro' | 'con' =
        choice === 'strongly_agree' || choice === 'agree' ? 'pro' : 'con';

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          karmaScore: prev.karmaScore + karmaReward,
          votedSurveys: {
            ...(prev.votedSurveys || {}),
            [postId]: choice,
          },
          votedDebates: {
            ...(prev.votedDebates || {}),
            [postId]: binaryStance,
          },
        };
      });

      // Update drawer post if open
      setDrawerPost((prev) => {
        if (!prev || prev.id !== postId) return prev;
        const currentSurvey: SurveyVotes = prev.survey_votes
          ? { ...prev.survey_votes }
          : computeDefaultSurveyVotes(prev.agree_votes, prev.disagree_votes);

        if (existingChoice && currentSurvey[existingChoice] !== undefined) {
          currentSurvey[existingChoice] = Math.max(0, currentSurvey[existingChoice] - 1);
        }
        currentSurvey[choice] = (currentSurvey[choice] || 0) + 1;
        const totalAgrees = (currentSurvey.strongly_agree || 0) + (currentSurvey.agree || 0);
        const totalDisagrees = (currentSurvey.strongly_disagree || 0) + (currentSurvey.disagree || 0);

        return {
          ...prev,
          survey_votes: currentSurvey,
          agree_votes: totalAgrees,
          disagree_votes: totalDisagrees,
        };
      });

      // Supabase RPC sync
      const supabase = getSupabase();
      if (supabase && isLiveSupabase) {
        try {
          await supabase.rpc('cast_5point_survey', {
            target_post_id: postId,
            survey_choice: choice,
          });
        } catch {
          // Fallback to cast_debate_vote or direct update
          try {
            await supabase.rpc('cast_debate_vote', {
              target_post_id: postId,
              vote_stance: binaryStance === 'pro' ? 'agree' : 'disagree',
            });
          } catch {}
        }
      }
    },
    [user, isLiveSupabase, language, openAuthModal]
  );

  // Backward compatible castVote
  const castVote = useCallback(
    async (postId: string, stance: 'pro' | 'con') => {
      const choice: SurveyChoice = stance === 'pro' ? 'agree' : 'disagree';
      await castSurveyVote(postId, choice);
    },
    [castSurveyVote]
  );

  // Cast Proposition Vote (Unified for 'verdict' [endorse vs oppose] & 'spectrum' [5-tier Likert])
  const castPropositionVote = useCallback(
    async (postId: string, voteKey: string) => {
      if (!user) {
        openAuthModal(
          language === 'hi'
            ? 'अपना जनमत दर्ज करने के लिए प्रवेश करें।'
            : 'Sign in to record your civic stance.'
        );
        return;
      }

      const existingVote = user.votedPropositions?.[postId] || user.votedSurveys?.[postId];
      if (existingVote === voteKey) return;

      const post = posts.find((p) => p.id === postId);
      const isVerdict = post?.voting_mode === 'verdict' || voteKey === 'endorse' || voteKey === 'oppose';

      if (isVerdict) {
        const isEndorse = voteKey === 'endorse' || voteKey === 'pro' || voteKey === 'agree';
        const prevEndorse =
          existingVote === 'endorse' || existingVote === 'pro' || existingVote === 'agree';
        const prevOppose =
          existingVote === 'oppose' || existingVote === 'con' || existingVote === 'disagree';

        // Optimistic update for posts
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            let agree = p.agree_votes;
            let disagree = p.disagree_votes;

            if (prevEndorse) agree = Math.max(0, agree - 1);
            if (prevOppose) disagree = Math.max(0, disagree - 1);

            if (isEndorse) agree += 1;
            else disagree += 1;

            return {
              ...p,
              agree_votes: agree,
              disagree_votes: disagree,
            };
          })
        );

        // Update user state
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            karmaScore: prev.karmaScore + (existingVote ? 0 : 10),
            votedDebates: {
              ...(prev.votedDebates || {}),
              [postId]: isEndorse ? 'pro' : 'con',
            },
            votedPropositions: {
              ...(prev.votedPropositions || {}),
              [postId]: isEndorse ? 'endorse' : 'oppose',
            },
          };
        });

        // Update drawer post if open
        setDrawerPost((prev) => {
          if (!prev || prev.id !== postId) return prev;
          let agree = prev.agree_votes;
          let disagree = prev.disagree_votes;
          if (prevEndorse) agree = Math.max(0, agree - 1);
          if (prevOppose) disagree = Math.max(0, disagree - 1);
          if (isEndorse) agree += 1;
          else disagree += 1;
          return {
            ...prev,
            agree_votes: agree,
            disagree_votes: disagree,
          };
        });

        // Supabase RPC sync
        const supabase = getSupabase();
        if (supabase && isLiveSupabase) {
          try {
            await supabase.rpc('cast_proposition_vote', {
              target_post_id: postId,
              vote_key: isEndorse ? 'endorse' : 'oppose',
            });
          } catch {
            try {
              await supabase.rpc('cast_debate_vote', {
                target_post_id: postId,
                vote_stance: isEndorse ? 'agree' : 'disagree',
              });
            } catch {}
          }
        }
      } else {
        // Spectrum 5-tier vote
        const choice = voteKey as SurveyChoice;
        await castSurveyVote(postId, choice);

        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            votedPropositions: {
              ...(prev.votedPropositions || {}),
              [postId]: voteKey,
            },
          };
        });

        const supabase = getSupabase();
        if (supabase && isLiveSupabase) {
          try {
            await supabase.rpc('cast_proposition_vote', {
              target_post_id: postId,
              vote_key: voteKey,
            });
          } catch {}
        }
      }
    },
    [user, language, openAuthModal, posts, castSurveyVote, isLiveSupabase]
  );

  // Add Argument tagged as Pro or Con
  const addArgument = useCallback(
    async (postId: string, stance: ArgumentStance, content: string) => {
      if (!user) {
        openAuthModal(
          language === 'hi'
            ? 'अपना तर्क प्रस्तुत करने के लिए प्रवेश करें।'
            : 'Sign in to submit your civic argument.'
        );
        return;
      }

      const authorName = user.name;
      const authorUsername = user.username;
      const newArg: AgoraArgument = {
        id: `arg-${Date.now()}`,
        post_id: postId,
        author_name: authorName,
        author_username: authorUsername,
        author_id: user.id,
        stance,
        content,
        upvotes: 1,
        created_at: new Date().toISOString(),
      };

      setArgumentsList((prev) => [newArg, ...prev]);

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          karmaScore: prev.karmaScore + 20,
          upvotedArgumentIds: [...(prev.upvotedArgumentIds || []), newArg.id],
        };
      });

      const supabase = getSupabase();
      if (supabase && isLiveSupabase) {
        try {
          await supabase.from('arguments').insert([
            {
              id: newArg.id,
              post_id: postId,
              author_name: authorName,
              author_username: authorUsername,
              stance,
              content,
              upvotes: 1,
              created_at: newArg.created_at,
            },
          ]);
        } catch {}
      }
    },
    [user, isLiveSupabase, openAuthModal, language]
  );

  // Upvote Argument
  const upvoteArgument = useCallback(
    async (argumentId: string) => {
      if (!user) {
        openAuthModal(
          language === 'hi'
            ? 'तर्क का समर्थन करने के लिए प्रवेश करें।'
            : 'Sign in to upvote debate arguments.'
        );
        return;
      }

      const alreadyUpvoted = (user.upvotedArgumentIds || []).includes(argumentId);
      const delta = alreadyUpvoted ? -1 : 1;

      setArgumentsList((prev) =>
        prev.map((a) =>
          a.id === argumentId ? { ...a, upvotes: Math.max(0, a.upvotes + delta) } : a
        )
      );

      setUser((prev) => {
        if (!prev) return prev;
        const currentIds = prev.upvotedArgumentIds || [];
        const nextIds = alreadyUpvoted
          ? currentIds.filter((id) => id !== argumentId)
          : [...currentIds, argumentId];
        return {
          ...prev,
          karmaScore: Math.max(0, prev.karmaScore + delta * 5),
          upvotedArgumentIds: nextIds,
        };
      });

      const supabase = getSupabase();
      if (supabase && isLiveSupabase) {
        try {
          await supabase.rpc('upvote_argument_with_karma', { target_argument_id: argumentId });
        } catch {
          try {
            await supabase.rpc('upvote_argument', { target_argument_id: argumentId });
          } catch {
            const target = argumentsList.find((a) => a.id === argumentId);
            if (target) {
              await supabase
                .from('arguments')
                .update({ upvotes: Math.max(0, target.upvotes + delta) })
                .eq('id', argumentId);
            }
          }
        }
      }
    },
    [user, argumentsList, isLiveSupabase, openAuthModal, language]
  );

  const setCountry = useCallback((c: string) => {
    setActiveCountry(c);
    try {
      localStorage.setItem(STORAGE_KEY_COUNTRY, c);
    } catch {}
    if (c !== 'India') {
      setActiveRegion('Countrywide');
      setActiveConstituency('Countrywide');
    } else {
      setActiveRegion('All India');
      setActiveConstituency('All Constituencies');
    }
  }, []);

  const setGeographicFilter = useCallback(
    (country: string, region?: string, constituency?: string) => {
      setActiveCountry(country);
      try {
        localStorage.setItem(STORAGE_KEY_COUNTRY, country);
      } catch {}
      if (country !== 'India') {
        setActiveRegion(region || 'Countrywide');
        setActiveConstituency(constituency || 'Countrywide');
      } else {
        setActiveRegion(region || 'All India');
        setActiveConstituency(constituency || 'All Constituencies');
      }
    },
    []
  );

  const handleSetRegion = useCallback((r: Region) => {
    setActiveRegion(r);
    setActiveConstituency('All Constituencies');
  }, []);

  const setRegionAndConstituency = useCallback((region: string, constituency?: string) => {
    setActiveRegion(region);
    setActiveConstituency(constituency || 'All Constituencies');
  }, []);

  // Create Proposition with Attachments & Voting Mode
  const createDiscussion = useCallback(
    async (data: {
      title: string;
      description: string;
      topic: string;
      region: string;
      constituency?: string;
      country?: string;
      voting_mode?: VotingMode;
      media_url?: string;
      media_type?: 'image' | 'video' | 'document';
      media_filename?: string;
      source_url?: string;
    }) => {
      if (!user) {
        openAuthModal(
          language === 'hi'
            ? 'नया नीति प्रस्ताव प्रकाशित करने के लिए प्रवेश करें।'
            : 'Sign in to publish a civic proposition.'
        );
        return;
      }

      const authorName = user.name;
      const authorUsername = user.username;
      const isVerified = user.isVerifiedVoter ?? true;
      const chosenVotingMode: VotingMode = data.voting_mode || 'spectrum';
      const chosenCountry = data.country || (data.region === 'Countrywide' ? 'Worldwide' : 'India');

      const newPost: AgoraPost = {
        id: `post-${Date.now()}`,
        title: data.title,
        description: data.description,
        country: chosenCountry,
        region: data.region,
        constituency: data.constituency || 'All Constituencies',
        topic: data.topic,
        author_name: authorName,
        author_username: authorUsername,
        author_id: user.id,
        is_verified_citizen: isVerified,
        voting_mode: chosenVotingMode,
        agree_votes: 1,
        disagree_votes: 0,
        survey_votes: {
          strongly_agree: 1,
          agree: 0,
          neutral: 0,
          disagree: 0,
          strongly_disagree: 0,
        },
        media_url: data.media_url?.trim() || undefined,
        media_type: data.media_type,
        media_filename: data.media_filename,
        source_url: data.source_url?.trim() || undefined,
        created_at: new Date().toISOString(),
        post_type: 'debate',
        category: data.topic,
      };

      setPosts((prev) => [newPost, ...prev]);

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          karmaScore: prev.karmaScore + 30,
          votedDebates: { ...(prev.votedDebates || {}), [newPost.id]: 'pro' },
          votedSurveys: { ...(prev.votedSurveys || {}), [newPost.id]: 'strongly_agree' },
          votedPropositions: {
            ...(prev.votedPropositions || {}),
            [newPost.id]: chosenVotingMode === 'verdict' ? 'endorse' : 'strongly_agree',
          },
        };
      });

      const supabase = getSupabase();
      if (supabase && isLiveSupabase) {
        try {
          await supabase.from('posts').insert([
            {
              id: newPost.id,
              post_type: 'debate',
              title: newPost.title,
              description: newPost.description,
              country: chosenCountry,
              voting_mode: chosenVotingMode,
              constituency: newPost.region,
              location_landmark: `${newPost.region} Agora`,
              author_name: authorName,
              author_username: authorUsername,
              is_verified_citizen: isVerified,
              agree_votes: 1,
              disagree_votes: 0,
              reports_count: 0,
              created_at: newPost.created_at,
              category: newPost.topic,
              media_url: newPost.media_url,
              media_type: newPost.media_type,
              media_filename: newPost.media_filename,
              source_url: newPost.source_url,
            },
          ]);
        } catch {}
      }

      setActiveTab('agora');
    },
    [user, isLiveSupabase, openAuthModal, language]
  );

  // Report post
  const reportDiscussion = useCallback(
    async (postId: string) => {
      const supabase = getSupabase();
      if (supabase && isLiveSupabase) {
        try {
          await supabase.rpc('report_post', { target_post_id: postId });
        } catch {}
      }
    },
    [isLiveSupabase]
  );

  // 1-Tap shortcut to open debate drawer by Post ID from Tab 2 Pulse Trends
  const openDebateDrawerById = useCallback(
    (postId: string) => {
      const target = posts.find((p) => p.id === postId);
      if (target) {
        setDrawerPost(target);
        setActiveTab('agora');
      }
    },
    [posts]
  );

  return (
    <AppContext.Provider
      value={{
        posts,
        argumentsList,
        user,
        isAuthChecking,
        profileError,
        retryProfile,
        activeCountry,
        activeRegion,
        activeConstituency,
        activeTopic,
        activeTab,
        feedSort,
        language,
        searchQuery,
        isLiveSupabase,
        isAuthModalOpen,
        authModalPrompt,
        drawerPost,
        setCountry,
        setGeographicFilter,
        setRegion: handleSetRegion,
        setConstituency: setActiveConstituency,
        setRegionAndConstituency,
        setTopic: setActiveTopic,
        setActiveTab,
        setFeedSort: setFeedSortOption,
        setLanguage,
        toggleLanguage,
        setSearchQuery,
        setDrawerPost,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        updateProfile,
        castPropositionVote,
        castSurveyVote,
        castVote,
        addArgument,
        upvoteArgument,
        createDiscussion,
        reportDiscussion,
        openDebateDrawerById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
