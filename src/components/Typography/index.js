import React from "react";
import { cn } from "@/lib/utils";
import styles from "./Typography.module.scss";

const Typography = ({ variant, as, children, className, ...props }) => {
  // Map variants to semantic HTML tags
  const variantToTag = {
    hero: "h1",
    subhero: "h2",
    title: "h3",
    subtitle: "h4",
    heading: "h5",
    subheading: "h6",
    body1: "p",
    body2: "p",
    body3: "p",
    buttonLarge: "span",
    buttonSmall: "span",
  };

  // Default to the mapped tag, unless the 'as' prop is provided
  const Tag = as || variantToTag[variant] || "p";

  return (
    <Tag
      className={cn(styles[variant] || styles["body"], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Typography;
