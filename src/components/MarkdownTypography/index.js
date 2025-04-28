import Typography from "@/components/Typography";
import Markdown from "react-markdown";

export const MarkdownTypography = ({ children }) => {
  return (
    <Markdown
      components={{
        h3: ({ node, ...props }) => (
          <Typography
            variant="subheading"
            style={{ color: "var(--text-secondary-color)" }}
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <Typography variant="subtitle" {...props} />
        ),
        h1: ({ node, ...props }) => <Typography variant="title" {...props} />,
        p: ({ node, ...props }) => <Typography variant="body1" {...props} />,
      }}
    >
      {children}
    </Markdown>
  );
};