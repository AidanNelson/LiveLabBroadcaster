"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import Typography from "@/components/Typography";
import { Plus, X, Edit2 } from "lucide-react";

export const CreditsEditor = ({ value = [], onChange, className }) => {
  const [credits, setCredits] = useState(value);
  const [activeTab, setActiveTab] = useState("0");

  // Update local state when value prop changes
  useEffect(() => {
    setCredits(value);
  }, [value]);

  // Initialize with one page if empty
  useEffect(() => {
    if (credits.length === 0) {
      const initialCredits = [""];
      setCredits(initialCredits);
      onChange?.(initialCredits);
    }
  }, [credits.length, onChange]);

  const handlePageChange = (index, newValue) => {
    const updatedCredits = credits.map((page, i) => 
      i === index ? newValue : page
    );
    setCredits(updatedCredits);
    onChange?.(updatedCredits);
  };

  const addPage = () => {
    const updatedCredits = [...credits, ""];
    setCredits(updatedCredits);
    onChange?.(updatedCredits);
    setActiveTab(credits.length.toString());
  };

  const removePage = (index) => {
    if (credits.length <= 1) return; // Don't allow removing the last page
    
    const updatedCredits = credits.filter((_, i) => i !== index);
    setCredits(updatedCredits);
    onChange?.(updatedCredits);
    
    // Switch to previous tab if current tab was removed
    if (parseInt(activeTab) >= updatedCredits.length) {
      setActiveTab((updatedCredits.length - 1).toString());
    }
  };

  if (credits.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Typography variant="subheading">Credits Pages</Typography>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPage}
          className="flex items-center gap-2 bg-[var(--ui-dark-grey)] border-[var(--ui-light-grey)] text-[var(--text-primary-color)] hover:bg-[var(--ui-grey)]"
        >
          <Plus className="h-4 w-4" />
          Add Page
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList 
          className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 bg-[var(--ui-dark-grey)] border border-[var(--ui-light-grey)]"
          style={{ backgroundColor: 'var(--ui-dark-grey)' }}
        >
          {credits.map((page, index) => (
            <TabsTrigger 
              key={index} 
              value={index.toString()}
              className="relative group data-[state=active]:bg-[var(--ui-grey)] data-[state=active]:text-[var(--text-primary-color)] text-[var(--text-secondary-color)] hover:text-[var(--text-primary-color)]"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Edit2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Page {index + 1}</span>
                {credits.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--ui-light-grey)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePage(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {credits.map((page, index) => (
          <TabsContent key={index} value={index.toString()} className="space-y-4">
            <div className="space-y-2">
              <Label 
                htmlFor={`page-content-${index}`}
                className="text-[var(--text-primary-color)]"
              >
                Page {index + 1} Content
              </Label>
              <RichTextEditor
                value={page || ""}
                onChange={(value) => handlePageChange(index, value)}
                placeholder="Enter credits content for this page..."
                className="w-full"
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CreditsEditor;
