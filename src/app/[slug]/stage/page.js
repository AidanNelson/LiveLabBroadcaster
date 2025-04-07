"use client";

import { useState } from "react";
import { MainStage, MainStageControls } from "@/components/Stage";

export const AudienceView = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <MainStage />
      <MainStageControls />
    </div>
  );
};

export default function Stage() {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100vw",
          height: "100vh",
        }}
      >
        {!hasInteracted && (
          <div
            style={{
              width: "100%",
              alignSelf: "center",
              textAlign: "center",
            }}
          >
            <button onClick={() => setHasInteracted(true)}>
              <h3>Enter Show</h3>
            </button>
          </div>
        )}
        {hasInteracted && <AudienceView />}
      </div>
    </>
  );
}
