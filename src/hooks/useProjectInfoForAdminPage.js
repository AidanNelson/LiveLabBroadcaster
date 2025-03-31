const { useEffect, useState } = require("react");
import { supabase } from "@/components/SupabaseClient";

export const useProjectInfoForAdminPage = () => {
  const [projectInfo, setProjectInfo] = useState([]);

  useEffect(() => {
    // get initial info
    async function getInitialInfo() {
      const { data, error } = await supabase
        .from("stages")
        .select("*")

      if (error) {
        console.error("Error getting performances info:", error);
      } else {
        console.log("Got initial performances info:", data);

        setProjectInfo(data);
      }
    }
    getInitialInfo();
  }, []);

  return {
    projectInfo,
  };
};
