const { useEffect, useState, useCallback } = require("react");
import { supabase } from "@/components/SupabaseClient";

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
        console.log("Got initial performances info:", data);

        setPerformancesInfo(data);
      }
    }
    getInitialInfo();
  }, []);

  return {
    performancesInfo,
  };
};
