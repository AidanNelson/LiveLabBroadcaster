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
  const [pageKeys, setPageKeys] = useState([]);

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

  // Generate stable keys for pages
  useEffect(() => {
    if (credits.length !== pageKeys.length) {
      const newKeys = credits.map((_, index) => `page-${Date.now()}-${index}`);
      setPageKeys(newKeys);
    }
  }, [credits.length, pageKeys.length]);

  const handlePageChange = (index, newValue) => {
    const updatedCredits = credits.map((page, i) => 
      i === index ? newValue : page
    );
    setCredits(updatedCredits);
    onChange?.(updatedCredits);
  };

  const addPage = () => {
    if (credits.length >= 4) return; // Maximum 4 pages
    const updatedCredits = [...credits, ""];
    setCredits(updatedCredits);
    onChange?.(updatedCredits);
    setActiveTab(credits.length.toString());
  };

  const removePage = (index) => {
    if (credits.length <= 1) return; // Don't allow removing the last page
    
    const updatedCredits = credits.filter((_, i) => i !== index);
    const updatedKeys = pageKeys.filter((_, i) => i !== index);
    setCredits(updatedCredits);
    setPageKeys(updatedKeys);
    onChange?.(updatedCredits);
    
    // Switch to previous tab if current tab was removed
    const currentTabIndex = parseInt(activeTab);
    if (currentTabIndex >= updatedCredits.length) {
      // If we removed the last tab, go to the new last tab
      setActiveTab((updatedCredits.length - 1).toString());
    } else if (currentTabIndex > index) {
      // If we removed a tab before the current one, adjust the index
      setActiveTab((currentTabIndex - 1).toString());
    }
    // If we removed a tab after the current one, stay on the same index
  };

  if (credits.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Typography variant="body3">Credits Pages</Typography>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPage}
          disabled={credits.length >= 4}
          className="flex items-center gap-2 bg-[var(--ui-dark-grey)] border-[var(--ui-light-grey)] text-[var(--text-primary-color)] hover:bg-[var(--ui-grey)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Add Page ({credits.length}/4)
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList 
          className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 bg-transparent border-none p-0 h-auto"
        >
          {credits.map((page, index) => (
            <TabsTrigger 
              key={pageKeys[index] || `tab-${index}`}
              value={index.toString()}
              className="relative group bg-transparent border-none rounded-none p-2 text-[var(--text-secondary-color)] hover:text-[var(--text-primary-color)] data-[state=active]:text-[var(--text-primary-color)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--text-primary-color)] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <div className="flex items-center justify-between w-full min-w-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Edit2 className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Page {index + 1}</span>
                </div>
                {credits.length > 1 && (
                  <div
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--ui-light-grey)] rounded flex items-center justify-center cursor-pointer flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePage(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </div>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {credits.map((page, index) => (
          <TabsContent 
            key={pageKeys[index] || `content-${index}`}
            value={index.toString()} 
            className="space-y-4"
          >
            <RichTextEditor
              value={page || ""}
              onChange={(value) => handlePageChange(index, value)}
              placeholder="Enter credits content for this page..."
              className="w-full"
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CreditsEditor;