import { useMemo } from "react";

import { useStageContext } from "@/components/StageContext";
import { useEditorContext } from "../EditorContext";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import Typography from "@/components/Typography";
import { EditableText } from "../EditableText";

import { MdEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import { MdDragIndicator } from "react-icons/md";
import { FaRegClone } from "react-icons/fa";
import styles from "./FeaturesList.module.scss";

import { Button } from "@/components/Button";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { MdVideocam } from "react-icons/md";

import {
  createDefaultScriptableObject,
  createDefaultBroadcastStream,
} from "../../../../shared/defaultDBEntries";

import debug from "debug";
const logger = debug("broadcaster:featuresList");

const SortableItem = ({ id, children, even }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const dragStyle = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    backgroundColor: even
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
      {children}
    </div>
  );
};

const SketchRow = ({ feature }) => {
  const { updateFeature, deleteFeature, addFeature } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();

  return (
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
        <button
          className={styles.iconButton}
          onClick={() => {
            var result = confirm("Delete this sketch?");
            if (result) {
              deleteFeature(feature.id);
            }
          }}
        >
          <IoTrashOutline />
        </button>
        <button
          className={styles.iconButton}
          onClick={() => {
            addFeature({
              stage_id: feature.stage_id,
              info: feature.info,
              type: feature.type,
              name: `${feature.name} Copy`,
            });
          }}
        >
          <FaRegClone />
        </button>
      </div>
      <div className={styles.featureListItemActions}>
        <ToggleSwitch
          setIsChecked={(e) =>
            updateFeature(feature.id, { active: e.target.checked })
          }
          isChecked={feature.active}
        />
      </div>
    </>
  );
};

const StreamRow = ({ feature }) => {
  const { updateFeature, deleteFeature } = useStageContext();

  return (
    <>
      <div style={{ flexGrow: "1", display: "inline-flex", alignItems: "center" }}>
        <MdVideocam style={{ marginRight: "6px", flexShrink: 0 }} />
        <EditableText
          text={feature.name || feature.id}
          variant="body1"
          onSave={(newName) => updateFeature(feature.id, { name: newName })}
        />
        <button
          className={styles.iconButton}
          onClick={() => {
            var result = confirm("Delete this broadcast stream?");
            if (result) {
              deleteFeature(feature.id);
            }
          }}
        >
          <IoTrashOutline />
        </button>
      </div>
      <div className={styles.featureListItemActions}>
        <ToggleSwitch
          setIsChecked={(e) =>
            updateFeature(feature.id, { active: e.target.checked })
          }
          isChecked={feature.active}
        />
      </div>
    </>
  );
};

export const FeaturesList = () => {
  const {
    stageInfo,
    features,
    addFeature,
    updateFeatureOrder,
  } = useStageContext();
  logger("features", features);

  const sketchFeatures = useMemo(
    () => features.filter((f) => f.type === "scriptableObject"),
    [features],
  );

  const streamFeatures = useMemo(
    () => features.filter((f) => f.type === "broadcastStream"),
    [features],
  );

  const handleSketchDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sketchFeatures.findIndex((el) => el.id === active.id);
    const newIndex = sketchFeatures.findIndex((el) => el.id === over.id);
    const reordered = [...sketchFeatures];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reordered.forEach((f, i) => { f.order = i; });
    const merged = [...reordered, ...streamFeatures.map((f, i) => ({ ...f, order: reordered.length + i }))];
    updateFeatureOrder(merged);
  };

  const handleStreamDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = streamFeatures.findIndex((el) => el.id === active.id);
    const newIndex = streamFeatures.findIndex((el) => el.id === over.id);
    const reordered = [...streamFeatures];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reordered.forEach((f, i) => { f.order = sketchFeatures.length + i; });
    const merged = [...sketchFeatures.map((f, i) => ({ ...f, order: i })), ...reordered];
    updateFeatureOrder(merged);
  };

  return (
    <>
      {/* Streams Section */}
      <div style={{ display: "flex", flexDirection: "row", padding: "10px" }}>
        <div style={{ flexGrow: 1 }}>
          <Typography variant={"subheading"}>Streams</Typography>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={async () => {
            const stream = createDefaultBroadcastStream();
            stream.stage_id = stageInfo.id;
            stream.name = `Stream ${(streamFeatures.length + 1)
              .toString()
              .padStart(2, "0")}`;
            stream.order = features.length;
            await addFeature(stream);
          }}
        >
          <p>Add Stream +</p>
        </Button>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleStreamDragEnd}>
        <SortableContext items={streamFeatures} strategy={verticalListSortingStrategy}>
          <div className={styles.sortableList}>
            {streamFeatures.map((feature, i) => (
              <SortableItem key={feature.id} id={feature.id} even={i % 2 === 0}>
                <StreamRow feature={feature} />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Interactive Sketches Section */}
      <div style={{ display: "flex", flexDirection: "row", padding: "10px" }}>
        <div style={{ flexGrow: 1 }}>
          <Typography variant={"subheading"}>Interactive Sketches</Typography>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={async () => {
            const scriptableObject = createDefaultScriptableObject();
            scriptableObject.stage_id = stageInfo.id;
            scriptableObject.name = `Script ${sketchFeatures.length
              .toString()
              .padStart(2, "0")}`;
            scriptableObject.order = features.length;
            await addFeature(scriptableObject);
          }}
        >
          <p>Add Object +</p>
        </Button>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleSketchDragEnd}>
        <SortableContext items={sketchFeatures} strategy={verticalListSortingStrategy}>
          <div className={styles.sortableList}>
            {sketchFeatures.map((feature, i) => (
              <SortableItem key={feature.id} id={feature.id} even={i % 2 === 0}>
                <SketchRow feature={feature} />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
};
