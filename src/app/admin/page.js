"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import Typography from "@/components/Typography";
import styles from "./AdminPage.module.scss";
import { Button } from "@/components/Button";
import { NavBar } from "@/components/NavBar";
import { useProjectInfoForAdminPage } from "@/hooks/useProjectInfoForAdminPage";
import { useRouter } from "next/navigation";
import { CiEdit } from "react-icons/ci";
import { EditableText } from "@/components/Editor/EditableText";
import Link from "next/link";
import { supabase } from "@/components/SupabaseClient";

const VenueAdministration = () => {
  return (
    <div>
      <Typography variant={"hero"}>Venue</Typography>
    </div>
  );
};
const ProjectCard = ({ project }) => {
  const router = useRouter();
  return (
    <div className={styles.projectCardContainer}>
      <Typography variant={"subtitle"}>{project.title}</Typography>

      <div className={styles.projectCardActions}>
        <Link
          href={`/admin/${project.url_slug}/lobby`}
          className={styles.projectLink}
        >
          <Button size="small" variant="primary">
            Enter Lobby
          </Button>
        </Link>
        <Link
          href={`/admin/${project.url_slug}/stage`}
          className={styles.projectLink}
        >
          <Button size="small" variant="primary">
            Enter Stage
          </Button>
        </Link>
        <Link
          href={`/admin/${project.url_slug}/broadcast`}
          className={styles.projectLink}
        >
          <Button size="small" variant="primary">
            Enter Broadcaster
          </Button>
        </Link>
      </div>

      <div className={styles.editButtonContainer}>
        <Button className={styles.editButton} size="small" variant="secondary">
          Edit
        </Button>
      </div>
    </div>
  );
};

const ProjectList = () => {
  const { user } = useAuthContext();
  const { projectInfo } = useProjectInfoForAdminPage();

  const addStage = async () => {
    try {
      const { data, error } = await supabase
        .from('stages')
        .insert({ collaborator_ids: [user.id] })
        .select();
      if (error){
        console.error("Error creating new performance:",error);
      } else {
        console.log("Successfully created new stage:",data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.projectListContainer}>
      <div className={styles.projectListHeader}>
        <Typography variant={"hero"}>Projects</Typography>
        <Button size="large" variant="secondary" onClick={() => {addStage();}}>
          Add Project
        </Button>
      </div>

      {projectInfo.map((project) => (
        <ProjectCard project={project} />
      ))}
    </div>
  );
};

export default function AdminPage() {
  const { user } = useAuthContext();

  if (!user) return null;
  return (
    <>
      <NavBar />
      <div className={styles.adminPageContainer}>
        {/* <VenueAdministration /> */}
        <ProjectList />
      </div>
    </>
  );
}
