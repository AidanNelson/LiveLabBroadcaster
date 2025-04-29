"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import Form from "../../components/SignupLoginForm";
import { supabase } from "@/components/SupabaseClient";
import Typography from "@/components/Typography";

const Signup = () => {
  const router = useRouter();
  useUser({ redirectTo: "/", redirectIfFound: true });

  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (errorMsg) setErrorMsg("");

    const body = {
      username: e.currentTarget.username.value,
      password: e.currentTarget.password.value,
    };

    if (body.password !== e.currentTarget.rpassword.value) {
      setErrorMsg(`The passwords don't match`);
      return;
    }

    try {
      let { data, error } = await supabase.auth.signUp({
        email: body.username,
        password: body.password,
      });
      if (!error) {
        router.push("/login");
      } else {
        throw new Error(error.message);
      }
      // const url = process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost:3030";

      // const res = await fetch(url + "/auth/signup", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(body),
      // });
      // if (res.status === 200) {
      //   router.push("/login");
      // } else {
      //   throw new Error(await res.text());
      // }
    } catch (error) {
      console.error("An unexpected error happened occurred:", error);
      setErrorMsg(error.message);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          marginBottom: "2rem",
        }}
      >
        <Typography variant="subhero">This is</Typography>
        <Typography variant="hero">CultureHub Broadcaster</Typography>
      </div>
      <h1>Sign Up</h1>
      <Form isLogin={false} errorMessage={errorMsg} onSubmit={handleSubmit} />
    </div>
  );
};

export default Signup;
