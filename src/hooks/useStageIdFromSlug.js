"use client";
import useSWR from "swr";

const fetcher = (url) =>
  fetch(url)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        console.error("Could not find stageId from slug.");
        return;
      }
    })
    .then((data) => {
      return { stageId: data.stageId };
    });

export const useStageIdFromSlug = ({ slug }) => {
  const url =
    process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost:3030";

  const { data, error, isLoading } = useSWR(
    url + `/stage/idFromSlug/${slug}`,
    fetcher,
  );

  return { stageId: error ? null : data?.stageId };
};
