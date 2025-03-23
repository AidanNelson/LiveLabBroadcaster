import React, { useState } from "react";
import Typography from "@/components/Typography";
import { MdEdit, MdSave } from "react-icons/md";
import { Button } from "@/components/Button";
import styles from "./EditableText.module.scss";
import { useEffect } from "react";

export const EditableText = ({ text, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);

  const handleSave = () => {
    setIsEditing(false);
    onSave(currentText);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && isEditing) {
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, currentText]);

  return (
    <div className={styles.editableText}>
      {isEditing ? (
        <div className={styles.editContainer}>
          <input
            type="text"
            value={currentText}
            onChange={(event) => setCurrentText(event.target.value)}
            className={styles.editInput}
          />
          <Button variant="icon" size="small" onClick={handleSave}>
            <MdSave />
          </Button>
        </div>
      ) : (
        <div className={styles.displayContainer}>
          <Typography variant="subtitle">{currentText}</Typography>
          <Button
            variant="icon"
            size="small"
            onClick={() => setIsEditing(true)}
          >
            <MdEdit />
          </Button>
        </div>
      )}
    </div>
  );
};
