
import { supabase } from "@/integrations/supabase/client";

export const getUserBalance = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If wallet doesn't exist, create one
      if (error.code === 'PGRST116') {
        const { error: createError } = await supabase
          .from("wallets")
          .insert({ user_id: userId, balance: 0 });
        
        if (createError) throw createError;
        return 0;
      }
      throw error;
    }

    return data?.balance || 0;
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return 0;
  }
};

export const updateUserBalance = async (userId: string, newBalance: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("wallets")
      .upsert({ user_id: userId, balance: newBalance }, { onConflict: "user_id" });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user balance:", error);
    return { success: false, error: error.message };
  }
};

export const deductFromBalance = async (userId: string, amount: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentBalance = await getUserBalance(userId);
    
    if (currentBalance < amount) {
      return { success: false, error: "Insufficient balance" };
    }

    const newBalance = currentBalance - amount;
    return await updateUserBalance(userId, newBalance);
  } catch (error: any) {
    console.error("Error deducting from balance:", error);
    return { success: false, error: error.message };
  }
};

export const addToBalance = async (userId: string, amount: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentBalance = await getUserBalance(userId);
    const newBalance = currentBalance + amount;
    return await updateUserBalance(userId, newBalance);
  } catch (error: any) {
    console.error("Error adding to balance:", error);
    return { success: false, error: error.message };
  }
};
