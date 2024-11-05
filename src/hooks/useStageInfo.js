const { useEffect, useState } = require("react");
import { supabase } from "@/components/SupabaseClient";


export const useStageInfo = ({ slug }) => {
    const [stageInfo, setStageInfo] = useState(null)
 
    useEffect(() => {
        if (!slug) return;
        // get initial info
        async function getInitialInfo() {
            const { data, error } = await supabase
                .from('stages')
                .select()
                .eq('url_slug', slug)    // Correct

            if (error) {
                console.error('Error getting stage info:', error);
            } else {
                console.log("Got initial stage info:",data[0]);
                setStageInfo(data[0]);
            }
        }
        getInitialInfo();

        // Listen for updates
        const handleRecordUpdated = (data) => {
            console.log("Got updated stage info:", data);
            setStageInfo(data.new);
        };
        supabase
            .channel('supabase_realtime')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'stages', filter: `url_slug=eq.${slug}` }, handleRecordUpdated)
            .subscribe()

    }, [slug]);

    return stageInfo;
}