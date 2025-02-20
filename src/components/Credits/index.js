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

// export const InfoPanelCredits = ({ credits }) => {
//   const [combinedCredits] = useState(() => {
//     let combined = "";
//     credits.forEach((creditPage) => {
//       // remove # from start of string
//       combined += creditPage.replace(/^#/, "");
//     });
//     return combined;
//   });

//   return (
//     <>
//       <MarkdownTypography>{combinedCredits}</MarkdownTypography>
//     </>
//   );
// };
