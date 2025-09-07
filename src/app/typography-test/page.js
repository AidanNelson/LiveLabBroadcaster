"use client";

import Typography from "@/components/Typography";

export default function TypographyTestPage() {
  const variants = [
    "hero",
    "subhero", 
    "title",
    "subtitle",
    "heading",
    "subheading",
    "body1",
    "body2",
    "body3",
    "buttonLarge",
    "buttonSmall"
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <Typography variant="hero">Typography Scale Test</Typography>
          <Typography variant="subtitle" className="mt-4">
            All available typography variants displayed with their names
          </Typography>
        </div>

        <div className="space-y-6">
          {variants.map((variant) => (
            <div key={variant} className="border-b border-gray-200 pb-4">
              <div className="mb-2">
                <Typography variant="body3" className="text-gray-500 font-mono">
                  variant="{variant}"
                </Typography>
              </div>
              <Typography variant={variant}>
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Typography>
            </div>
          ))}
        </div>

        <div className="mt-16 p-6 bg-gray-50 rounded-lg">
          <Typography variant="heading" className="mb-4">Sample Text</Typography>
          <Typography variant="body2" className="mb-4">
            Here's how the typography variants look with actual content. This is a sample paragraph 
            to demonstrate the different font sizes, weights, and spacing across the typography scale.
          </Typography>
          <Typography variant="body3" className="text-gray-600">
            The typography system uses responsive clamp() values for most variants, ensuring 
            consistent scaling across different screen sizes.
          </Typography>
        </div>
      </div>
    </div>
  );
}
