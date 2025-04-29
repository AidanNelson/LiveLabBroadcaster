"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useStageContext } from "@/components/StageContext";

export const RedirectBasedOnShowState = () => {
  const { stageInfo } = useStageContext();
  if (!stageInfo) return null; // Ensure stageInfo is available before proceeding

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!stageInfo) return;

    const currentPage = pathname.split("/")[2]; 

    if (stageInfo.show_state === "lobby" && currentPage === "stage") {
      router.push(`/${stageInfo.url_slug}/lobby`);
    } else if (stageInfo.show_state === "stage" && currentPage === "lobby") {
      router.push(`/${stageInfo.url_slug}/stage`);
    }
  }, [pathname, stageInfo, router, searchParams]);

  return null;
};
