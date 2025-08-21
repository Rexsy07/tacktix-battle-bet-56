-- Drop all existing tables and recreate from scratch
DROP TABLE IF EXISTS public.withdrawal_requests CASCADE;
DROP TABLE IF EXISTS public.platform_earnings CASCADE;
DROP TABLE IF EXISTS public.forum_group_members CASCADE;
DROP TABLE IF EXISTS public.forum_messages CASCADE;
DROP TABLE IF EXISTS public.forum_groups CASCADE;
DROP TABLE IF EXISTS public.tournaments CASCADE;
DROP TABLE IF EXISTS public.tournament_participants CASCADE;
DROP TABLE IF EXISTS public.match_players CASCADE;
DROP TABLE IF EXISTS public.match_participants CASCADE;
DROP TABLE IF EXISTS public.match_evidence CASCADE;
DROP TABLE IF EXISTS public.match_result_submissions CASCADE;
DROP TABLE IF EXISTS public.match_results CASCADE;
DROP TABLE IF EXISTS public.player_ratings CASCADE;
DROP TABLE IF EXISTS public.disputes CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.bank_details CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  country TEXT,
  skill_level TEXT DEFAULT 'beginner',
  gaming_experience TEXT DEFAULT 'beginner',
  preferred_game_modes TEXT[],
  favorite_game TEXT,
  total_earnings NUMERIC DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 1000,
  is_vip BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  game_mode TEXT NOT NULL,
  team_size TEXT DEFAULT '1v1',
  map_name TEXT,
  lobby_code TEXT,
  created_by UUID NOT NULL,
  host_id UUID,
  opponent_id UUID,
  entry_fee NUMERIC DEFAULT 0,
  bet_amount NUMERIC DEFAULT 0,
  prize_pool NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  max_players INTEGER DEFAULT 2,
  current_players INTEGER DEFAULT 1,
  team_players INTEGER DEFAULT 1,
  teams JSONB DEFAULT '[]'::jsonb,
  team_a_players UUID[] DEFAULT '{}',
  team_b_players UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'waiting_for_players', 'in_progress', 'completed', 'cancelled', 'pending')),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  match_started BOOLEAN DEFAULT false,
  match_started_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID,
  is_featured BOOLEAN DEFAULT false,
  is_vip_match BOOLEAN DEFAULT false,
  host_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'rejected', 'pending_verification')),
  description TEXT,
  match_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bank_details table
CREATE TABLE public.bank_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL DEFAULT 'PAYSTACK-TITAN',
  account_number TEXT NOT NULL DEFAULT '9851479231',
  account_name TEXT NOT NULL DEFAULT 'CHIPPERCASH/EZE ONYINYECHI',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create withdrawal_requests table
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  bank_code TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create platform_earnings table
CREATE TABLE public.platform_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create player_ratings table
CREATE TABLE public.player_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rater_id UUID NOT NULL,
  rated_id UUID NOT NULL,
  match_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create disputes table
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  reported_by UUID NOT NULL,
  resolved_by UUID,
  reason TEXT NOT NULL,
  description TEXT,
  evidence_url TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create match_participants table
CREATE TABLE public.match_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'kicked')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Create match_players table
CREATE TABLE public.match_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  user_id UUID NOT NULL,
  team TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Create match_results table
CREATE TABLE public.match_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  score INTEGER DEFAULT 0,
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  placement INTEGER,
  evidence_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create match_result_submissions table
CREATE TABLE public.match_result_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  submitted_by UUID NOT NULL,
  winner_id UUID,
  result_type TEXT NOT NULL,
  proof_urls TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create match_evidence table
CREATE TABLE public.match_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  submitted_by UUID NOT NULL,
  evidence_type TEXT NOT NULL,
  evidence_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  game_mode TEXT NOT NULL,
  created_by UUID NOT NULL,
  entry_fee NUMERIC DEFAULT 0,
  prize_pool NUMERIC DEFAULT 0,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration', 'in_progress', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tournament_participants table
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'eliminated', 'withdrawn')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Create forum_groups table
CREATE TABLE public.forum_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create forum_group_members table
CREATE TABLE public.forum_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create forum_messages table
CREATE TABLE public.forum_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_result_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public can view basic profile info" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Matches policies
CREATE POLICY "Users can view all matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Users can create matches" ON public.matches FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Match creators can update their matches" ON public.matches FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Moderators can update any match" ON public.matches FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true));

-- Wallets policies
CREATE POLICY "Users can view their own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wallet" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Moderators can update any wallet" ON public.wallets FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true));
CREATE POLICY "System can manage wallets" ON public.wallets FOR ALL USING (true);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Moderators can update transactions" ON public.transactions FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true));

