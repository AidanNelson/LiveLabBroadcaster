"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useStageContext } from "@/components/StageContext";
import { LOBBY_ENABLED } from "@/config";

export const RedirectBasedOnShowState = () => {
  const { stageInfo } = useStageContext();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("redirect") === "false") return;
    if (!stageInfo) return;

    const currentPage = pathname.split("/")[2];

    if (!LOBBY_ENABLED) {
      if (currentPage === "lobby") {
        router.replace(`/${stageInfo.url_slug}/stage`);
      }
      return;
    }

    if (stageInfo.show_state === "lobby" && currentPage === "stage") {
      router.push(`/${stageInfo.url_slug}/lobby`);
    } else if (stageInfo.show_state === "stage" && currentPage === "lobby") {
      router.push(`/${stageInfo.url_slug}/stage`);
    }
  }, [pathname, stageInfo, router, searchParams]);

  return null;
};
