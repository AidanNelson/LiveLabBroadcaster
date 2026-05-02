import { useMemo } from "react";

import { useStageContext } from "@/components/StageContext";
import { useEditorContext } from "../EditorContext";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import Typography from "@/components/Typography";
import { cn } from "@/lib/utils";

import { MdAdd, MdDragIndicator, MdEdit, MdVideocam } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import { FaRegClone } from "react-icons/fa";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import {
  createDefaultScriptableObject,
  createDefaultBroadcastStream,
} from "../../../../shared/defaultDBEntries";
import { Clapperboard } from "lucide-react";

import debug from "debug";
const logger = debug("broadcaster:featuresList");

/** Full width of the panel with horizontal inset so rows don’t hug the edge. */
const featuresSectionClass = "mb-8 w-full max-w-none px-4 sm:px-6 last:mb-0";

const sortableListShellClass =
  "flex flex-col overflow-hidden border border-[var(--ui-grey)]";

const iconButtonClass =
  "inline-flex cursor-pointer items-center justify-center border-none bg-transparent text-[var(--text-primary-color)] [&_svg]:size-6";

const featureListItemActionsClass =
  "inline-flex items-center justify-center";

const TogglePipeSeparator = () => (
  <span
    className="shrink-0 select-none px-2.5 text-[var(--text-secondary-color)]"
    aria-hidden
  >
    |
  </span>
);

const SortableItem = ({ id, children, even }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "box-border flex w-full items-center gap-2 px-1.5 py-1",
        even ? "bg-[var(--ui-dark-grey)]" : "bg-[var(--ui-background-color)]",
      )}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
      }}
    >
      <div
        className="flex shrink-0 items-center"
        {...attributes}
        {...listeners}
      >
        <button type="button" className={iconButtonClass}>
          <MdDragIndicator />
        </button>
      </div>
      <div className="flex min-w-0 flex-1 flex-row items-center gap-2">
        {children}
      </div>
    </div>
  );
};

const SketchRow = ({ feature }) => {
  const { updateFeature, deleteFeature, addFeature } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-x-2.5 overflow-hidden text-[var(--text-primary-color)]">
        <Clapperboard
          className="size-6 shrink-0"
          aria-hidden
          strokeWidth={1.75}
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          <Typography variant={"body1"} as="p" className="m-0 truncate">
            {feature.name ? feature.name : feature.id}
          </Typography>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-x-2.5">
        <button
          type="button"
          className={iconButtonClass}
          onClick={() => {
            setEditorStatus({
              ...editorStatus,
              sidePanelOpen: true,
              currentEditor: "scriptEditor",
              target: feature.id,
            });
          }}
          aria-label="Edit sketch"
        >
          <MdEdit />
        </button>
        <button
          type="button"
          className={iconButtonClass}
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
          type="button"
          className={iconButtonClass}
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
      <TogglePipeSeparator />
      <div className={featureListItemActionsClass}>
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
  const { editorStatus, setEditorStatus } = useEditorContext();

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-x-2.5 overflow-hidden">
        <MdVideocam className="size-6 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1 overflow-hidden">
          <Typography variant={"body1"} as="p" className="m-0 truncate">
            {feature.name ? feature.name : feature.id}
          </Typography>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-x-2.5">
        <button
          type="button"
          className={iconButtonClass}
          onClick={() => {
            setEditorStatus({
              ...editorStatus,
              sidePanelOpen: true,
              currentEditor: "streamEditor",
              target: feature.id,
            });
          }}
          aria-label="Edit stream"
        >
          <MdEdit />
        </button>
        <button
          type="button"
          className={iconButtonClass}
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
      <TogglePipeSeparator />
      <div className={featureListItemActionsClass}>
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
    reordered.forEach((f, i) => {
      f.order = i;
    });
    const merged = [
      ...reordered,
      ...streamFeatures.map((f, i) => ({
        ...f,
        order: reordered.length + i,
      })),
    ];
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
    reordered.forEach((f, i) => {
      f.order = sketchFeatures.length + i;
    });
    const merged = [
      ...sketchFeatures.map((f, i) => ({ ...f, order: i })),
      ...reordered,
    ];
    updateFeatureOrder(merged);
  };

  return (
    <div className="py-2">
      {/* Streams Section */}
      <div className={featuresSectionClass}>
        <div className="mb-2 flex flex-row items-center justify-between gap-3 pt-1">
          <div className="min-w-0 grow">
            <Typography variant={"heading"}>Streams</Typography>
          </div>
          <button
            type="button"
            className={iconButtonClass}
            aria-label="Add stream"
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
            <MdAdd />
          </button>
        </div>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleStreamDragEnd}>
          <SortableContext items={streamFeatures} strategy={verticalListSortingStrategy}>
            <div className={sortableListShellClass}>
              {streamFeatures.map((feature, i) => (
                <SortableItem key={feature.id} id={feature.id} even={i % 2 === 0}>
                  <StreamRow feature={feature} />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Interactive Sketches Section */}
      <div className={featuresSectionClass}>
        <div className="mb-2 flex flex-row items-center justify-between gap-3 pt-1">
          <div className="min-w-0 grow">
            <Typography variant={"heading"}>Interactive Sketches</Typography>
          </div>
          <button
            type="button"
            className={iconButtonClass}
            aria-label="Add interactive sketch"
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
            <MdAdd />
          </button>
        </div>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleSketchDragEnd}>
          <SortableContext items={sketchFeatures} strategy={verticalListSortingStrategy}>
            <div className={sortableListShellClass}>
              {sketchFeatures.map((feature, i) => (
                <SortableItem key={feature.id} id={feature.id} even={i % 2 === 0}>
                  <SketchRow feature={feature} />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
