"use client";
import styles from "./Editor.module.css";
import { useEffect, useState, useRef, useContext, useCallback } from "react";

import { ScriptEditor } from "./ScriptEditor";
import { createDefaultScriptableObject } from "../../../shared/defaultDBEntries";
import { deleteFeature, updateFeature } from "../db";
import { StageContext } from "../StageContext";
// import { Sortable } from "./Sortable";
// import {verticalListSortingStrategy} from "@dnd-kit/sortable"
import { StageView } from "../../app/stage/[stageId]/page";
import { useResize } from "../../hooks/useResize";
import { ToggleSwitch } from "../ToggleSwitch/ToggleSwitch";

const InteractableListItem = ({ setEditorStatus, feature, index, stageInfo }) => {
  return (
    <div
      key={index}
      className={styles.listItem}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "5px",
      }}
    >
      <div style={{ flexGrow: 1 }}>
        {feature.name ? feature.name : feature.id}
      </div>
      <div style={{ width: "50px" }}>
        {/* <button
          onClick={() => {
            setShowEditPane(true);
          }}
        >
          Show
        </button> */}
        <button
          onClick={() => {
            console.log("edit");
            setEditorStatus({
              panel: "scriptEditor",
              target: index,
            });
          }}
        >
          Edit
        </button>
        <button
          onClick={() => {
            console.log("delete");
            deleteFeature(stageInfo.stageId, feature);
          }}
        >
          Delete
        </button>
      </div>
      <ToggleSwitch
        isChecked={feature.active}
        setIsChecked={() => {
          updateFeature(stageInfo.stageId, {
            ...feature,
            active: !feature.active,
          });
        }}
      />
    </div>
  );
};
export const Editor = ({ stageInfo }) => {
  const { width: panelWidth, enableResize: enableWidthResize } = useResize({
    initialWidth: 400,
    minWidth: 200,
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [editorStatus, setEditorStatus] = useState({
    target: null,
    panel: "menu",
  });

  // const stageInfo = useContext(StageContext);

  useEffect(() => {
    console.log("stageInfo  in Editor Component: ", stageInfo);
  }, [stageInfo]);

  const addScriptableObject = async () => {
    const updatedStageDoc = stageInfo;
    updatedStageDoc.features.push(createDefaultScriptableObject());
    console.log("Sending updated stage info: ", updatedStageDoc);
    const res = await fetch(`/api/stage/${stageInfo.stageId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedStageDoc }),
    });
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100vw",
          height: "100vh",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "50px",
            position: "relative",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0px 20px",
          }}
        >
          <button onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? "Edit" : "Close"}
          </button>
          <div>Venue - {stageInfo.name}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexGrow: "1",
          }}
        >
          {!isCollapsed && (
            <div
              style={{
                width: panelWidth,
                height: "100%",
                position: "relative",
              }}
            >
              {editorStatus.panel === "menu" && (
                <div
                  style={{
                    flexGrow: "1",
                    display: "flex",
                    flexDirection: "column",
                    padding: "1em",
                  }}
                >
                  <h2>Interactables</h2>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {stageInfo.features.map((feature, index) => {
                      if (feature.type === "scriptableObject") {
                        return (
                          <InteractableListItem
                            feature={feature}
                            setEditorStatus={setEditorStatus}
                            index={index}
                            stageInfo={stageInfo}
                          />
                        );
                      }
                    })}
                  </div>
                  <button onClick={addScriptableObject}>
                    Add Interactable
                  </button>
                </div>
              )}
              {editorStatus.panel === "scriptEditor" && (
                <ScriptEditor
                  scriptableObjectData={stageInfo.features[editorStatus.target]}
                  setEditorStatus={setEditorStatus}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  width: "12px",
                  top: "0",
                  right: "-1px",
                  bottom: "0",
                  cursor: "col-resize",
                }}
                onMouseDown={enableWidthResize}
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexGrow: "1",
              position: "relative",
            }}
          >
            <StageView stageInfo={stageInfo} />
          </div>
        </div>
      </div>
    </>
  );
};
