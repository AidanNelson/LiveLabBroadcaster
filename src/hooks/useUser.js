"use client";
import { useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";

const fetcher = (url) =>
  fetch(url, { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      console.log("user data:", data);
      // const parsedData = JSON.parse(data.user);
      // console.log("parsed data:", parsedData);

      return { user: data.user };
    });

export const useUser = ({ redirectTo, redirectIfFound } = {}) => {
  const url =
    process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost:3030";

  const { data, error, isLoading } = useSWR(url + "/auth/status", fetcher);
  const user = data?.user;
  const finished = Boolean(data);
  const hasUser = Boolean(user);
  const router = useRouter();

  useEffect(() => {
    if (!redirectTo || !finished) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser)
    ) {
      router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, finished, hasUser]);

  return error ? null : user;
};
