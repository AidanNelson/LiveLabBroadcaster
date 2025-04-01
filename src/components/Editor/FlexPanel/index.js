import { useState, useEffect } from "react";
import { FileUploadDropzone } from "@/components/Editor/FileUploadDropzone";
import { FileInner } from "@/components/Editor/Files";
import styles from "./FlexPanel.module.scss";
import Typography from "@/components/Typography";
export const FlexPanel = () => {
  const [currentPage, setCurrentPage] = useState("assets");

  return (
    <div className={styles.flexPanelContainer}>
      <div className={styles.tabsContainer}>
        <div
          className={`${styles.tab} ${
            currentPage === "assets" ? styles.active : ""
          }`}
        >
          <button onClick={() => setCurrentPage("assets")}>
            <Typography variant="body3">Assets</Typography>
          </button>
        </div>
        <div
          className={`${styles.tab} ${
            currentPage === "audience" ? styles.active : ""
          }`}
        >
          <button onClick={() => setCurrentPage("audience")}>
            <Typography variant="body3">Audience</Typography>
          </button>
        </div>
      </div>
      <div className={styles.contentContainer}>
        {currentPage === "assets" && (
          <>
            <FileUploadDropzone />
            <FileInner />
          </>
        )}
        {currentPage === "audience" && <>Audience Placeholder</>}
      </div>
    </div>
  );
};
