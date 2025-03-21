import { Box } from "@mui/material";

import { useEffect, useState, useRef, useCallback } from "react";

import { ScriptEditor } from "./ScriptEditor";
import {
  createDefaultScriptableObject,
  createDefaultCanvasObject,
} from "../../../shared/defaultDBEntries";

import { supabase } from "../SupabaseClient";
import { FileInner, FileModal } from "./Files";
import { useStageContext } from "../StageContext";
import { useEditorContext } from "./EditorContext";
import { ToggleSwitch } from "../ToggleSwitch";
import { ResizableBox } from "react-resizable";
import { ResizablePanel } from "@/components/ResizablePanel";
import { AudienceView } from "@/app/[slug]/stage/page";
import { editor } from "monaco-editor";
import Typography from "../Typography";

import { MdEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import styles from "./Editor.module.scss";

import { Tree } from "antd";
import { Popconfirm } from "antd";

// const addScriptableObject = async ({ stageInfo }) => {
// const scriptableObject = createDefaultScriptableObject();
// scriptableObject.stage_id = stageInfo.id;

//   const { data, error } = await supabase
//     .from('stages')
//     .update({ features: updatedFeaturesArray })
//     .eq('id', stageInfo.id)
//     .select()

//   if (error) {
//     console.error("Error adding scriptable object:", error);
//   } else {
//     console.log("Success. Added scriptable object: ", data);
//   }
// };

// const addCanvasObject = async ({ stageInfo }) => {

//   const updatedFeaturesArray = structuredClone(stageInfo.features);
//   updatedFeaturesArray.push(createDefaultCanvasObject());

//   const { data, error } = await supabase
//     .from('stages')
//     .update({ features: updatedFeaturesArray })
//     .eq('id', stageInfo.id)
//     .select()

//   if (error) {
//     console.error("Error adding scriptable object:", error);
//   } else {
//     console.log("Success. Added scriptable object: ", data);
//   }
// }

const SortableFeatureItem = (feature) => {
  return <div>{feature.name ? feature.name : feature.id} - ABC</div>;
};

const FeaturesList = () => {
  const { stageInfo, features, updateFeature, deleteFeature } =
    useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();

  const alertToDelete = useCallback(() => {});
  // const [featuresForTree, setFeaturesForTree] = useState([]);

  // useEffect(() => {
  //   const newFeaturesForTree = features.map((feature) => {
  //     return {
  //       title: (<SortableFeatureItem info={feature} />),
  //       key: feature.id,
  //       children: [], // every node is a root tree node
  //     };
  //   });
  //   setFeaturesForTree(newFeaturesForTree);
  // },[features])

  // // const [gData, setGData] = useState(defaultData);
  // // const [expandedKeys] = useState(['0-0', '0-0-0', '0-0-0-0']);

  // const onDragEnter = (info) => {
  //   console.log(info);
  //   // expandedKeys, set it when controlled is needed
  //   // setExpandedKeys(info.expandedKeys)
  // };

  // const onDrop = (info) => {
  //   console.log(info);
  //   const dropKey = info.node.key;
  //   const dragKey = info.dragNode.key;
  //   const dropPos = info.node.pos.split('-');
  //   const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]); // the drop position relative to the drop node, inside 0, top -1, bottom 1

  //   const loop = (
  //     data,
  //     key,
  //     callback,
  //   ) => {
  //     for (let i = 0; i < data.length; i++) {
  //       if (data[i].key === key) {
  //         return callback(data[i], i, data);
  //       }
  //       if (data[i].children) {
  //         loop(data[i].children, key, callback);
  //       }
  //     }
  //   };
  //   const data = [...gData];

  //   // Find dragObject
  //   let dragObj;
  //   loop(data, dragKey, (item, index, arr) => {
  //     arr.splice(index, 1);
  //     dragObj = item;
  //   });

  //   if (!info.dropToGap) {
  //     // Drop on the content
  //     loop(data, dropKey, (item) => {
  //       item.children = item.children || [];
  //       // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
  //       item.children.unshift(dragObj);
  //     });
  //   } else {
  //     let ar = [];
  //     let i;
  //     loop(data, dropKey, (_item, index, arr) => {
  //       ar = arr;
  //       i = index;
  //     });
  //     if (dropPosition === -1) {
  //       // Drop on the top of the drop node
  //       ar.splice(i, 0, dragObj);
  //     } else {
  //       // Drop on the bottom of the drop node
  //       ar.splice(i + 1, 0, dragObj);
  //     }
  //   }
  //   setGData(data);
  // };

  return (
    <>
      {/* <Tree
      className="draggable-tree"
      // defaultExpandedKeys={expandedKeys}
      draggable
      blockNode
      // onDragEnter={onDragEnter}
      // onDrop={onDrop}
      treeData={featuresForTree}
    /> */}
      <ul style={{ display: "flex", flexDirection: "column" }}>
        {features.map((feature, index) => {
          return (
            <li key={feature.id} className={styles.featureListItem}>
              {feature.type === "scriptableObject" && (
                <>
                  <div style={{ marginRight: "auto", display: "inline-flex" }}>
                    <Typography
                      variant={"body2"}
                      style={{ marginRight: "10px" }}
                    >
                      {feature.name ? feature.name : feature.id}
                    </Typography>
                    <button
                      className={styles.iconButton}
                      onClick={() => {
                        setEditorStatus({
                          ...editorStatus,
                          sidePanelOpen: true,
                          currentEditor: "scriptEditor",
                          target: index,
                        });
                      }}
                    >
                      <MdEdit />
                    </button>
                    <Popconfirm
                      placement="topLeft"
                      title={null}
                      icon={null}
                      description={
                        <Typography variant={"body3"}>
                          Are you sure you want to delete this feature?
                        </Typography>
                      }
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => {
                        deleteFeature(feature.id);
                      }}
                    >
                      <button className={styles.iconButton}>
                        <IoTrashOutline />
                      </button>
                    </Popconfirm>
                  </div>

                  <div className={styles.featureListItemActions}>
                    <ToggleSwitch
                      setIsChecked={(e) =>
                        updateFeature(feature.id, {
                          active: e.target.checked,
                        })
                      }
                      isChecked={feature.active}
                    />
                  </div>
                </>
              )}

              {feature.type === "canvas" && (
                <>
                  <p style={{ marginRight: "auto" }}>
                    {feature.name ? feature.name : feature.id}
                  </p>

                  <ToggleSwitch
                    setIsChecked={(e) =>
                      updateFeature(feature.id, {
                        active: e.target.checked,
                      })
                    }
                    isChecked={feature.active}
                  />
                  <button
                    onClick={() => {
                      setEditorStatus({
                        ...editorStatus,
                        sidePanelOpen: true,
                        currentEditor: "canvasEditor",
                        target: index,
                      });
                    }}
                  >
                    EDIT
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};

const FeaturesListAndControls = () => {
  const { stageInfo, features, addFeature } = useStageContext();
  return (
    <>
      <div>
        <Typography variant={"subheading"}>Stage Features</Typography>
        <div>
          <button
            onClick={async () => {
              const scriptableObject = createDefaultScriptableObject();
              scriptableObject.stage_id = stageInfo.id;
              scriptableObject.name = `Script ${features.length
                .toString()
                .padStart(2, "0")}`;
              await addFeature(scriptableObject);
            }}
          >
            <p>Add Scriptable Object</p>
          </button>
          {/* <button
          onClick={async () => {
            const canvasObject = createDefaultCanvasObject();
            canvasObject.stage_id = stageInfo.id;
            await addFeature(canvasObject);
          }}
        >
          <p>Add Canvas Object</p>
        </button> */}
          <FileModal />
        </div>
        <FeaturesList />
      </div>
    </>
  );
};

// export const updateFeature = async ({ stageInfo, updatedFeature, updatedFeatureIndex }) => {
//   const updatedFeaturesArray = structuredClone(stageInfo.features);
//   console.log('updated:', updatedFeaturesArray);
//   updatedFeaturesArray[updatedFeatureIndex] = updatedFeature;

//   const { data, error } = await supabase
//     .from('stages')
//     .update({ features: updatedFeaturesArray })
//     .eq('id', stageInfo.id)
//     .select()

//   if (error) {
//     console.error("Error updating feature:", error);
//   } else {
//     console.log("Success.  Updated feature: ", data);
//   }
// };
// import { Sortable } from "./Sortable";
// import {verticalListSortingStrategy} from "@dnd-kit/sortable"

export const EditorSidePanel = () => {
  const { features, updateFeature } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();

  return (
    <>
      {editorStatus.target == null && <FeaturesListAndControls />}
      {editorStatus.target !== null && <EditorFeatureEditors />}
    </>
  );
};

export const EditorFeatureEditors = () => {
  const { features, updateFeature } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();
  const [currentFeatureName, setCurrentFeatureName] = useState(
    features[editorStatus.target].name,
  );

  return (
    <>
      <div>
        <button
          onClick={() => {
            setEditorStatus({
              ...editorStatus,
              sidePanelOpen: false,
              target: null,
              currentEditor: null,
            });
          }}
        >
          Close
        </button>
      </div>
      <input
        type="text"
        value={currentFeatureName}
        onChange={(event) => {
          setCurrentFeatureName(event.target.value);
        }}
      />
      <button
        onClick={() => {
          updateFeature(features[editorStatus.target].id, {
            name: currentFeatureName,
          });
        }}
      >
        SAVE NAME
      </button>
      {editorStatus.currentEditor === "scriptEditor" && (
        <>
          <ScriptEditor
            scriptableObjectData={features[editorStatus.target]}
            featureIndex={editorStatus.target}
          />
        </>
      )}
      {editorStatus.currentEditor === "canvasEditor" && (
        <>
          Canvas Editor
          <FileInner />
        </>
      )}
    </>
  );
};

export const EditorView = () => {
  const [panelWidth, setPanelWidth] = useState(500); // Initial width of the panel

  const { editorStatus } = useEditorContext();
  return (
    <>
      <>
        <div
          style={{
            width: "100%",
            height: `100%`,
            position: "relative",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <ResizablePanel
            panelSize={panelWidth}
            setPanelSize={setPanelWidth}
            resizeDirection="horizontal"
          >
            <EditorSidePanel />
          </ResizablePanel>

          <div
            style={{
              width: `calc(100vw - ${panelWidth}px)`,
              position: "relative",
            }}
          >
            <AudienceView />
          </div>
        </div>
      </>
    </>
  );
};
