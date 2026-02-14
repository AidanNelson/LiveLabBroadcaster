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


import debug from "debug";
const logger = debug("broadcaster:featuresList");

const AnnouncementEditModal = ({
  editingAnnouncement,
  setEditingAnnouncement,
  updateAnnouncement,
}) => {
  const [localEditingAnnouncement, setLocalEditingAnnouncement] =
    useState(editingAnnouncement);

  // useEffect(() => {
  //   setLocalEditingAnnouncement(editingAnnouncement);
  // }, [editingAnnouncement]);

  // const handleSave = () => {
  //   updateAnnouncement(localEditingAnnouncement);
  //   setEditingAnnouncement(null);
  // };

  return (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="relative bg-black rounded-lg shadow-lg w-full max-w-md p-6">
        <button
          className="right-2 top-2 absolute"
          onClick={() => setEditingAnnouncement(null)}
        >
          Close
        </button>
        <h2 className="text-xl font-semibold mb-4">Edit Announcement</h2>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="adminLabel"
          >
            Admin Label (not visible to audience)
          </label>
          <input
            id="adminLabel"
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800"
            placeholder="Announcement title"
            value={localEditingAnnouncement.adminTitle}
            onChange={(e) =>
              setLocalEditingAnnouncement({
                ...localEditingAnnouncement,
                adminTitle: e.target.value,
              })
            }
          />
        </div>
        <hr  className={`my-4`}/>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800"
            placeholder="Announcement title"
            value={localEditingAnnouncement.title}
            onChange={(e) =>
              setLocalEditingAnnouncement({
                ...localEditingAnnouncement,
                title: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="subtitle">
            Subtitle
          </label>
          <textarea
            id="subtitle"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800"
            placeholder="Announcement subtitle"
            value={localEditingAnnouncement.subtitle}
            onChange={(e) =>
              setLocalEditingAnnouncement({
                ...localEditingAnnouncement,
                subtitle: e.target.value,
              })
            }
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="primary"
            size="small"
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              updateAnnouncement(localEditingAnnouncement);
              setLocalEditingAnnouncement(null);
              setEditingAnnouncement(null);
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

const createDefaultAnnouncement = () => {
  return {
    id: `announcement_${Date.now()}`,
    adminTitle: "New Announcement",
    title: "The show is about to start.",
    subtitle:
      "Get comfortable, and if possible, turn off notifications on your device to minimize distractions. :)",
    isVisible: false,
    order: 0,
  };
};

const SortableItem = ({
  id,
  announcement,
  deleteAnnouncement,
  toggleAnnouncement,
  setEditingAnnouncement,
}) => {
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
        setEditingAnnouncement={setEditingAnnouncement}
      />
    </div>
  );
};

const AnnouncementListRow = ({
  announcement,
  deleteAnnouncement,
  toggleAnnouncement,
  setEditingAnnouncement,
}) => {
  return (
    <>
      <div style={{ flexGrow: "1", display: "inline-flex" }}>
        <Typography variant={"body1"} style={{ marginRight: "10px" }}>
          {announcement.adminTitle || "Announcement"}
        </Typography>
        <button
          className={styles.iconButton}
          onClick={() => {
            setEditingAnnouncement(announcement);
          }}
        >
          <MdEdit />
        </button>

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
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);

  const [localAnnouncements, setLocalAnnouncements] = useState([]);

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
    logger("Announcements updated on server:", stageInfo.announcements);
    setLocalAnnouncements(stageInfo.announcements);
  }, [stageInfo]);

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

  const updateAnnouncement = (updatedAnnouncement) => {
    const updatedAnnouncements = localAnnouncements.map((announcement) => {
      if (announcement.id === updatedAnnouncement.id) {
        return { ...announcement, ...updatedAnnouncement };
      }
      return announcement;
    });
    updateAnnouncements(updatedAnnouncements);
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
      {editingAnnouncement && (
        <AnnouncementEditModal
          editingAnnouncement={editingAnnouncement}
          setEditingAnnouncement={setEditingAnnouncement}
          updateAnnouncement={updateAnnouncement}
        />
      )}
      <div style={{ display: "flex", flexDirection: "row", padding: "10px" }}>
        {/* <div style={{ flexGrow: 1 }}>
          <Typography variant={"subheading"}>Announcements</Typography>
        </div> */}
        <Button
          variant="primary"
          size="small"
          onClick={async () => {
            createNewAnnouncement();
          }}
        >
          <p>Create New +</p>
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
                setEditingAnnouncement={setEditingAnnouncement}
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
