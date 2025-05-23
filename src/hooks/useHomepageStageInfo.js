const { useEffect, useState, useCallback } = require("react");
import { supabase } from "@/components/SupabaseClient";
import debug from "debug";
const logger = debug("broadcaster:useHomepageStageInfo");

export const useHomepageStageInfo = () => {
  const [performancesInfo, setPerformancesInfo] = useState([]);

  useEffect(() => {
    // get initial info
    async function getInitialInfo() {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .eq("visible_on_homepage", true);

      if (error) {
        console.error("Error getting performances info:", error);
      } else {
        logger("Got initial performances info:", data);
        const sorted = data.sort((a, b) => {
          return new Date(a.start_time) - new Date(b.start_time);
        });
        setPerformancesInfo(sorted);
      }
    }
    getInitialInfo();
  }, []);

  return {
    performancesInfo,
  };
};
