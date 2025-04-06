"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import { useRouter } from "next/navigation";

export default function Layout({ children, params }) {
  const router = useRouter();
  const { user } = useAuthContext();

  if (!user) {
    return <div>Loading...</div>;
  }
  if (user.is_anonymous) {
    router.push("/login");
    return null;
  }
  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </>
  );
}
