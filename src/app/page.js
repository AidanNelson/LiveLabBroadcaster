"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const enterStage = () => {
    router.push("/stage/downtown-variety")
  }

  return (
    <>
      <button onClick={enterStage}>
        Enter
      </button>
    </>
  );
}
