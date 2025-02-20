import { MarkdownTypography } from "@/components/MarkdownTypography";
import { useState, useEffect } from "react";

export const Credits = ({ credits }) => {
    const [currentPage, setCurrentPage] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentPage((currentPage) => {
          const nextPage = (currentPage + 1) % credits.length;
          return nextPage;
        });
      }, 5000);
  
      return () => clearInterval(interval);
    }, [setCurrentPage, credits]);
    return (
      <>
        <MarkdownTypography>{credits[currentPage]}</MarkdownTypography>
      </>
    );
  };