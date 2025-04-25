import * as React from "react";
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { createClient } from "@supabase/supabase-js";

let supabase;

if (!supabase) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

const useUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    // Clean up the subscription when the component unmounts
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
  };
};

const Form = ({ errorMessage, onSubmit }) => {
  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <label>
        <span>Username</span>
        <input type="text" name="username" required />
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password" required />
      </label>

      <div className="submit">
        <button>Login</button>
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>}
    </form>
  );
};

const LoginForm = () => {
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
        console.log("Login successful");
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
        width: "100%",
        textAlign: "start",
        width: "100%",
        borderBottom: "1px solid white",
      }}
    >
      <h4>Log In</h4>
      <Form errorMessage={errorMsg} onSubmit={handleSubmit} />
    </div>
  );
};
const App = () => {
  const { user } = useUser();
  const [oscMessages, setOscMessages] = useState([]);

  useEffect(() => {
    const onMessage = async (message) => {
      console.log("Received message:", message);
      setOscMessages((prevMessages) => [message.address, ...prevMessages]);

      const oscAddressParts = message.address.split("/");
      oscAddressParts.filter((part) => part !== "");

      let featureId = oscAddressParts[0];
      let action = oscAddressParts[1];

      const isActive = action === "on";

      console.log(`Setting feature ${featureId} to ${isActive}`);

      const { data, error } = await supabase
        .from("features")
        .update({ active: isActive })
        .eq("id", featureId);

      if (data) {
        console.log("Feature updated successfully:", data);
      }
      if (error) {
        console.error("Error updating feature:", error);
      }
    };

    window.electronAPI.onOscMessage(onMessage);
  }, []);

  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          margin: "20px 0",
          textAlign: "start",
          width: "100%",
          borderBottom: "1px solid white",
        }}
      >
        <h1>OSC Relay App</h1>
        <details>
          <summary>About / Instructions</summary>
          <p>
            This app listens for OSC messages from your local network on port
            57121 (from e.g. QLab, TouchDesigner, etc.) and relays them to the
            venue server. It is designed to turn features on or off based on
            incoming OSC Messages.
          </p>
          <p>
            Messages should be addressed to localhost:57121 in the following
            format: <br />
            <br />
            <i>/feature_id/on</i> <br />
            <br />
            or <br />
            <br />
            <i>/feature_id/off</i> <br />
            <br />
            to turn a given feature on or off.
          </p>
        </details>
      </div>
      {!user && <LoginForm />}
      {user && (
        <div
          style={{
            textAlign: "start",
            width: "100%",
            borderBottom: "1px solid white",
          }}
        >
          <p>Current User: {user.email}</p>
          <button
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error("Error signing out:", error);
              } else {
                console.log("Signed out successfully");
              }
            }}
          >
            Sign Out
          </button>
        </div>
      )}

      <h2>OSC Messages</h2>
      <div
        style={{
          textAlign: "start",
          width: "100%",
          overflowY: "auto",
        }}
      >
        
        
          {oscMessages.map((msg, index) => (
            
              <p key={index}>{msg}</p>
            
          ))}
        
      </div>
    </div>
  );
};
const root = createRoot(document.body);
root.render(<App />);

console.log(
  "Current CSP:",
  document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content,
);
