import { MarkdownTypography } from "@/components/MarkdownTypography";
import { useState, useEffect } from "react";
import Typography from "@/components/Typography";

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

export const InfoPanelCredits = ({ credits }) => {
  const [combinedCredits] = useState(() => {
    let combined = "";
    credits.forEach((creditPage) => {
      // remove # from start of string
      combined += creditPage.replace(/#/g, "") + "\n\n";
      combined = combined.replace(/&nbsp;/g, "\n");
    });
    return combined;
  });

  return (
    <>
      <Typography
        variant="body1"
        style={{ color: "var(--text-secondary-color)", whiteSpace: "pre-line" }}
      >
        {combinedCredits}
      </Typography>
    </>
  );
};
