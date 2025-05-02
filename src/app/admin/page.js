"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import Typography from "@/components/Typography";
import styles from "./AdminPage.module.scss";
import { Button } from "@/components/Button";
import { NavBar } from "@/components/NavBar";
import { useProjectInfoForAdminPage } from "@/hooks/useProjectInfoForAdminPage";
import Link from "next/link";
import { supabase } from "@/components/SupabaseClient";
import { useCallback, useState, useEffect } from "react";
import { Credits } from "@/components/Credits";
import { StageContextProvider } from "@/components/StageContext";
import { FileUploadDropzone } from "@/components/Editor/AssetManagementPanel";
import { AssetMangementPanel } from "@/components/Editor/AssetManagementPanel";
import { DateTimeWithTimezoneInput } from "@/components/Admin/DateTimeInput";
import debug from "debug";
const logger = debug("broadcaster:admin");

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
                    logger("Project deleted successfully");
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

const ProjectList = ({
  projectInfo,
  setDataIsStale,
  setCurrentlyEditingProject,
}) => {
  const { user } = useAuthContext();

  const addStage = async () => {
    try {
      const { data, error } = await supabase
        .from("stages")
        .insert({ collaborator_ids: [user.id] })
        .select();
      if (error) {
        console.error("Error creating new performance:", error);
      } else {
        logger("Successfully created new stage:", data);
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
        onClick={() => setIsOpen(!isOpen)}
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
        resize: "vertical", // allows vertical resizing only
        minHeight: "100px", // minimum height for the textarea
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
  logger("StyledCheckbox rendered with value:", value);
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
          logger("Checkbox changed:", e.target.checked);
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

const ManageCollaborators = ({ project, onValueUpdate }) => {
  const [emails, setEmails] = useState([]);
  const [currentCollaboratorEmails, setCurrentCollaboratorEmails] = useState(
    [],
  );

  useEffect(() => {
    if (project.collaborator_ids && project.collaborator_ids.length > 0) {
      const fetchEmails = async () => {
        const { data, error } = await supabase
          .from("public_users")
          .select("email")
          .in("id", project.collaborator_ids);
        if (error) {
          console.error("Error fetching collaborator emails:", error);
        } else {
          setCurrentCollaboratorEmails(data.map((user) => user.email));
        }
      };
      fetchEmails();
    }
  }, [project.collaborator_ids]);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <StyledInput
          text={""}
          onChange={(e) => {
            const emails = e
              .split(",")
              .map((email) => email.trim())
              .filter(Boolean);
            setEmails(emails);
            // onValueUpdate("collaborator_emails", emails);
          }}
          placeholder="Enter collaborator emails, separated by commas"
          rows={5}
        />
        <Button
          variant="primary"
          size="small"
          onClick={async () => {
            emails.forEach(async (email) => {
              logger("Inviting collaborator:", email);
              const { data, error } = await supabase
                .from("public_users")
                .select("*")
                .eq("email", email);
              if (error) {
                console.error("Error checking existing collaborator:", error);
              } else if (data.length > 0) {
                logger("User exists:", email);
                const user = data[0];
                logger(user);
                onValueUpdate("collaborator_ids", [
                  ...(project.collaborator_ids || []),
                  user.id,
                ]);
              } else {
                logger("User does not exist with email:", email);
              }
            });
            // const emails = project.collaborator_emails?.join("\n").split("\n").map((email) => email.trim()).filter(Boolean) || [];
            // if (emails.length === 0) {
            //   console.error("No emails provided");
            //   return;
            // }
            // const { error } = await supabase
            //   .from("stages")
            //   .update({ collaborator_emails: emails })
            //   .eq("id", project.id);
            // if (error) {
            //   console.error("Error updating collaborators:", error);
            // } else {
            //   logger("Successfully updated collaborators");
            // }
          }}
        >
          Make Collaborator
        </Button>
      </div>

      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {currentCollaboratorEmails.map((email, index) => (
          <li
            key={index}
            style={{
              borderBottom: "1px solid var(--ui-light-grey)",
              padding: "var(--spacing-32) 0",
            }}
          >
            <div>
              <Typography variant={"subheading"}>{email}</Typography>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};
const ProjectEditor = ({
  project,
  setCurrentlyEditingProject,
  setDataIsStale,
}) => {
  logger("Editing project:", project);

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
        logger(`Successfully updated - ${update}`, data);
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

          <Typography variant="heading">
            Date/Time Info (Shown on Top-Right of Project Card)
          </Typography>
          <StyledMultilineInput
            text={project.datetime_info}
            onChange={(e) => onValueUpdate("datetime_info", e)}
            placeholder={`### June 1 - 3 
### 7:00pm ET`}
            rows={4}
          />

          <Typography variant="heading">Starting Date/Time</Typography>
          <DateTimeWithTimezoneInput
            timestamp={project.start_time}
            timezone={project.start_time_timezone}
            onChange={(e) => {
              onValueUpdate("start_time", e.timestamp);
              onValueUpdate("start_time_timezone", e.timezone);
            }}
          />
          <Typography variant="heading">Ending Date/Time</Typography>
          <DateTimeWithTimezoneInput
            timestamp={project.end_time}
            timezone={project.end_time_timezone}
            onChange={(e) => {
              onValueUpdate("end_time", e.timestamp);
              onValueUpdate("end_time_timezone", e.timezone);
            }}
          />
          <Typography variant="heading">Description</Typography>
          <StyledMultilineInput
            text={project.description}
            onChange={(e) => onValueUpdate("description", e)}
            placeholder="Enter project description"
            rows={10}
          />

          <Typography variant="heading">Credits</Typography>
          <Typography variant="body3">
            Please follow placeholder styling
          </Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <div style={{ width: "50%" }}>
              <StyledMultilineInput
                text={project.credits}
                onChange={(e) => {
                  onValueUpdate("credits", `{${e}}`);
                  setDataIsStale(true); // Ensure the data is marked stale to refresh the credits display
                }}
                placeholder={`
###### Presented by
#### Organization Name

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
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                width: "50%",
              }}
            >
              <Credits credits={project.credits ? project.credits : []} />
            </div>
          </div>
        </AccordionItem>
        <AccordionItem title="Project Settings">
          <StyledCheckbox
            checked={!!project.visible_on_homepage}
            onChange={(e) => {
              logger("setting visible on homepage to ", e);
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
        <AccordionItem title="Manage Collaborators">
          <Typography variant="heading">Collaborators</Typography>
          <Typography variant="body3" style={{ marginBottom: "1rem" }}>
            Add or remove collaborators by their email addresses. They will be
            sent an invitation to join the project.
          </Typography>

          <ManageCollaborators
            project={project}
            onValueUpdate={onValueUpdate}
          />
        </AccordionItem>
        <AccordionItem title="Assets">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "#232323",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <StageContextProvider slug={project.url_slug}>
                <AssetMangementPanel showSetHomepageImage={true} />
              </StageContextProvider>
            </div>
          </div>
        </AccordionItem>
      </div>
    </>
  );
};
export default function AdminPage() {
  const { user } = useAuthContext();
  const [currentlyEditingProject, setCurrentlyEditingProject] = useState(null);
  const { projectInfo, setDataIsStale } = useProjectInfoForAdminPage();

  useEffect(() => {
    if (!currentlyEditingProject) return;
    setCurrentlyEditingProject((prev) => {
      return projectInfo.find((project) => project.id === prev?.id) || null;
    });
  }, [projectInfo, currentlyEditingProject]);

  if (!user) return null;
  return (
    <>
      <NavBar />
      <div className={styles.adminPageContainer}>
        {/* <VenueAdministration /> */}
        {!currentlyEditingProject && (
          <ProjectList
            setCurrentlyEditingProject={setCurrentlyEditingProject}
            projectInfo={projectInfo}
            setDataIsStale={setDataIsStale}
          />
        )}
        {currentlyEditingProject && (
          <ProjectEditor
            project={currentlyEditingProject}
            setCurrentlyEditingProject={setCurrentlyEditingProject}
            setDataIsStale={setDataIsStale}
          />
        )}
      </div>
    </>
  );
}
