"use client";
import { useRouter } from "next/navigation";
import { ProductionPoster } from "@/components/ProductionPoster";
import { useStageContext } from "@/components/StageContext";

export default function ProductionLandingPage() {
    const router = useRouter();
    const { stageInfo } = useStageContext();

    return (
        <div
            style={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
            <div style={{ aspectRatio: "16/9", width: "100%" }}>
                {stageInfo && (
                    <ProductionPoster
                        performanceInfo={stageInfo}
                        router={router}
                    />
                )}
            </div>
        </div>
    );
}
