"use client";

import { useAuthContext } from "@/components/AuthContextProvider";
import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { supabase } from "@/components/SupabaseClient";
import { useState, useEffect } from "react";
import { ProductionEditor } from "@/components/Admin/ProductionEditor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from 'react'


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
        <div className="mb-6">
          <Button asChild size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Productions
            </Link>
          </Button>
        </div>
        <ProductionEditor project={project} />
      </div>
    </>
  );
}
