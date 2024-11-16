"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/components/SupabaseClient";

export const useUser = ({ redirectTo = false, redirectIfFound = false } = {}) => {
  const url =
    process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost:3030";

  const [user, setUser] = useState(null);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    // Listen for authentication state changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setHasUser(true);
      } else {
        setUser(null);
        setHasUser(false);
      }
    });

    const checkSessionAndSignInAnonymously = async () => {
      // Check if there is an existing session
      const { data } = await supabase.auth.getSession();

      if (!data.session) {

        // Sign in anonymously if no session exists
        const { data, error } = await supabase.auth.signInAnonymously()

        if (error) {
          console.error('Anonymous sign-in failed:', error.message);
        }
      }
    };

    checkSessionAndSignInAnonymously();

    // Clean up the subscription when the component unmounts
    return () => {
      data.subscription.unsubscribe();
    };

  }, []);

  const router = useRouter();

  useEffect(() => {
    if (!redirectTo) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser && !user.is_anonymous)
    ) {
      router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, hasUser, user]);

  return user;
};
