const { useEffect, useState, useCallback } = require("react");
import { useStageContext } from "@/components/StageContext";
import { supabase } from "@/components/SupabaseClient";
import { debounce } from "lodash";

export const useLobbyFeatures = () => {
  const { stageInfo } = useStageContext();
  const [lobbyFeatures, setLobbyFeatures] = useState([]);

  useEffect(() => {
    if (!stageInfo?.id) return;
    // get initial info
    async function getInitialInfo() {
      const { data, error } = await supabase
        .from("lobby_features")
        .select("*")
        .eq("stage_id", stageInfo.id);

      if (error) {
        console.error("Error getting features:", error);
      } else {
        setLobbyFeatures(data);
      }
    }
    getInitialInfo();

    // Listen for updates
    const handleRecordUpdated = (payload) => {
      setLobbyFeatures((prevFeatures) => {
        switch (payload.eventType) {
          case "INSERT":
            if (
              !prevFeatures.some((feature) => feature.id === payload.new.id)
            ) {
              return [...prevFeatures, payload.new]; // Add new feature if not already present
            }
            return prevFeatures;
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
          table: "lobby_features",
          filter: `stage_id=eq.${stageInfo.id}`,
        },
        handleRecordUpdated,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobby_features",
          filter: `stage_id=eq.${stageInfo.id}`,
        },
        handleRecordUpdated,
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "lobby_features",
          filter: `stage_id=eq.${stageInfo.id}`,
        },
        handleRecordUpdated,
      )
      .subscribe();
  }, [stageInfo]);

  const debouncedUpdateFeature = useCallback(
    debounce(async (featureId, updates, previousFeatures) => {
      const { error } = await supabase
        .from("lobby_features")
        .update(updates)
        .eq("id", featureId);

      if (error) {
        console.error("Error updating feature:", error);
        setLobbyFeatures(previousFeatures); // Revert to previous state on error
      }
    }, 500),
    [],
  );

  const updateFeature = (featureId, updates) => {
    const previousFeatures = [...lobbyFeatures];
    setLobbyFeatures((features) =>
      features.map((feature) =>
        feature.id === featureId ? { ...feature, ...updates } : feature,
      ),
    );

    debouncedUpdateFeature(featureId, updates, previousFeatures);
  };

  const debouncedDeleteFeature = useCallback(
    debounce(async (featureId, previousFeatures) => {
      const { error } = await supabase
        .from("lobby_features")
        .delete()
        .eq("id", featureId);

      if (error) {
        console.error("Error deleting feature:", error);
        setLobbyFeatures(previousFeatures); // Revert to previous state on error
      }
    }, 50),
    [],
  );

  const deleteFeature = (featureId) => {
    const previousFeatures = [...lobbyFeatures];
    setLobbyFeatures((features) =>
      features.filter((feature) => feature.id !== featureId),
    );

    debouncedDeleteFeature(featureId, previousFeatures);
  };

  const addFeature = async (newFeature) => {
    const { data, error } = await supabase
      .from("lobby_features")
      .insert([newFeature]);

    if (error) {
      console.error("Error adding feature:", error);
    }
  };

  return {
    lobbyFeatures,
    addFeature,
    updateFeature,
    deleteFeature,
  };
};
