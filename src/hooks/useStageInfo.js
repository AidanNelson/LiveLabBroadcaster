const { useEffect, useState, useCallback } = require("react");
import { supabase } from "@/components/SupabaseClient";
import { debounce } from "lodash";
import debug from 'debug';
const logger = debug('broadcaster:useStageInfo');

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
      logger("Requesting initial stage info for slug:", slug);
      const { data, error } = await supabase
        .from("stages")
        .select()
        .eq("url_slug", slug); // Correct

      if (error) {
        console.error("Error getting stage info:", error);
      } else {
        logger("Got initial stage info:", data[0]);
        setStageInfo(data[0]);
      }
    }
    getInitialInfo();

    // Listen for updates
    const handleRecordUpdated = (data) => {
      logger("Got updated stage info:", data);
      setStageInfo(data.new);
    };
    const channel = supabase
      .channel("realtime-stage-info")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stages",
          filter: `url_slug=eq.${slug}`,
        },
        handleRecordUpdated,
      )
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
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "stages",
          filter: `url_slug=eq.${slug}`,
        },
        handleRecordUpdated,
      )
      .subscribe();

    // Cleanup function to unsubscribe from the channel
    return () => {
      channel.unsubscribe();
    };
  }, [slug]);

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
        const sortedFeatures = data.sort((a, b) => a.order - b.order);
        setLocalFeatures(sortedFeatures);
      }
    }
    getInitialInfo();

    // Listen for updates
    const handleRecordUpdated = (payload) => {
      logger("Got updated features info:", payload);
      //   setLocalFeatures(data.new);
      setLocalFeatures((prevFeatures) => {
        switch (payload.eventType) {
          case "INSERT":
            if (
              !prevFeatures.some((feature) => feature.id === payload.new.id)
            ) {
              return [...prevFeatures, payload.new]; // Add new feature if not already present
            }
            return prevFeatures;
          case "UPDATE":
            logger("Updating feature:", payload.new);
            return prevFeatures.map((feature) =>
              feature.id === payload.new.id ? {...feature, ...payload.new} : feature,
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
    const channel = supabase
      .channel("realtime-features")
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

    return () => {
      channel.unsubscribe();
    };
  }, [stageInfo]);

  const debouncedUpdateFeature = useCallback(
    debounce(async (featureId, updates, previousFeatures) => {
      const { error } = await supabase
        .from("features")
        .update(updates)
        .eq("id", featureId);

      if (error) {
        console.error("Error updating feature:", error);
        setLocalFeatures(previousFeatures); // Revert to previous state on error
      }
    }, 500),
    [],
  );

  const updateFeature = (featureId, updates) => {
    const previousFeatures = [...localFeatures];
    setLocalFeatures((features) =>
      features.map((feature) =>
        feature.id === featureId ? { ...feature, ...updates } : feature,
      ),
    );

    debouncedUpdateFeature(featureId, updates, previousFeatures);
  };

  const debouncedUpdateFeatureOrder = useCallback(
    debounce(async (newOrder) => {
      const updates = newOrder.map((feature, index) => ({
        id: feature.id,
        order: index,
      }));

      // I think this probably should be a bulk update (upsert?) but I couldn't
      // get it to work with row level security
      updates.forEach(async (update) => {
        const { error } = await supabase
          .from("features")
          .update(update)
          .eq("id", update.id);

        if (error) {
          console.error("Error updating feature order:", error);
        }
      });
    }, 500),
    [],
  );

  // Function to update the order of features
  const updateFeatureOrder = (newOrder) => {
    setLocalFeatures(newOrder); // Update the local state with the new order
    debouncedUpdateFeatureOrder(newOrder); // Update the order in the database
  };

  const debouncedDeleteFeature = useCallback(
    debounce(async (featureId, previousFeatures) => {
      const { error } = await supabase
        .from("features")
        .delete()
        .eq("id", featureId);

      if (error) {
        console.error("Error deleting feature:", error);
        setLocalFeatures(previousFeatures); // Revert to previous state on error
      }
    }, 50),
    [],
  );

  const deleteFeature = (featureId) => {
    const previousFeatures = [...localFeatures];
    setLocalFeatures((features) =>
      features.filter((feature) => feature.id !== featureId),
    );

    debouncedDeleteFeature(featureId, previousFeatures);
  };

  const addFeature = async (newFeature) => {
    const { data, error } = await supabase
      .from("features")
      .insert([newFeature]);

    if (error) {
      console.error("Error adding feature:", error);
    }
  };

  return {
    stageInfo,
    features: localFeatures,
    addFeature,
    updateFeature,
    deleteFeature,
    updateFeatureOrder,
  };
};
