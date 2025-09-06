"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import Typography from "@/components/Typography";
// Removed SCSS module import - using Tailwind classes instead
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

const formatStartEndDatesAsString = (startTime, endTime) => {
  if (!startTime) return "";
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (!endTime) {
    return `${start.toLocaleString("en-US", {
      month: "long",
    })} ${start.getDate()}, ${start.getFullYear()}`;
  }
  const month = start.toLocaleString("en-US", { month: "long" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();

  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${month} ${startDay} - ${endDay}, ${year}`;
  } else {
    // If months/years differ, show full range
    const endMonth = end.toLocaleString("en-US", { month: "long" });
    const endYear = end.getFullYear();
    return `${month} ${startDay}, ${year} - ${endMonth} ${endDay}, ${endYear}`;
  }
};

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
    <div className="relative flex flex-col p-6 bg-[var(--ui-dark-grey)] rounded-lg">
      <div className="flex flex-row items-start">
        <Typography variant={"subtitle"}>{project.title}</Typography>
        <Typography className="ml-8" variant={"body3"}>
          {formatStartEndDatesAsString(project.start_time, project.end_time)}
        </Typography>
      </div>
      <div className="flex mt-4">
        <Button asChild size="sm" >
          <Link
            href={`/admin/${project.url_slug}?tab=lobby`}
          >
            Enter Lobby
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link
            href={`/admin/${project.url_slug}?tab=stage`}
          >
            Enter Stage
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link
            href={`/admin/${project.url_slug}?tab=stream`}
          >
            Enter Broadcaster
          </Link>
        </Button>
      </div>

      <div className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-[var(--text-primary-color)] text-base">
        <Button
          size="sm"
          onClick={() => setCurrentlyEditingProject(project)}
        >
          Edit
        </Button>
        <Button
          size="sm"
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

  // Split projects into recent/upcoming and others
  const [recentAndUpcomingProjects, archivedProjects] = projectInfo.reduce(
    ([recent, archive], project) => {
      if (project.start_time === null) {
        recent.push(project);
      } else {
        const startTime = new Date(project.start_time);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        if (startTime > oneMonthAgo) {
          recent.push(project);
        } else {
          archive.push(project);
        }
      }
      return [recent, archive];
    },
    [[], []],
  );

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
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center mb-4">
        <Typography variant={"hero"}>Projects</Typography>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => {
            addStage();
          }}
        >
          Add Project
        </Button>
      </div>

      {recentAndUpcomingProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          setCurrentlyEditingProject={setCurrentlyEditingProject}
          setDataIsStale={setDataIsStale}
        />
      ))}
      <Accordion type="single" collapsible>
        <AccordionItem value="archive">
          <AccordionTrigger>
            <Typography variant="title">Archive</Typography>
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="flex flex-col gap-8 mt-8">
              {archivedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  setCurrentlyEditingProject={setCurrentlyEditingProject}
                  setDataIsStale={setDataIsStale}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// Removed custom AccordionItem - using shadcn Accordion components instead

// Removed StyledMultilineInput - using shadcn Textarea + Label directly

// Removed StyledInput - using shadcn Input + Label directly
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
        <div className="space-y-2">
          <Label htmlFor="collaborator-emails">Collaborator Emails</Label>
          <Input
            id="collaborator-emails"
            type="text"
            value={emails.join(", ")}
            onChange={(e) => {
              const emailList = e.target.value
                .split(",")
                .map((email) => email.trim())
                .filter(Boolean);
              setEmails(emailList);
            }}
            placeholder="Enter collaborator emails, separated by commas"
            className="w-full"
          />
        </div>
        <Button
          variant="default"
          size="sm"
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
      <div className="flex flex-col gap-8">
        <div
          style={{ display: "flex", flexDirection: "row", alignItems: "start" }}
        >
          <Button
            size="sm"
            onClick={() => {
              setCurrentlyEditingProject(null);
            }}
          >
            &larr; Back
          </Button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <Typography variant={"hero"}>Edit Project</Typography>
          {/* <Button size="large" variant="secondary" onClick={() => {}}>
            Save
          </Button> */}
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="contents">
            <AccordionTrigger>
              <Typography variant="heading">Project Contents</Typography>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="flex flex-col gap-8">
                <div className="space-y-2">
                  <Label htmlFor="project-title">Project Title</Label>
                  <Input
                    id="project-title"
                    type="text"
                    value={project.title || ""}
                    onChange={(e) => onValueUpdate("title", e.target.value)}
                    placeholder="Enter project title"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-url-slug">Project URL Slug</Label>
                  <Input
                    id="project-url-slug"
                    type="text"
                    value={project.url_slug || ""}
                    onChange={(e) => onValueUpdate("url_slug", e.target.value)}
                    placeholder="Enter project url slug"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datetime-info">Date/Time Info (Shown on Top-Right of Project Card)</Label>
                  <Textarea
                    id="datetime-info"
                    value={project.datetime_info || ""}
                    onChange={(e) => onValueUpdate("datetime_info", e.target.value)}
                    placeholder={`### June 1 - 3 
### 7:00pm ET`}
                    rows={4}
                    className="w-full min-h-[100px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-datetime">Starting Date/Time</Label>
                  <DateTimeWithTimezoneInput
                    id="start-datetime"
                    timestamp={project.start_time}
                    timezone={project.start_time_timezone}
                    onChange={(e) => {
                      onValueUpdate("start_time", e.timestamp);
                      onValueUpdate("start_time_timezone", e.timezone);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-datetime">Ending Date/Time</Label>
                  <DateTimeWithTimezoneInput
                    id="end-datetime"
                    timestamp={project.end_time}
                    timezone={project.end_time_timezone}
                    onChange={(e) => {
                      onValueUpdate("end_time", e.timestamp);
                      onValueUpdate("end_time_timezone", e.timezone);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={project.description || ""}
                    onChange={(e) => onValueUpdate("description", e.target.value)}
                    placeholder="Enter project description"
                    rows={10}
                    className="w-full min-h-[100px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-credits">Credits</Label>
                  <Typography variant="body3">
                    Please follow placeholder styling
                  </Typography>
                  <div className="flex flex-row items-center gap-4 mt-4">
                    <div className="w-1/2">
                      <Textarea
                        id="project-credits"
                        value={project.credits || ""}
                        onChange={(e) => {
                          onValueUpdate("credits", `{${e.target.value}}`);
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
                        className="w-full min-h-[100px] resize-y"
                      />
                    </div>

                    <div className="flex flex-col items-start w-1/2">
                      <Credits credits={project.credits ? project.credits : []} />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="settings">
            <AccordionTrigger>
              <Typography variant="heading">Project Settings</Typography>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="flex flex-col gap-8">
                <StyledCheckbox
                  checked={!!project.visible_on_homepage}
                  onChange={(e) => {
                    logger("setting visible on homepage to ", e);
                    onValueUpdate("visible_on_homepage", e);
                  }}
                  label="Visible on Homepage?"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="collaborators">
            <AccordionTrigger>
              <Typography variant="heading">Manage Collaborators</Typography>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="flex flex-col gap-8">
                <Typography variant="heading">Collaborators</Typography>
                <Typography variant="body3" className="mb-4">
                  Add or remove collaborators by their email addresses. They will be
                  sent an invitation to join the project.
                </Typography>

                <ManageCollaborators
                  project={project}
                  onValueUpdate={onValueUpdate}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="assets">
            <AccordionTrigger>
              <Typography variant="heading">Assets</Typography>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="flex items-center justify-center">
                <div className="bg-[#232323] rounded-lg flex items-center justify-center w-full">
                  <StageContextProvider slug={project.url_slug}>
                    <AssetMangementPanel showSetHomepageImage={true} />
                  </StageContextProvider>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
      <div className="px-8 pt-16">
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
