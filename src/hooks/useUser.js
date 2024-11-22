"use client";

import { useEffect, useState } from "react";
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

  const [localDisplayName, setLocalDisplayName] = useState("");
  const [existingDisplayName, setExistingDisplayName] = useState("");

  const [localDisplayColor, setLocalDisplayColor] = useState("");
  const [existingDisplayColor, setExistingDisplayColor] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchDisplayData = async () => {
      const { data: existingData, error: existingError } = await supabase
        .from("display_names")
        .select("*")
        .eq("user_id", user.id);

      if (existingError) {
        console.error("Error fetching existing display_name:", existingError);
        return;
      }

      const existingDisplayNameData = existingData && existingData[0];
      if (existingDisplayNameData) {
        setExistingDisplayName(existingDisplayNameData.display_name);
        setLocalDisplayName(existingDisplayNameData.display_name);

        setExistingDisplayColor(existingDisplayNameData.display_color);
        setLocalDisplayColor(existingDisplayNameData.display_color);
      } else {
        console.log('no extisting display name or color found');
      }
    };

    fetchDisplayData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const updateDisplayName = async () => {
      if (localDisplayName !== existingDisplayName) {
        if (existingDisplayName) {
          // Update the display_name if it exists
          const { data, error } = await supabase
            .from("display_names")
            .update({ display_name: localDisplayName })
            .eq("user_id", user.id);

          if (error) {
            console.error("Error updating display_name:", error);
          } else {
            console.log("Display name updated successfully:", data);
            setExistingDisplayName(localDisplayName);
          }
        } else {
          // Insert a new display_name if it doesn't exist
          const { data, error } = await supabase
            .from("display_names")
            .insert({ user_id: user.id, display_name: localDisplayName });

          if (error) {
            console.error("Error inserting display_name:", error);
          } else {
            console.log("Display name inserted successfully:", data);
            setExistingDisplayName(localDisplayName);
          }
        }
      }
    };

    const debounceUpdate = setTimeout(updateDisplayName, 500); // Debounce the update by 500ms

    return () => clearTimeout(debounceUpdate); // Cleanup the timeout on unmount or when localDisplayName changes
  }, [localDisplayName, existingDisplayName, user]);

  useEffect(() => {
    if (!user) return;
    const updateDisplayColor = async () => {
      if (localDisplayColor !== existingDisplayColor) {
        if (existingDisplayColor) {
          // Update the display_name if it exists
          const { data, error } = await supabase
            .from("display_names")
            .update({ display_color: localDisplayColor })
            .eq("user_id", user.id);

          if (error) {
            console.error("Error updating display_color:", error);
          } else {
            console.log("Display name updated successfully:", data);
            setExistingDisplayColor(localDisplayColor);
          }
        } else {
          // Insert a new display_color if it doesn't exist
          const { data, error } = await supabase
            .from("display_names")
            .insert({ user_id: user.id, display_color: localDisplayColor });

          if (error) {
            console.error("Error inserting display_color:", error);
          } else {
            console.log("Display name inserted successfully:", data);
            setExistingDisplayColor(localDisplayColor);
          }
        }
      }
    };

    const debounceUpdate = setTimeout(updateDisplayColor, 500); // Debounce the update by 500ms

    return () => clearTimeout(debounceUpdate); // Cleanup the timeout on unmount or when localDisplayName changes
  }, [localDisplayColor, existingDisplayColor, user]);

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

  // const setDisplayName = async (displayName) => {
  //   setLocalDisplayName(displayName);
  // }

  // useEffect(() => {
  //   if (!user) return;
  //   async function fetchDisplayName() {
  //     // get initial database entry
  //     const { data, error } = await supabase
  //       .from("display_names")
  //       .select("*")
  //       .eq("user_id", user.id);

  //     if (error) {
  //       console.error(error);
  //     } else if (data?.length) {
  //       const existingDisplayNameData = data[0];
  //       setLocalDisplayName(existingDisplayNameData.display_name);
  //     }
  //   }

  //   fetchDisplayName();
  // }, [user]);

  // useEffect(() => {
  //   if (!user || !localDisplayName) return;

  //   const updateDisplayName = async () => {
  //     // get initial database entry
  //     const { data: existingData, error: existingError } = await supabase
  //       .from("display_names")
  //       .select("*")
  //       .eq("user_id", user.id);

  //     const existingDisplayNameData = existingData[0];

  //     if (existingDisplayNameData) {
  //       if (existingDisplayNameData.display_name === localDisplayName) {
  //         // no need to update
  //       } else {
  //         // update existing display name
  //         const { data, error } = await supabase
  //           .from("display_names")
  //           .update({ display_name: localDisplayName })
  //           .eq("id", existingDisplayNameData.id);

  //         if (error) {
  //           console.error("Error updating display name:", error);
  //         } else {
  //           console.log("Display name updated successfully", data);
  //         }
  //       }
  //     } else {
  //       const { data, error } = await supabase
  //         .from("display_names")
  //         .insert({ user_id: user.id, display_name: localDisplayName });

  //       if (error) {
  //         console.error("Error inserting display name:", error);
  //       } else {
  //         console.log("Display name inserted successfully", data);
  //       }
  //     }
  //   };
  //   updateDisplayName();
  // }, [user, localDisplayName]);

  return {
    user,
    displayName: localDisplayName,
    setDisplayName: setLocalDisplayName,
    displayColor: localDisplayColor,
    setDisplayColor: setLocalDisplayColor,
  };
};
