-- Create function to update user balance
CREATE OR REPLACE FUNCTION public.update_user_balance(user_id UUID, amount_change NUMERIC)
RETURNS VOID AS $$
BEGIN
  -- Create wallet if it doesn't exist
  INSERT INTO public.wallets (user_id, balance)
  VALUES (user_id, GREATEST(0, amount_change))
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    balance = GREATEST(0, wallets.balance + amount_change),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;