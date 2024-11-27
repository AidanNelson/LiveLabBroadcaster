const { useEffect, useState, useCallback } = require("react");
import { supabase } from "@/components/SupabaseClient";
import { debounce } from "lodash";

export const useCanvasInfo = ({ canvasId }) => {
  const [canvasFeatures, setCanvasFeatures] = useState([]);

  useEffect(() => {
    if (!canvasId) return;
    // get initial info
    async function getInitialInfo() {
      const { data, error } = await supabase
        .from("canvas_features")
        .select("*")
        .eq("canvas_id", canvasId);

      if (error) {
        console.error("Error getting features:", error);
      } else {
        setCanvasFeatures(data);
      }
    }
    getInitialInfo();

    // Listen for updates
    const handleRecordUpdated = (payload) => {
      console.log("Got updated canvas features info:", payload);
      setCanvasFeatures((prevFeatures) => {
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
          table: "canvas_features",
          filter: `canvas_id=eq.${canvasId}`,
        },
        handleRecordUpdated,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "canvas_features",
          filter: `canvas_id=eq.${canvasId}`,
        },
        handleRecordUpdated,
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "canvas_features",
          filter: `canvas_id=eq.${canvasId}`,
        },
        handleRecordUpdated,
      )
      .subscribe();
  }, [canvasId]);

  const debouncedUpdateFeature = useCallback(
    debounce(async (featureId, updates, previousFeatures) => {
      const { error } = await supabase
        .from("canvas_features")
        .update(updates)
        .eq("id", featureId);

      if (error) {
        console.error("Error updating feature:", error);
        setCanvasFeatures(previousFeatures); // Revert to previous state on error
      }
    }, 500),
    [],
  );

  const updateFeature = (featureId, updates) => {
    const previousFeatures = [...canvasFeatures];
    setCanvasFeatures((features) =>
      features.map((feature) =>
        feature.id === featureId ? { ...feature, ...updates } : feature,
      ),
    );

    debouncedUpdateFeature(featureId, updates, previousFeatures);
  };

  const debouncedDeleteFeature = useCallback(
    debounce(async (featureId, previousFeatures) => {
      const { error } = await supabase
        .from("canvas_features")
        .delete()
        .eq("id", featureId);

      if (error) {
        console.error("Error deleting feature:", error);
        setCanvasFeatures(previousFeatures); // Revert to previous state on error
      }
    }, 50),
    [],
  );

  const deleteFeature = (featureId) => {
    const previousFeatures = [...canvasFeatures];
    setCanvasFeatures((features) =>
      features.filter((feature) => feature.id !== featureId),
    );

    debouncedDeleteFeature(featureId, previousFeatures);
  };

  const addFeature = async (newFeature) => {
    const { data, error } = await supabase
      .from("canvas_features")
      .insert([newFeature]);

    if (error) {
      console.error("Error adding feature:", error);
    }
  };

  return {
    canvasFeatures,
    addFeature,
    updateFeature,
    deleteFeature,
  };
};