-- Bank details policies
CREATE POLICY "Users can view bank details" ON public.bank_details FOR SELECT USING (true);
CREATE POLICY "Only moderators can manage bank details" ON public.bank_details FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true));

-- Withdrawal requests policies
CREATE POLICY "Users can view their own withdrawal requests" ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own withdrawal requests" ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Moderators can view all withdrawal requests" ON public.withdrawal_requests FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true));
CREATE POLICY "Moderators can update withdrawal requests" ON public.withdrawal_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true));

-- Announcements policies
CREATE POLICY "Users can view published announcements" ON public.announcements FOR SELECT USING (is_published = true);
CREATE POLICY "Moderators can manage announcements" ON public.announcements FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true));

-- Platform earnings policies
CREATE POLICY "Only moderators can view platform earnings" ON public.platform_earnings FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true));
CREATE POLICY "System can insert platform earnings" ON public.platform_earnings FOR INSERT WITH CHECK (true);

-- Player ratings policies
CREATE POLICY "Users can view all ratings" ON public.player_ratings FOR SELECT USING (true);
CREATE POLICY "Users can rate other players" ON public.player_ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Disputes policies
CREATE POLICY "Users can view disputes for matches they participated in" ON public.disputes FOR SELECT USING (EXISTS (SELECT 1 FROM match_participants mp WHERE mp.match_id = disputes.match_id AND mp.user_id = auth.uid()) OR auth.uid() = reported_by);
CREATE POLICY "Users can create disputes for matches they participated in" ON public.disputes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM match_participants mp WHERE mp.match_id = disputes.match_id AND mp.user_id = auth.uid()));

-- Match participants policies
CREATE POLICY "Users can view match participants" ON public.match_participants FOR SELECT USING (true);
CREATE POLICY "Users can join matches" ON public.match_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their participation" ON public.match_participants FOR UPDATE USING (auth.uid() = user_id);

-- Match players policies
CREATE POLICY "Users can view match players" ON public.match_players FOR SELECT USING (true);
CREATE POLICY "Users can join matches" ON public.match_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave matches" ON public.match_players FOR DELETE USING (auth.uid() = user_id);

-- Match results policies
CREATE POLICY "Users can view match results" ON public.match_results FOR SELECT USING (true);
CREATE POLICY "Participants can submit results" ON public.match_results FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM match_participants mp WHERE mp.match_id = match_results.match_id AND mp.user_id = auth.uid()));

-- Match result submissions policies
CREATE POLICY "Users can view match results they're involved in" ON public.match_result_submissions FOR SELECT USING (EXISTS (SELECT 1 FROM matches WHERE id = match_result_submissions.match_id AND (host_id = auth.uid() OR opponent_id = auth.uid())));
CREATE POLICY "Users can submit results for their matches" ON public.match_result_submissions FOR INSERT WITH CHECK (auth.uid() = submitted_by AND EXISTS (SELECT 1 FROM matches WHERE id = match_result_submissions.match_id AND (host_id = auth.uid() OR opponent_id = auth.uid())));

-- Match evidence policies
CREATE POLICY "Users can view match evidence" ON public.match_evidence FOR SELECT USING (true);
CREATE POLICY "Participants can submit evidence" ON public.match_evidence FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM match_participants mp WHERE mp.match_id = match_evidence.match_id AND mp.user_id = auth.uid()));

-- Tournaments policies
CREATE POLICY "Users can view tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Moderators can manage tournaments" ON public.tournaments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true));

-- Tournament participants policies
CREATE POLICY "Users can view tournament participants" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON public.tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can withdraw from tournaments" ON public.tournament_participants FOR DELETE USING (auth.uid() = user_id);

-- Forum groups policies
CREATE POLICY "Users can view all forum groups" ON public.forum_groups FOR SELECT USING (true);
CREATE POLICY "Users can create forum groups" ON public.forum_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own forum groups" ON public.forum_groups FOR UPDATE USING (auth.uid() = created_by);

-- Forum group members policies
CREATE POLICY "Users can view group members" ON public.forum_group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.forum_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.forum_group_members FOR DELETE USING (auth.uid() = user_id);

-- Forum messages policies
CREATE POLICY "Users can view messages in groups they're members of" ON public.forum_messages FOR SELECT USING (EXISTS (SELECT 1 FROM forum_group_members WHERE group_id = forum_messages.group_id AND user_id = auth.uid()));
CREATE POLICY "Users can send messages to groups they're members of" ON public.forum_messages FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM forum_group_members WHERE group_id = forum_messages.group_id AND user_id = auth.uid()));

-- Insert default bank details
INSERT INTO public.bank_details (bank_name, account_number, account_name) 
VALUES ('PAYSTACK-TITAN', '9851479231', 'CHIPPERCASH/EZE ONYINYECHI');