"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import Typography from "@/components/Typography";
import styles from "./InfoPage.module.scss";
import { Button } from "@/components/Button";
import { NavBar } from "@/components/NavBar";
import { useProjectInfoForAdminPage } from "@/hooks/useProjectInfoForAdminPage";
import { useRouter } from "next/navigation";

const ProjectInfoEditor = () => {
return (
    <div className={styles.projectInfoEditorContainer}>
      <Typography variant={"hero"}>Edit Project</Typography>

    </div>
  );
}


export default function EditPage() {

  return (
    <>
      <NavBar />
      <div >
        <ProjectInfoEditor />
      </div>
    </>
  );
}
