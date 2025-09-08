"use client";

import { useAuthContext } from "@/components/AuthContextProvider";
import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NavBar } from "@/components/NavBar";
import Link from "next/link";
import { supabase } from "@/components/SupabaseClient";
import { useCallback, useState, useEffect, useRef } from "react";
import { StageContextProvider } from "@/components/StageContext";
import { AssetMangementPanel } from "@/components/Editor/AssetManagementPanel";
import { DateTimeWithTimezoneInput } from "@/components/Admin/DateTimeInput";
import RichTextEditor from "@/components/RichTextEditor";
import { CreditsEditor } from "@/components/Credits/CreditsEditor";
import { ArrowLeft } from "lucide-react";
import { use } from 'react'
import debug from "debug";
const logger = debug("broadcaster:admin");

const ManageCollaborators = ({ project, handleLocalChange }) => {
  const [emails, setEmails] = useState([]);
  const [currentCollaboratorEmails, setCurrentCollaboratorEmails] = useState(
    [],
  );
  const [allCollaboratorEmails, setAllCollaboratorEmails] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

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

  useEffect(() => {
    const fetchAllCollaboratorEmails = async () => {
      const { data, error } = await supabase
        .from("public_users")
        .select("email");
      if (error) {
        console.error("Error fetching all user emails:", error);
      } else {
        setAllCollaboratorEmails(data.map((user) => user.email));
      }
    };
    fetchAllCollaboratorEmails();
  }, []);

  // Handle input change and filter suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length >= 2) {
      const filtered = allCollaboratorEmails.filter(email => 
        email.toLowerCase().includes(value.toLowerCase()) &&
        !currentCollaboratorEmails.includes(email)
      );
      setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (email) => {
    setInputValue("");
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Add the email to the emails array
    const newEmails = [...emails, email];
    setEmails(newEmails);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="collaborator-emails">Collaborator Emails</Label>
        <div className="flex flex-row items-center gap-4 relative">
          <div className="flex-1 relative">
            <Input
              id="collaborator-emails"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type at least 2 characters to see suggestions"
              className="w-full"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-primary border border-gray-300 rounded-md shadow-lg max-h-[10rem] overflow-y-auto">
                {suggestions.map((email, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-800 cursor-pointer text-sm"
                    onClick={() => handleSuggestionClick(email)}
                  >
                    {email}
                  </div>
                ))}
              </div>
            )}
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
                handleLocalChange("collaborator_ids", [
                  ...(project.collaborator_ids || []),
                  user.id,
                ]);
              } else {
                logger("User does not exist with email:", email);
              }
            });
            setEmails([]); // Clear the emails array after processing
          }}
        >
          Add Selected
        </Button>
        </div>
        
        {emails.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Emails</Label>
            <div className="flex flex-wrap gap-2">
              {emails.map((email, index) => (
                <div
                  key={index}
                  className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {email}
                  <button
                    onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                    className="text-primary-foreground/70 hover:text-primary-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {currentCollaboratorEmails.length > 0 && (
        <div className="space-y-2">
          <Label>Current Collaborators</Label>
          <ul className="list-none p-0 space-y-2">
            {currentCollaboratorEmails.map((email, index) => (
              <li
                key={index}
                className="pb-2 pl-4"
              >
                <Typography variant="body3">{email}</Typography>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ProjectEditor = ({ project }) => {
  logger("Editing production:", project);

  // Local state for form fields
  const [localProject, setLocalProject] = useState(project);
  const debounceTimeoutRef = useRef({});

  // Update local state when project prop changes
  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Debounced database update function
  const debouncedUpdate = useCallback(
    (key, value) => {
      // Clear existing timeout for this field
      if (debounceTimeoutRef.current[key]) {
        clearTimeout(debounceTimeoutRef.current[key]);
      }

      // Set new timeout
      debounceTimeoutRef.current[key] = setTimeout(async () => {
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
      }, 500); // 500ms debounce
    },
    [project.id],
  );

  // Handle local state changes for text fields
  const handleLocalChange = useCallback(
    (key, value) => {
      setLocalProject(prev => ({ ...prev, [key]: value }));
      debouncedUpdate(key, value);
    },
    [debouncedUpdate],
  );

  return (
    <>
      <div className="flex flex-col gap-8">
        <div
          style={{ display: "flex", flexDirection: "row", alignItems: "start" }}
        >
          <Button asChild size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Productions
            </Link>
          </Button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <Typography variant={"hero"}>Edit Production</Typography>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger>
              <Typography variant="heading">Details</Typography>
            </AccordionTrigger>
            <AccordionContent className="px-8">
              <div className="flex flex-col gap-8">
                <div className="space-y-2">
                  <Label htmlFor="production-title">Title</Label>
                  <Input
                    id="production-title"
                    type="text"
                    value={localProject.title || ""}
                    onChange={(e) => handleLocalChange("title", e.target.value)}
                    placeholder="Enter production title"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="production-url-slug">
                    URL Slug
                    {localProject.url_slug && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (Preview: {typeof window !== 'undefined' ? window.location.origin : ''}/admin/{localProject.url_slug})
                      </span>
                    )}
                  </Label>
                  <Input
                    id="production-url-slug"
                    type="text"
                    value={localProject.url_slug || ""}
                    onChange={(e) => handleLocalChange("url_slug", e.target.value)}
                    placeholder="Enter production url slug"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-datetime">Starting Date/Time</Label>
                  <DateTimeWithTimezoneInput
                    id="start-datetime"
                    timestamp={project.start_time}
                    timezone={project.start_time_timezone}
                    onChange={(e) => {
                      handleLocalChange("start_time", e.timestamp);
                      handleLocalChange("start_time_timezone", e.timezone);
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
                      handleLocalChange("end_time", e.timestamp);
                      handleLocalChange("end_time_timezone", e.timezone);
                    }}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="landing-page">
            <AccordionTrigger>
              <Typography variant="heading">Landing Page Contents</Typography>
            </AccordionTrigger>
            <AccordionContent className="px-8">
              <div className="flex flex-col gap-8">
                <div className="space-y-2">
                  <Label htmlFor="datetime-info">Date/Time Info (Shown on Top-Right of Production Card)</Label>
                  <RichTextEditor
                    value={localProject.datetime_info || ""}
                    onChange={(value) => handleLocalChange("datetime_info", value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="production-description">Description</Label>
                  <RichTextEditor
                    value={localProject.description || ""}
                    onChange={(value) => handleLocalChange("description", value)}
                    placeholder="Enter production description"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="production-credits">Credits</Label>
                  <Typography variant="body3">
                    Create multiple credit pages that will cycle through automatically
                  </Typography>
                  <CreditsEditor
                    value={localProject.credits || []}
                    onChange={(value) => handleLocalChange("credits", value)}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="visible-on-homepage"
                    checked={!!localProject.visible_on_homepage}
                    onCheckedChange={(checked) => {
                      logger("setting visible on homepage to ", checked);
                      handleLocalChange("visible_on_homepage", checked);
                    }}
                  />
                  <Label htmlFor="visible-on-homepage">Visible on Homepage?</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="collaborators">
            <AccordionTrigger>
              <Typography variant="heading">Collaborators</Typography>
            </AccordionTrigger>
            <AccordionContent className="px-8 min-h-[400px]">
              <div className="flex flex-col gap-8">
                <Typography variant="body3">
                  Add or remove collaborators by their email addresses.
                </Typography>
                <ManageCollaborators
                  project={project}
                  handleLocalChange={handleLocalChange}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="assets">
            <AccordionTrigger>
              <Typography variant="heading">Assets</Typography>
            </AccordionTrigger>
            <AccordionContent className="px-8">
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

export default function AdminProjectPage({ params }) {
  const { slug } =  use(params);
  const { user } = useAuthContext();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from("stages")
          .select("*")
          .eq("url_slug", slug)
          .single();
        
        if (error) {
          console.error("Error fetching project:", error);
        } else {
          setProject(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  if (!user) return null;
  
  if (loading) {
    return (
      <>
        <NavBar />
        <div className="px-8 pt-16 mx-auto w-full max-w-screen-lg">
          <Typography variant="hero">Loading...</Typography>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <NavBar />
        <div className="px-8 pt-16 mx-auto w-full max-w-screen-lg">
          <Typography variant="hero">Production not found</Typography>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="px-8 pt-16 mx-auto w-full max-w-screen-lg">
        <ProjectEditor project={project} />
      </div>
    </>
  );
}
