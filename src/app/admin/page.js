"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import Typography from "@/components/Typography";
import styles from "./AdminPage.module.scss";
import { Button } from "@/components/Button";
import { NavBar } from "@/components/NavBar";
import { useProjectInfoForAdminPage } from "@/hooks/useProjectInfoForAdminPage";
import { useRouter } from "next/navigation";

const ProjectCard = ({ project }) => {
  const router = useRouter()
    return (
    <div className={styles.projectCardContainer}>
      <Typography variant={"subtitle"}>{project.title}</Typography>
      <div className={styles.projectCardActions}>
        <Button size="small" variant="secondary" onClick={() => router.push(`/${project.url_slug}/broadcast`)}>
          Broadcast
        </Button>
        <Button size="small" variant="secondary"onClick={() => router.push(`/${project.url_slug}/stage`)}>
          Enter Stage
        </Button>
        <Button size="small" variant="secondary"onClick={() => router.push(`/${project.url_slug}/lobby`)}>
          Enter Lobby
        </Button>
      </div>
    </div>
  );
};

const ProjectList = () => {

  const {projectInfo} = useProjectInfoForAdminPage();

  console.log(projectInfo);
  // This is a placeholder for the actual project list
  const projects = [
    { id: 1, name: "Project A" },
    { id: 2, name: "Project B" },
    { id: 3, name: "Project C" },
  ];

  return (
    <div className={styles.projectListContainer}>
      <div className={styles.projectListHeader}>
        <Typography variant={"hero"}>Projects</Typography>
        <Button size="large" variant="secondary">
          Add Project
        </Button>
        <Button size="large" variant="secondary">
          Manage Collaborators
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

  // const addStage = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('stages')
  //       .insert({ title: name, collaborator_ids: [user.id], url_slug: name.toLowerCase()+"-"+Date.now().toFixed(0).slice(10).toString() })
  //       .select();
  //     if (error){
  //       console.error("Error creating new performance:",error);
  //     } else {
  //       console.log("Successfully created new stage:",data);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  if (!user) return null;
  return (
    <>
      <NavBar />
      <div className={styles.adminPageContainer}>
        <ProjectList />
      </div>
    </>
  );
}
