const { useEffect, useState } = require("react");
import { useAuthContext } from "@/components/AuthContextProvider";
import { supabase } from "@/components/SupabaseClient";
import debug from 'debug';
const logger = debug('broadcaster:useProjectInfoForAdminPage');

export const useProjectInfoForAdminPage = () => {
  const {user, userRole} = useAuthContext();
  const [projectInfo, setProjectInfo] = useState([]);
  const [dataIsStale, setDataIsStale] = useState(true);

  useEffect(() => {
    // get initial info
    async function getInitialInfo() {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .contains('collaborator_ids', [ user?.id ]);

      if (error) {
        console.error("Error getting performances info:", error);
      } else {
        logger("Got initial performances info:", data);

        setProjectInfo(data);
        setDataIsStale(false);
      }
    }
    getInitialInfo();
  }, [dataIsStale, user?.id]);

  return {
    projectInfo,
    setDataIsStale
  };
};
