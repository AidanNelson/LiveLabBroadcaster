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
import { useCallback, useState } from "react";
import { set } from "lodash";

const VenueAdministration = () => {
  return (
    <div>
      <Typography variant={"hero"}>Venue</Typography>
    </div>
  );
};
const ProjectCard = ({
  project,
  setCurrentlyEditingProject,
  setDataIsStale,
}) => {
  // const router = useRouter();
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
        <Button
          className={styles.editButton}
          size="small"
          variant="secondary"
          onClick={() => setCurrentlyEditingProject(project)}
        >
          Edit
        </Button>
        <Button
          className={styles.editButton}
          size="small"
          variant="secondary"
          onClick={() => {
            var result = confirm("Want to delete?");
            if (result) {
              //Logic to delete the item
              supabase
                .from("stages")
                .delete()
                .eq("id", project.id)
                .then(({ error }) => {
                  if (error) {
                    console.error("Error deleting project:", error);
                  } else {
                    console.log("Project deleted successfully");
                    setCurrentlyEditingProject(null);
                    setDataIsStale(true);
                    // router.refresh(); // Refresh the page to update the list
                  }
                });
            }
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

const ProjectList = ({ setCurrentlyEditingProject }) => {
  const { user } = useAuthContext();
  const { projectInfo, setDataIsStale } = useProjectInfoForAdminPage();

  const addStage = async () => {
    try {
      const { data, error } = await supabase
        .from("stages")
        .insert({ collaborator_ids: [user.id] })
        .select();
      if (error) {
        console.error("Error creating new performance:", error);
      } else {
        console.log("Successfully created new stage:", data);
        setCurrentlyEditingProject(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <Typography variant={"hero"}>Projects</Typography>
        <Button
          size="large"
          variant="secondary"
          onClick={() => {
            addStage();
          }}
        >
          Add Project
        </Button>
      </div>

      {projectInfo.map((project) => (
        <ProjectCard
          project={project}
          setCurrentlyEditingProject={setCurrentlyEditingProject}
          setDataIsStale={setDataIsStale}
        />
      ))}
    </div>
  );
};

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          cursor: "pointer",
          gap: "var(--spacing-16)",
        }}
      >
        <button
          style={{
            display: "flex",
            width: "3rem",
            height: "3rem",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "▲" : "▼"}{" "}
        </button>
        <Typography variant="title">{title}</Typography>
      </div>
      {isOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "var(--spacing-32)",

            marginTop: "2rem",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const StyledMultilineInput = ({ text, onChange, placeholder, rows, cols }) => {
  const [value, setValue] = useState(text);
  return (
    <textarea
      rows={rows || 4}
      cols={cols || 50}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      className={styles.styledInput}
      style={{
        width: "100%",
        padding: "var(--spacing-16) var(--spacing-16)",
        borderRadius: "var(--primary-border-radius)",
        border: "1px solid var(--ui-light-grey)",
      }}
    />
  );
};

const StyledInput = ({ text, onChange, placeholder, variant }) => {
  const [value, setValue] = useState(text);
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "var(--spacing-16) var(--spacing-16)",
        borderRadius: "var(--primary-border-radius)",
        border: "1px solid var(--ui-light-grey)",
      }}
    />
  );
};
const StyledCheckbox = ({ checked, onChange, label }) => {
  const [value, setValue] = useState(checked || false);
  console.log("StyledCheckbox rendered with value:", value);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "var(--spacing-8)",
      }}
    >
      <Typography
        variant="subheading"
        style={{ marginRight: "var(--spacing-8)" }}
      >
        {label}
      </Typography>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => {
          console.log("Checkbox changed:", e.target.checked);
          onChange(!!e.target.checked);
          setValue(!!e.target.checked);
        }}
        style={{
          width: "2rem",
          height: "2rem",
          // padding: "var(--spacing-16) var(--spacing-16)",
          borderRadius: "var(--primary-border-radius)",
          border: "1px solid var(--ui-light-grey)",
        }}
      />
    </div>
  );
};
const ProjectEditor = ({ project, setCurrentlyEditingProject }) => {
  console.log("Editing project:", project);

  const onValueUpdate = useCallback(
    async (key, value) => {
      const update = {
        [key]: value,
      };
      const { data, error } = await supabase
        .from("stages")
        .update(update)
        .eq("id", project.id)
        .select();
      if (error) {
        console.error(`Error performing update - ${update}:`, error);
      } else {
        console.log(`Successfully updated - ${update}`, data);
      }
    },
    [project.id],
  );
  return (
    <>
      <div className={styles.adminContainer}>
        <div
          style={{ display: "flex", flexDirection: "row", alignItems: "start" }}
        >
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              setCurrentlyEditingProject(null);
            }}
          >
            &larr; Back
          </Button>
        </div>
        <div className={styles.adminHeader}>
          <Typography variant={"hero"}>Edit Project</Typography>
          {/* <Button size="large" variant="secondary" onClick={() => {}}>
            Save
          </Button> */}
        </div>

        <AccordionItem title="Project Contents">
          <Typography variant="heading">Project Title</Typography>
          <StyledInput
            text={project.title}
            onChange={(e) => onValueUpdate("title", e)}
            placeholder="Enter project title"
          />

          <Typography variant="heading">Project URL Slug</Typography>
          <StyledInput
            text={project.url_slug}
            onChange={(e) => onValueUpdate("url_slug", e)}
            placeholder="Enter project url slug"
          />

          <Typography variant="heading">Description</Typography>
          <StyledMultilineInput
            text={project.description}
            onChange={(e) => onValueUpdate("description", e)}
            placeholder="Enter project url slug"
            rows={10}
          />
          <Typography variant="heading">Credits</Typography>
          <Typography variant="body3">
            Please follow placeholder styling
          </Typography>
          <StyledMultilineInput
            text={project.credits}
            onChange={(e) => onValueUpdate("credits", `{${e}}`)}
            placeholder={`
###### Presented by
#### Organization Name
&nbsp;
###### In Association With
#### Another Organization
,

#### Some Person

#### Some Person

#### Some Person

#### Some Person

#### Some Person`}
            rows={20}
          />
        </AccordionItem>
        <AccordionItem title="Project Settings">
          <StyledCheckbox
            checked={!!project.visible_on_homepage}
            onChange={(e) => {
              console.log("setting visible on homepage to ", e);
              onValueUpdate("visible_on_homepage", e);
            }}
            label="Visible on Homepage?"
          />
          {/* <Typography variant="heading">
            Is Project Visible on Homepage?
          </Typography> */}
          {/* <input
            type="checkbox"
            onChange={(e) => {
              onValueUpdate("visible_on_homepage", e.target.checked);
            }}
            checked={project.visible_on_homepage}
          /> */}
        </AccordionItem>
      </div>
    </>
  );
};
export default function AdminPage() {
  const { user } = useAuthContext();
  const [currentlyEditingProject, setCurrentlyEditingProject] = useState(null);

  if (!user) return null;
  return (
    <>
      <NavBar />
      <div className={styles.adminPageContainer}>
        {/* <VenueAdministration /> */}
        {!currentlyEditingProject && (
          <ProjectList
            setCurrentlyEditingProject={setCurrentlyEditingProject}
          />
        )}
        {currentlyEditingProject && (
          <ProjectEditor
            project={currentlyEditingProject}
            setCurrentlyEditingProject={setCurrentlyEditingProject}
          />
        )}
      </div>
    </>
  );
}
