"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/components/SupabaseClient";

export const useUser = ({
  redirectTo = false,
  redirectIfFound = false,
} = {}) => {
  const url =
    process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost:3030";

  const [user, setUser] = useState(null);
  const [hasUser, setHasUser] = useState(false);

  const [userRole, setUserRole] = useState("anonymous");

  const [localDisplayName, setLocalDisplayName] = useState("");
  const [serverDisplayName, setServerDisplayName] = useState("");

  const [localDisplayColor, setLocalDisplayColor] = useState("#cdcdcd"); // initialize color
  const [serverDisplayColor, setServerDisplayColor] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchDisplayData = async () => {
      const { data, error } = await supabase
        .from("display_names")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching existing display_name:", error);
        return;
      }

      if (data[0]) {
        setServerDisplayName(data[0].display_name);
        setLocalDisplayName(data[0].display_name);

        setServerDisplayColor(data[0].display_color);
        setLocalDisplayColor(data[0].display_color);
      } else {
        console.log("no extisting display name or color found");
        // Insert a new display_name if it doesn't exist
        const { data, error } = await supabase.from("display_names").insert({
          user_id: user.id,
          display_name: localDisplayName,
          display_color: localDisplayColor,
        });

        if (error) {
          console.error("Error inserting initial display data:", error);
        } else {
          console.log("Display data inserted successfully:", data);
          setServerDisplayName(localDisplayName);
          setServerDisplayColor(localDisplayColor);
        }
      }
    };

    fetchDisplayData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const updateDisplayName = async () => {
      if (localDisplayName !== serverDisplayName) {
        // Update the display_name if it exists
        console.log("attempting to update display name", {
          localDisplayName,
          serverDisplayName,
        });

        const { data, error } = await supabase
          .from("display_names")
          .update({ display_name: localDisplayName })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating display_name:", error);
        } else {
          console.log("Display name updated successfully:", data);
          setServerDisplayName(localDisplayName);
        }
      }
    };

    const debounceUpdate = setTimeout(updateDisplayName, 500); // Debounce the update by 500ms

    return () => clearTimeout(debounceUpdate); // Cleanup the timeout on unmount or when localDisplayName changes
  }, [localDisplayName, serverDisplayName, user]);

  useEffect(() => {
    if (!user) return;
    const updateDisplayColor = async () => {
      if (localDisplayColor !== serverDisplayColor) {
        if (serverDisplayColor) {
          // Update the display_name if it exists
          const { data, error } = await supabase
            .from("display_names")
            .update({ display_color: localDisplayColor })
            .eq("user_id", user.id);

          if (error) {
            console.error("Error updating display_color:", error);
          } else {
            console.log("Display name updated successfully:", data);
            setServerDisplayColor(localDisplayColor);
          }
        }
        // else {
        //   // Insert a new display_color if it doesn't exist
        //   const { data, error } = await supabase
        //     .from("display_names")
        //     .insert({ user_id: user.id, display_color: localDisplayColor });

        //   if (error) {
        //     console.error("Error inserting display_color:", error);
        //   } else {
        //     console.log("Display name inserted successfully:", data);
        //     setServerDisplayColor(localDisplayColor);
        //   }
        // }
      }
    };

    const debounceUpdate = setTimeout(updateDisplayColor, 500); // Debounce the update by 500ms

    return () => clearTimeout(debounceUpdate); // Cleanup the timeout on unmount or when localDisplayName changes
  }, [localDisplayColor, serverDisplayColor, user]);

  useEffect(() => {
    if (!user) return;
    const fetchUserRole = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching existing display_name:", error);
        return;
      }

      if (data[0]) {
        console.log("Fetched user role:", data[0].role);
        setUserRole(data[0].role);
      } else {
        console.log("No extisting user role found");
      }
    };

    fetchUserRole();
  }, [user]);

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
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          console.error("Anonymous sign-in failed:", error.message);
        }
      }
    };

    checkSessionAndSignInAnonymously();

    // Clean up the subscription when the component unmounts
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      console.log("Signed out successfully");
      setUser(null);
      setHasUser(false);
    }
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

  return {
    user,
    userRole,
    displayName: localDisplayName,
    setDisplayName: setLocalDisplayName,
    displayColor: localDisplayColor,
    setDisplayColor: setLocalDisplayColor,
    logout,
  };
};
