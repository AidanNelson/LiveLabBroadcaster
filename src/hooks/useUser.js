"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { supabase } from "@/components/SupabaseClient";

// const fetcher = (url) =>
//   fetch(url, { credentials: "include" })
//     .then((res) => res.json())
//     .then((data) => {
//       return { user: data.user };
//     });

export const useUser = ({ redirectTo= false, redirectIfFound=false } = {}) => {
  const url =
    process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost:3030";

  const [user, setUser] = useState(null);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session)

      if (event === 'INITIAL_SESSION') {
        // handle initial session
        if (!session.user.is_anonymous) {
          setUser(session.user);
          setHasUser(true);
        }
      } else if (event === 'SIGNED_IN') {
        // handle sign in event
        if (!session.user.is_anonymous) {
          setUser(session.user);
          setHasUser(true);
        }
      } else if (event === 'SIGNED_OUT') {
        // handle sign out event
      } else if (event === 'PASSWORD_RECOVERY') {
        // handle password recovery event
      } else if (event === 'TOKEN_REFRESHED') {
        // handle token refreshed event
      } else if (event === 'USER_UPDATED') {
        // handle user updated event
      }
    })

    return () => {
      // call unsubscribe to remove the callback
      data.subscription.unsubscribe()
    }
  }, []);

  // let data,error,isLoading;

  // const { data, error, isLoading } = useSWR(url + "/auth/status", fetcher);
  // const user = data?.user;
  // const finished = Boolean(data);
  // const hasUser = Boolean(user);
  const router = useRouter();

  useEffect(() => {
    if (!redirectTo) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser)
    ) {
      router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, hasUser, user]);

  return user;
};
