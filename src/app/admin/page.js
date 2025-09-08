"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import Typography from "@/components/Typography";
// Removed SCSS module import - using Tailwind classes instead
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NavBar } from "@/components/NavBar";
import { useProjectInfoForAdminPage } from "@/hooks/useProjectInfoForAdminPage";
import Link from "next/link";
import { supabase } from "@/components/SupabaseClient";
import { useState, useEffect } from "react";
import { Settings, Trash2 } from "lucide-react";
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
            href={`/admin/live/${project.url_slug}?tab=lobby`}
          >
            Enter Lobby
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link
            href={`/admin/live/${project.url_slug}?tab=stage`}
          >
            Enter Stage
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link
            href={`/admin/live/${project.url_slug}?tab=stream`}
          >
            Enter Broadcaster
          </Link>
        </Button>
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/admin/${project.url_slug}`}>
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          size="sm"
          variant="ghost"
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
                    console.error("Error deleting production:", error);
                  } else {
                    logger("Production deleted successfully");
                    setDataIsStale(true);
                    // router.refresh(); // Refresh the page to update the list
                  }
                });
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const ProjectList = ({
  projectInfo,
  setDataIsStale,
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
        .insert({ title: "New Production - " + new Date().toLocaleDateString(), collaborator_ids: [user.id] })
        .select();
      if (error) {
        console.error("Error creating new production:", error);
      } else {
        logger("Successfully created new production:", data);
        setDataIsStale(true);
        // Redirect to the new project editor
        window.location.href = `/admin/${data[0].url_slug}`;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center mb-4">
        <Typography variant={"hero"}>Productions</Typography>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => {
            addStage();
          }}
        >
          Add Production
        </Button>
      </div>

      {recentAndUpcomingProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
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

export default function AdminPage() {
  const { user } = useAuthContext();
  const { projectInfo, setDataIsStale } = useProjectInfoForAdminPage();

  if (!user) return null;
  return (
    <>
      <NavBar />
      <div className="px-8 pt-16 mx-auto w-full max-w-screen-lg">
        <ProjectList
          projectInfo={projectInfo}
          setDataIsStale={setDataIsStale}
        />
      </div>
    </>
  );
}
