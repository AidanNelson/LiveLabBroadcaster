"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import Form from "../../components/SignupLoginForm";
import { supabase } from "@/components/SupabaseClient";

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
      })
      console.log(data);
      if (!error) {
        router.push("/");
      } else {
        throw new Error(error.message);
      }
      // const url = process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost:3030";
      // const res = await fetch(url + "/auth/login", {
      //   method: "POST",
      //   credentials: 'include',
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(body),
      // });
      // if (res.status === 200) {
      //   router.push("/");
      // } else {
      //   throw new Error(await res.text());
      // }
    } catch (error) {
      console.error("An unexpected error happened occurred:", error);
      setErrorMsg(error.message);
    }
  }

  return (
    <div className="authContainer">
      <div className="authInnerContainer">
        <h1>Log In</h1>
        <Form isLogin errorMessage={errorMsg} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default Login;
