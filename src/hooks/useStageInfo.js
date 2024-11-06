const { useEffect, useState } = require("react");
import { supabase } from "@/components/SupabaseClient";
// import isEqual from "lodash/isEqual";



export const useStageInfo = ({ slug }) => {
    const [stageInfo, setStageInfo] = useState(null)
    const [localFeatures, setLocalFeatures] = useState([]);

    useEffect(() => {
        if (!stageInfo) return;
        setLocalFeatures(stageInfo.features);
        // const incomingFeatures = stageInfo.features;
        // if (isEqual(incomingFeatures, localFeatures)) {
        //     console.log('no changes found between ',incomingFeatures,'and',localFeatures);
        // } else {
        //     // Shallow update of only changed features
        //     const updatedFeatures = incomingFeatures.map((newFeature) => {
        //         const existingFeature = localFeatures.find((f) => f.id === newFeature.id);
        //         return existingFeature && isEqual(existingFeature, newFeature)
        //             ? existingFeature
        //             : newFeature;
        //     });
        //     setLocalFeatures(updatedFeatures);
        // }
    }, [stageInfo, localFeatures]);

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
                console.log("Got initial stage info:", data[0]);
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

    return { stageInfo, features: localFeatures };
}