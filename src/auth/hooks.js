"use client";


import { useEffect } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation';

const fetcher = (url) =>
  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      const parsedData = JSON.parse(data.user);
      console.log('fetcher data:',parsedData);
      return { user: data?.user? parsedData : null }
    })

export const useUser = ({ redirectTo, redirectIfFound } = {}) => {
  const { data, error } = useSWR('/api/auth/user', fetcher)
  const user = data?.user
  const finished = Boolean(data)
  const hasUser = Boolean(user)
  const router = useRouter();


  useEffect(() => {
    console.log("user:",user);
  },[user])

  useEffect(() => {
    if (!redirectTo || !finished) return
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser)
    ) {
      router.push(redirectTo)
    }
  }, [redirectTo, redirectIfFound, finished, hasUser])

  return error ? null : user
}
