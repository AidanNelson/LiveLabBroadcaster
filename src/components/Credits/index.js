import { MarkdownTypography } from "@/components/MarkdownTypography";
import { useState, useEffect } from "react";
import Typography from "@/components/Typography";

export const Credits = ({ credits }) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Handle both old string format and new array format
  const creditsArray = Array.isArray(credits) ? credits : [credits || ""];
  const currentCredits = creditsArray[currentPage] || "";

  useEffect(() => {
    if (creditsArray.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPage((currentPage) => {
        const nextPage = (currentPage + 1) % creditsArray.length;
        return nextPage;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [creditsArray.length]);
  
  return (
    <>
      <MarkdownTypography>{currentCredits}</MarkdownTypography>
    </>
  );
};

export const InfoPanelCredits = ({ credits }) => {
  const [combinedCredits] = useState(() => {
    // Handle both old string format and new array format
    const creditsArray = Array.isArray(credits) ? credits : [credits || ""];
    
    let combined = "";
    creditsArray.forEach((creditPage) => {
      const content = creditPage || "";
      // remove # from start of string
      combined += content.replace(/#/g, "") + "\n\n";
      combined = combined.replace(/&nbsp;/g, "\n");
    });
    return combined;
  });

  return (
    <>
      <MarkdownTypography
      >
        {combinedCredits}
      </MarkdownTypography>
    </>
  );
};
