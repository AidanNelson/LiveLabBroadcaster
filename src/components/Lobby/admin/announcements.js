import { useEffect, useState, useRef, useCallback } from "react";

import { useStageContext } from "@/components/StageContext";
// import { useEditorContext } from "../EditorContext";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import Typography from "@/components/Typography";

import { MdEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import { MdDragIndicator } from "react-icons/md";
import { FaRegClone } from "react-icons/fa";
// import styles from "./FeaturesList.module.scss";
const styles = {};
import { supabase } from "@/components/SupabaseClient";

import { Button } from "@/components/Button";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  createDefaultScriptableObject,
  createDefaultCanvasObject,
} from "../../../../shared/defaultDBEntries";

import debug from "debug";
const logger = debug("broadcaster:featuresList");

const createDefaultAnnouncement = () => {
  return {
    id: `announcement_${Date.now()}`,
    title: "The show is about to start.",
    subtitle:
      "Get comfortable, and if possible, turn off notifications on your device to minimize distractions. :)",
    isVisible: false,
    order: 0,
  };
};

const SortableItem = ({ id, announcement, deleteAnnouncement, toggleAnnouncement }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  // logger(feature.name, feature.order % 2 === 0);

  const dragStyle = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    backgroundColor:
      announcement.order % 2 === 0
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
      <AnnouncementListRow
        announcement={announcement}
        deleteAnnouncement={deleteAnnouncement}
        toggleAnnouncement={toggleAnnouncement}
      />
    </div>
  );
};

const AnnouncementListRow = ({ announcement, deleteAnnouncement, toggleAnnouncement }) => {
  const { stageInfo } = useStageContext();
  // const { editorStatus, setEditorStatus } = useEditorContext();


  return (
    <>
      <div style={{ flexGrow: "1", display: "inline-flex" }}>
        <Typography variant={"body1"} style={{ marginRight: "10px" }}>
          Announcement
        </Typography>
        {/* <button
          className={styles.iconButton}
          onClick={() => {
            // setEditorStatus({
            //   ...editorStatus,
            //   sidePanelOpen: true,
            //   currentEditor: "scriptEditor",
            //   target: feature.id,
            // });
          }}
        >
          <MdEdit />
        </button> */}

        <button
          className={styles.iconButton}
          onClick={() => {
            var result = confirm("Delete this sketch?");
            if (result) {
              deleteAnnouncement({ id: announcement.id });
            }
          }}
        >
          <IoTrashOutline />
        </button>
      </div>
      <div className={styles.featureListItemActions}>
        <ToggleSwitch
          setIsChecked={(e) => toggleAnnouncement({ id: announcement.id })}
          isChecked={announcement.isVisible}
        />
      </div>
    </>
  );
};

export const AnnouncementList = () => {
  const { stageInfo } = useStageContext();

  const [localAnnouncements, setLocalAnnouncements] = useState([
    {
      isVisible: false,
      currentAnnouncement: {
        title: "The show is about to start.",
        subtitle:
          "Get comfortable, and if possible, turn off notifications on your device to minimize distractions. :)",
      },
    },
    {
      isVisible: false,
      currentAnnouncement: {
        title: "The show is about to start.",
        subtitle:
          "Get comfortable, and if possible, turn off notifications on your device to minimize distractions. :)",
      },
    },
  ]);


  const deleteAnnouncement = ({ id }) => {
    const newAnnouncements = stageInfo.announcements.filter(
      (announcement) => announcement.id !== id,
    );
    updateAnnouncements(newAnnouncements);
  };

  const toggleAnnouncement = ({ id }) => {
    const updatedAnnouncements = localAnnouncements.map((announcement) => {
      if (announcement.id === id) {
        return { ...announcement, isVisible: !announcement.isVisible };
      }
      return { ...announcement, isVisible: false }; // make all others invisible
    });
    updateAnnouncements(updatedAnnouncements);
  };

  useEffect(() => {
    logger("Announcements updated:", stageInfo.announcements);
    setLocalAnnouncements(stageInfo.announcements);
  }, [stageInfo]);

  // const { editorStatus, setEditorStatus } = useEditorContext();

  const updateAnnouncements = (newAnnouncements) => {
    supabase
      .from("stages")
      .update({
        announcements: newAnnouncements,
      })
      .eq("id", stageInfo.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating announcements:", error);
        } else {
          logger("Announcements updated successfully.");
        }
      });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = localAnnouncements.findIndex(
        (el) => el.id === active.id,
      );
      const newIndex = localAnnouncements.findIndex((el) => el.id === over.id);
      // Update the order property of features
      const updatedLocalAnnouncements = [...localAnnouncements];
      const movedFeature = updatedLocalAnnouncements.splice(oldIndex, 1)[0];
      updatedLocalAnnouncements.splice(newIndex, 0, movedFeature);
      updatedLocalAnnouncements.forEach((announcement, index) => {
        announcement.order = index;
      });
      logger("calling update order");
      updateAnnouncements();
    }
  };

  const createNewAnnouncement = () => {
    const newAnnouncement = createDefaultAnnouncement();
    newAnnouncement.order = localAnnouncements.length;
    supabase
      .from("stages")
      .update({
        announcements: [...stageInfo?.announcements, newAnnouncement],
      })
      .eq("id", stageInfo.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating announcements:", error);
        } else {
          logger("Announcements updated successfully.");
        }
      });
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", padding: "10px" }}>
        <div style={{ flexGrow: 1 }}>
          <Typography variant={"subheading"}>Announcements</Typography>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={async () => {
            createNewAnnouncement();
          }}
        >
          <p>Create New Announcement +</p>
        </Button>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={localAnnouncements}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.sortableList}>
            {localAnnouncements.map((announcement) => (
              <SortableItem
                key={announcement.id}
                id={announcement.id}
                announcement={announcement}
                deleteAnnouncement={deleteAnnouncement}
                toggleAnnouncement={toggleAnnouncement}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
};
