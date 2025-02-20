import Typography from "@/components/Typography";
import Markdown from "react-markdown";

export const MarkdownTypography = ({ children }) => {
  return (
    <Markdown
      components={{
        h6: ({ node, ...props }) => (
          <Typography
            variant="subheading"
            style={{ color: "var(--text-secondary-color)" }}
            {...props}
          />
        ),
        h4: ({ node, ...props }) => (
          <Typography variant="subtitle" {...props} />
        ),
        h3: ({ node, ...props }) => <Typography variant="title" {...props} />,
        p: ({ node, ...props }) => <Typography variant="body1" {...props} />,
      }}
    >
      {children}
    </Markdown>
  );
};