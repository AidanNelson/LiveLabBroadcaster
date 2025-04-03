const { useEffect, useState } = require("react");
import { useAuthContext } from "@/components/AuthContextProvider";
import { supabase } from "@/components/SupabaseClient";

export const useProjectInfoForAdminPage = () => {
  const {user, userRole} = useAuthContext();
  const [projectInfo, setProjectInfo] = useState([]);

  useEffect(() => {
    // get initial info
    console.log('userid:', user?.id);
    async function getInitialInfo() {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .contains('collaborator_ids', [ user?.id ]);

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
