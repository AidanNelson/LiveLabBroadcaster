"use client";
import { useEffect } from "react";
import { StatusBar } from "@/components/StatusBar";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push('/stage/downtown-variety');

  },[]);

  return null;
}
