import Typography from "@/components/Typography";
import Markdown from "react-markdown";

export const MarkdownTypography = ({ children }) => {
  return (
    <Markdown
      components={{
        // Headers - mapped to Typography variants
        h1: ({ node, ...props }) => <Typography variant="hero" {...props} />,
        h2: ({ node, ...props }) => <Typography variant="subhero" {...props} />,
        h3: ({ node, ...props }) => <Typography variant="title" {...props} />,
        h4: ({ node, ...props }) => <Typography variant="subtitle" {...props} />,
        h5: ({ node, ...props }) => <Typography variant="heading" {...props} />,
        h6: ({ node, ...props }) => (
          <Typography
            variant="subheading"
            style={{ color: "var(--text-secondary-color)" }}
            {...props}
          />
        ),
        // Paragraphs - mapped to body variants
        p: ({ node, ...props }) => <Typography variant="body3" {...props} />,
        // Text formatting
        strong: ({ node, ...props }) => (
          <Typography variant="body1" as="strong" {...props} />
        ),
        em: ({ node, ...props }) => (
          <Typography variant="body1" as="em" {...props} />
        ),
        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside space-y-1 my-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside space-y-1 my-2" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li>
            <Typography variant="body2" as="span" {...props} />
          </li>
        ),
        // Links
        a: ({ node, ...props }) => (
          <a 
            className="text-current hover:opacity-80 underline transition-opacity duration-200" 
            target="_blank" 
            rel="noopener noreferrer"
            {...props} 
          />
        ),
        // Horizontal rule
        hr: ({ node, ...props }) => (
          <hr className="border-gray-300 my-4" {...props} />
        ),
      }}
    >
      {children}
    </Markdown>
  );
};
