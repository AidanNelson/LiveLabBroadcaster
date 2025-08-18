import { ScriptEditor } from "@/components/Editor/ScriptEditor/index.js";

// import { FileInner, FileModal } from "./Files";
import { useStageContext } from "../StageContext";
import { useEditorContext } from "./EditorContext";
import { AudienceView } from "@/app/[slug]/stage/page";

import { Button } from "@/components/Button";
import { FeaturesList } from "@/components/Editor/FeaturesList";
import { FlexPanel } from "./FlexPanel";
import { ThreePanelLayout } from "../ThreePanelLayout";

const FeaturesListAndControls = () => {
  return (
    <>
      <div>
        <FeaturesList />
      </div>
    </>
  );
};

export const EditorSidePanel = () => {
  const { editorStatus } = useEditorContext();

  return (
    <>
      {editorStatus.target == null && <FeaturesListAndControls />}
      {editorStatus.target !== null && <FeatureEditors />}
    </>
  );
};

const FeatureEditors = () => {
  const { features } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
        }}
      >
        <div>
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              setEditorStatus({
                ...editorStatus,
                sidePanelOpen: false,
                target: null,
                currentEditor: null,
              });
            }}
          >
            &larr; Back
          </Button>
        </div>

        {editorStatus.currentEditor === "scriptEditor" && (
          <>
            <div style={{ height: "80%" }}>
              <ScriptEditor
                scriptableObjectData={features.find(
                  (feature) => feature.id === editorStatus.target,
                )}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export const StageEditor = () => {
  return (
    <ThreePanelLayout
      left={<EditorSidePanel />}
      rightTop={<AudienceView />}
      rightBottom={<FlexPanel />}
    />
  );
};
