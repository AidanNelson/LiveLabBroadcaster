const { useEffect, useState, useCallback } = require("react");
import { supabase } from "@/components/SupabaseClient";
import { debounce } from "lodash";

export const usePerformanceInfo = () => {
  const [performancesInfo, setPerformancesInfo] = useState([]);
//   const [localFeatures, setLocalFeatures] = useState([]);

  useEffect(() => {
    // get initial info
    async function getInitialInfo() {
      const { data, error } = await supabase
        .from("performances")
        .select("*")

      if (error) {
        console.error("Error getting performances info:", error);
      } else {
        console.log("Got initial performances info:", data);
        
        // add URL slugs from stages table:
        const updatedPerformances = await Promise.all(
          data.map(async (performance) => {
            const { data: stageData, error } = await supabase
              .from("stages")
              .select()
              .eq("id", performance.stage_id);

            if (error) {
              console.error("Error getting stage info:", error);
              return performance;
            } else {
              console.log("Got initial stage info:", stageData[0]);
              return { ...performance, slug: stageData[0].url_slug };
            }
          })
        );
        setPerformancesInfo(updatedPerformances);
      }
    }
    getInitialInfo();

    // // Listen for updates
    // const handleRecordUpdated = (data) => {
    //   console.log("Got updated stage info:", data);
    //   setPerformanceInfo(data.new);
    // };
    // supabase
    //   .channel("supabase_realtime")
    //   .on(
    //     "postgres_changes",
    //     {
    //       event: "UPDATE",
    //       schema: "public",
    //       table: "stages",
    //       filter: `url_slug=eq.${slug}`,
    //     },
    //     handleRecordUpdated,
    //   )
    //   .subscribe();
  }, []);

//   useEffect(() => {
//     if (!performanceInfo) return;
//     // get initial info
//     async function getInitialInfo() {
//       const { data, error } = await supabase
//         .from("features")
//         .select("*")
//         .eq("stage_id", performanceInfo.id);

//       if (error) {
//         console.error("Error getting features:", error);
//       } else {
//         setLocalFeatures(data);
//       }
//     }
//     getInitialInfo();

//     // Listen for updates
//     const handleRecordUpdated = (payload) => {
//       console.log("Got updated features info:", payload);
//       //   setLocalFeatures(data.new);
//       setLocalFeatures((prevFeatures) => {
//         switch (payload.eventType) {
//           case "INSERT":
//             if (
//               !prevFeatures.some((feature) => feature.id === payload.new.id)
//             ) {
//               return [...prevFeatures, payload.new]; // Add new feature if not already present
//             }
//             return prevFeatures;
//           case "UPDATE":
//             return prevFeatures.map((feature) =>
//               feature.id === payload.new.id ? payload.new : feature,
//             ); // Update feature
//           case "DELETE":
//             return prevFeatures.filter(
//               (feature) => feature.id !== payload.old.id,
//             ); // Remove deleted feature
//           default:
//             return prevFeatures;
//         }
//       });
//     };
//     supabase
//       .channel("supabase_realtime")
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "features",
//           filter: `stage_id=eq.${performanceInfo.id}`,
//         },
//         handleRecordUpdated,
//       )
//       .on(
//         "postgres_changes",
//         {
//           event: "UPDATE",
//           schema: "public",
//           table: "features",
//           filter: `stage_id=eq.${performanceInfo.id}`,
//         },
//         handleRecordUpdated,
//       )
//       .on(
//         "postgres_changes",
//         {
//           event: "DELETE",
//           schema: "public",
//           table: "features",
//           filter: `stage_id=eq.${performanceInfo.id}`,
//         },
//         handleRecordUpdated,
//       )
//       .subscribe();
//   }, [performanceInfo]);

//   const debouncedUpdateFeature = useCallback(
//     debounce(async (featureId, updates, previousFeatures) => {
//       const { error } = await supabase
//         .from("features")
//         .update(updates)
//         .eq("id", featureId);

//       if (error) {
//         console.error("Error updating feature:", error);
//         setLocalFeatures(previousFeatures); // Revert to previous state on error
//       }
//     }, 500),
//     [],
//   );

//   const updateFeature = (featureId, updates) => {
//     const previousFeatures = [...localFeatures];
//     setLocalFeatures((features) =>
//       features.map((feature) =>
//         feature.id === featureId ? { ...feature, ...updates } : feature,
//       ),
//     );

//     debouncedUpdateFeature(featureId, updates, previousFeatures);
//   };

//   const debouncedDeleteFeature = useCallback(
//     debounce(async (featureId, previousFeatures) => {
//       const { error } = await supabase
//         .from("features")
//         .delete()
//         .eq("id", featureId);

//       if (error) {
//         console.error("Error deleting feature:", error);
//         setLocalFeatures(previousFeatures); // Revert to previous state on error
//       }
//     }, 50),
//     [],
//   );

//   const deleteFeature = (featureId) => {
//     const previousFeatures = [...localFeatures];
//     setLocalFeatures((features) =>
//       features.filter((feature) => feature.id !== featureId),
//     );

//     debouncedDeleteFeature(featureId, previousFeatures);
//   };

//   const addFeature = async (newFeature) => {
//     const { data, error } = await supabase
//       .from("features")
//       .insert([newFeature]);

//     if (error) {
//       console.error("Error adding feature:", error);
//     }
//   };

  return {
    performancesInfo,
  };
};
