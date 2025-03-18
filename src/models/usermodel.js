import {supabaseAdmin} from "../Supabase/supabase";

export const getUserById = async (userId) => {
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
};

export const createUser = async (userId, phone) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    id: userId,
    user_metadata: { phone },
  });

  if (error) throw error;
  return data;
};

export const createSession = async (userId) => {
  const { data, error } = await supabaseAdmin.auth.admin.generateSession({ user_id: userId });
  if (error) throw error;
  return data;
};
