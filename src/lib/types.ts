export type Region = string;
export type Topic = 'All Topics' | 'Economy' | 'Education' | 'Civic Life' | 'Technology';
export type Language = 'en' | 'hi';
export type VotingMode = 'verdict' | 'spectrum';

export type SurveyChoice =
  | 'strongly_agree'
  | 'agree'
  | 'neutral'
  | 'disagree'
  | 'strongly_disagree';

export interface SurveyVotes {
  strongly_agree: number;
  agree: number;
  neutral: number;
  disagree: number;
  strongly_disagree: number;
}

export interface AgoraPost {
  id: string;
  title: string;
  title_hi?: string;
  description: string;
  description_hi?: string;
  context_hi?: string;
  country?: string;
  region: Region | string;
  topic: Topic | string;
  author_name: string;
  author_username?: string;
  author_id?: string;
  is_verified_citizen: boolean;
  voting_mode?: VotingMode;
  agree_votes: number;
  disagree_votes: number;
  survey_votes?: SurveyVotes;
  created_at: string;
  // Attachment provisions
  media_url?: string;
  media_type?: 'image' | 'video' | 'document';
  media_filename?: string;
  source_url?: string;
  // Optional cached AI summary
  ai_summary?: string[];
  // Supabase table compat
  post_type?: string;
  constituency?: string;
  location_landmark?: string;
  category?: string;
  upvotes?: number;
  reports_count?: number;
}

export type Post = AgoraPost;

export type ArgumentStance = 'pro' | 'con';

export interface AgoraArgument {
  id: string;
  post_id: string;
  author_name: string;
  author_username?: string;
  author_id?: string;
  stance: ArgumentStance;
  content: string;
  content_hi?: string;
  upvotes: number;
  created_at: string;
}

export type Argument = AgoraArgument;

export interface AgoraUser {
  id: string;
  email: string;
  name: string;
  username: string;
  region: Region;
  state?: string;
  constituency?: string;
  country?: string;
  bio?: string;
  isVerifiedVoter: boolean;
  karmaScore: number;
  votedDebates: Record<string, 'pro' | 'con'>;
  votedSurveys: Record<string, SurveyChoice>;
  votedPropositions?: Record<string, string>;
  upvotedArgumentIds: string[];
}

export type CitizenProfile = AgoraUser;
