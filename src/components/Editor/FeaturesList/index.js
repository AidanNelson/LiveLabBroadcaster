import { useEffect, useState, useRef, useCallback } from "react";

import { useStageContext } from "@/components/StageContext";
import { useEditorContext } from "../EditorContext";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import Typography from "@/components/Typography";

import { MdEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import { MdDragIndicator } from "react-icons/md";
import styles from "./FeaturesList.module.scss";

import { Tree } from "antd";
import { Popconfirm } from "antd";
import { Button } from "@/components/Button";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({ id, feature }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const dragStyle = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    backgroundColor:
      feature.order % 2 === 0
        ? "var(--ui-dark-grey)"
        : "var(--ui-background-color)",
    display: "flex",
    alignItems: "center",
    padding: "5px",
  };
  return (
    <div ref={setNodeRef} style={dragStyle}>
      <div {...attributes} {...listeners}>
        <button className={styles.iconButton}>
          <MdDragIndicator />
        </button>
      </div>
      <FeatureListRow feature={feature} />
    </div>
  );
};

const FeatureListRow = ({ feature }) => {
  const { stageInfo, features, updateFeature, deleteFeature } =
    useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();
  return (
    <>
      {feature.type === "scriptableObject" && (
        <>
          <div style={{ flexGrow: "1", display: "inline-flex" }}>
            <Typography variant={"body1"} style={{ marginRight: "10px" }}>
              {feature.name ? feature.name : feature.id}
            </Typography>
            <button
              className={styles.iconButton}
              onClick={() => {
                setEditorStatus({
                  ...editorStatus,
                  sidePanelOpen: true,
                  currentEditor: "scriptEditor",
                  target: feature.id,
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
    </>
  );
};

export const FeaturesList = () => {
  const {
    stageInfo,
    features,
    updateFeature,
    deleteFeature,
    updateFeatureOrder,
  } = useStageContext();
  console.log("features", features);
  const { editorStatus, setEditorStatus } = useEditorContext();

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = features.findIndex((el) => el.id === active.id);
      const newIndex = features.findIndex((el) => el.id === over.id);

      // Update the order property of features
      const updatedFeatures = [...features];
      const movedFeature = updatedFeatures.splice(oldIndex, 1)[0];
      updatedFeatures.splice(newIndex, 0, movedFeature);

      updatedFeatures.forEach((feature, index) => {
        feature.order = index;
      });

      updateFeatureOrder(updatedFeatures); // Assuming you have a function to update the feature order in context
    }
  };

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={features}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.sortableList}>
            {features.map((feature) => (
              <SortableItem
                key={feature.id}
                id={feature.id}
                feature={feature}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
};
