const { useEffect, useState, useCallback } = require("react");
import { supabase } from "@/components/SupabaseClient";

export const usePerformanceInfo = () => {
  const [performancesInfo, setPerformancesInfo] = useState([]);
  //   const [localFeatures, setLocalFeatures] = useState([]);

  useEffect(() => {
    // get initial info
    async function getInitialInfo() {
      const { data, error } = await supabase.from("performances").select("*");

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
              return {
                ...performance,
                slug: stageData[0].url_slug,
                credits: stageData[0].credits,
                showState: stageData[0].show_state,
                startTime: stageData[0].start_time,
                datetimeInfo: stageData[0].datetime_info,
              };
            }
          }),
        );
        setPerformancesInfo(updatedPerformances);
      }
    }
    getInitialInfo();
  }, []);

  return {
    performancesInfo,
  };
};
