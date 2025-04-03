"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Form from "@/components/SignupLoginForm";
import { supabase } from "@/components/SupabaseClient";
import Typography from "@/components/Typography";

const Login = () => {
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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: body.username,
        password: body.password,
      });
      console.log(data);
      if (!error) {
        router.push("/");
      } else {
        throw new Error(error.message);
      }
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
     
        <h1>Log In</h1>
        <Form isLogin errorMessage={errorMsg} onSubmit={handleSubmit} />
      
    </div>
  );
};

export default Login;
