const { useEffect, useState } = require("react");
import { supabase } from "@/components/SupabaseClient";

export const useStageInfo = ({ slug }) => {
  const [stageInfo, setStageInfo] = useState(null);
  const [localFeatures, setLocalFeatures] = useState([]);

  useEffect(() => {
    if (!stageInfo) return;
  }, [stageInfo, localFeatures]);

  useEffect(() => {
    if (!slug) return;
    // get initial info
    async function getInitialInfo() {
      const { data, error } = await supabase
        .from("stages")
        .select()
        .eq("url_slug", slug); // Correct

      if (error) {
        console.error("Error getting stage info:", error);
      } else {
        console.log("Got initial stage info:", data[0]);
        setStageInfo(data[0]);
      }
    }
    getInitialInfo();

    // Listen for updates
    const handleRecordUpdated = (data) => {
      console.log("Got updated stage info:", data);
      setStageInfo(data.new);
    };
    supabase
      .channel("supabase_realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "stages",
          filter: `url_slug=eq.${slug}`,
        },
        handleRecordUpdated,
      )
      .subscribe();
  }, [slug]);

  useEffect(() => {
    console.log("localFeatures:", localFeatures);
  }, [localFeatures]);

  useEffect(() => {
    if (!stageInfo) return;
    // get initial info
    async function getInitialInfo() {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .eq("stage_id", stageInfo.id);

      if (error) {
        console.error("Error getting features:", error);
      } else {
        console.log("Got features:", data);
        setLocalFeatures(data);
      }
    }
    getInitialInfo();

    // Listen for updates
    const handleRecordUpdated = (payload) => {
      console.log("Got updated features info:", payload);
      //   setLocalFeatures(data.new);
      setLocalFeatures((prevFeatures) => {
        switch (payload.eventType) {
          case "INSERT":
            return [...prevFeatures, payload.new]; // Add new feature
          case "UPDATE":
            return prevFeatures.map((feature) =>
              feature.id === payload.new.id ? payload.new : feature,
            ); // Update feature
          case "DELETE":
            return prevFeatures.filter(
              (feature) => feature.id !== payload.old.id,
            ); // Remove deleted feature
          default:
            return prevFeatures;
        }
      });
    };
    supabase
      .channel("supabase_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "features",
          filter: `stage_id=eq.${stageInfo.id}`,
        },
        handleRecordUpdated,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "features",
          filter: `stage_id=eq.${stageInfo.id}`,
        },
        handleRecordUpdated,
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "features",
          filter: `stage_id=eq.${stageInfo.id}`,
        },
        handleRecordUpdated,
      )
      .subscribe();
  }, [stageInfo]);

  return { stageInfo, features: localFeatures };
};
