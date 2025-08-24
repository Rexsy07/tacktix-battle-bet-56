-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  phone_number TEXT,
  country TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  vip_status TEXT DEFAULT 'none' CHECK (vip_status IN ('none', 'bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'match_winnings', 'match_entry', 'refund', 'bonus')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  reference TEXT,
  match_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deposits table
CREATE TABLE public.deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_method TEXT NOT NULL,
  reference TEXT,
  description TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create withdrawal_requests table
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  bank_code TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  game_type TEXT NOT NULL,
  entry_fee DECIMAL(15,2) NOT NULL CHECK (entry_fee >= 0),
  prize_pool DECIMAL(15,2) NOT NULL CHECK (prize_pool >= 0),
  max_players INTEGER NOT NULL CHECK (max_players > 0),
  current_players INTEGER DEFAULT 0 CHECK (current_players >= 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  rules TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match_participants table
CREATE TABLE public.match_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'ready', 'playing', 'finished', 'disqualified')),
  score INTEGER DEFAULT 0,
  submitted_result BOOLEAN DEFAULT false,
  evidence_url TEXT,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Create match_results table
CREATE TABLE public.match_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.profiles(user_id),
  evidence_url TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disputed', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(user_id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create disputes table
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cheating', 'misconduct', 'technical_issue', 'other')),
  description TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  moderator_id UUID REFERENCES public.profiles(user_id),
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform_earnings table
CREATE TABLE public.platform_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vip_plans table
CREATE TABLE public.vip_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price DECIMAL(15,2) NOT NULL CHECK (price >= 0),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  benefits JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.vip_plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for wallets
CREATE POLICY "Users can view their own wallet" ON public.wallets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own wallet" ON public.wallets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

-- Create policies for deposits
CREATE POLICY "Users can view their own deposits" ON public.deposits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own deposits" ON public.deposits
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create policies for withdrawal_requests
CREATE POLICY "Users can view their own withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own withdrawal requests" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create policies for matches
CREATE POLICY "Matches are viewable by everyone" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Users can create matches" ON public.matches
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Match creators can update their matches" ON public.matches
  FOR UPDATE USING (auth.uid() = created_by);

-- Create policies for match_participants
CREATE POLICY "Match participants are viewable by everyone" ON public.match_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join matches" ON public.match_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON public.match_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for match_results
CREATE POLICY "Match results are viewable by everyone" ON public.match_results
  FOR SELECT USING (true);

CREATE POLICY "Users can submit match results" ON public.match_results
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Create policies for disputes
CREATE POLICY "Users can view disputes they're involved in" ON public.disputes
  FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() = reported_user_id);

CREATE POLICY "Users can create disputes" ON public.disputes
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Create policies for platform_earnings (admin only)
CREATE POLICY "Platform earnings are viewable by admins" ON public.platform_earnings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create policies for vip_plans
CREATE POLICY "VIP plans are viewable by everyone" ON public.vip_plans
  FOR SELECT USING (true);

-- Create policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at
  BEFORE UPDATE ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_results_updated_at
  BEFORE UPDATE ON public.match_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vip_plans_updated_at
  BEFORE UPDATE ON public.vip_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample VIP plans
INSERT INTO public.vip_plans (name, price, duration_days, benefits) VALUES
('Bronze', 5000.00, 30, '["10% bonus on deposits", "Priority customer support", "Exclusive tournaments"]'),
('Silver', 10000.00, 30, '["15% bonus on deposits", "Priority customer support", "Exclusive tournaments", "Reduced platform fees"]'),
('Gold', 20000.00, 30, '["20% bonus on deposits", "VIP customer support", "Exclusive tournaments", "No platform fees", "Early access to features"]'),
('Platinum', 50000.00, 30, '["25% bonus on deposits", "Dedicated account manager", "All exclusive features", "Custom tournaments", "Premium rewards"]');