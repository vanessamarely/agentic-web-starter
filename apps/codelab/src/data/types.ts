export interface ParagraphBlock {
  type: "p";
  text: string;
}

export interface ListBlock {
  type: "list";
  items: string[];
}

export interface CodeBlock {
  type: "code";
  filename?: string;
  code: string;
}

export interface CalloutBlock {
  type: "callout";
  kind: "info" | "warning" | "success";
  text: string;
}

export interface TableBlock {
  type: "table";
  headers: string[];
  rows: string[][];
}

export interface DemoLinkBlock {
  type: "demo-link";
  label: string;
  url: string;
  note?: string;
}

export interface LinksBlock {
  type: "links";
  items: Array<{ label: string; url: string; description: string }>;
}

export type ContentBlock =
  | ParagraphBlock
  | ListBlock
  | CodeBlock
  | CalloutBlock
  | TableBlock
  | DemoLinkBlock
  | LinksBlock;

export interface Step {
  title: string;
  durationMinutes: number;
  blocks: ContentBlock[];
}

export interface Module {
  id: string;
  title: string;
  steps: Step[];
}
