"use client";

import { useState } from "react";
import { MainStage, MainStageControls } from "@/components/Stage";
import { Button } from "@/components/Button";

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
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!hasInteracted && (
          <Button variant="primary" onClick={() => setHasInteracted(true)}>
            Enter Stage
          </Button>
        )}
        {hasInteracted && <AudienceView />}
      </div>
    </>
  );
}
