import { useState } from "react";
import type { ContentBlock } from "../data/types";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="absolute right-2 top-2 rounded border border-[#3c4043] bg-[#2d2f31] px-2 py-1 text-[11px] font-medium text-[#e8eaed] hover:bg-[#3c4043]"
    >
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
}

const CALLOUT_STYLES = {
  info: "border-l-gdev-blue bg-[#e8f0fe] text-[#174ea6]",
  warning: "border-l-gdev-yellow bg-[#fef7e0] text-[#7c4a00]",
  success: "border-l-gdev-green bg-[#e6f4ea] text-[#0d652d]",
};

export function StepContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="codelab-prose">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "p":
            return <p key={index}>{block.text}</p>;

          case "list":
            return (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            );

          case "code":
            return (
              <div key={index} className="relative mb-5 max-w-[72ch]">
                {block.filename && (
                  <div className="rounded-t border border-b-0 border-[#3c4043] bg-[#202124] px-3 py-1.5 font-mono text-[11px] text-[#9aa0a6]">
                    {block.filename}
                  </div>
                )}
                <pre
                  className={`overflow-x-auto border border-[#3c4043] bg-[#202124] p-4 font-mono text-[12.5px] leading-relaxed text-[#e8eaed] ${
                    block.filename ? "rounded-b" : "rounded"
                  }`}
                >
                  <code>{block.code}</code>
                </pre>
                <CopyButton text={block.code} />
              </div>
            );

          case "callout":
            return (
              <div
                key={index}
                className={`mb-4 max-w-[68ch] rounded border-l-4 px-4 py-3 text-[14px] ${CALLOUT_STYLES[block.kind]}`}
              >
                {block.text}
              </div>
            );

          case "table":
            return (
              <div key={index} className="mb-5 max-w-full overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#dadce0]">
                      {block.headers.map((header, headerIndex) => (
                        <th key={headerIndex} className="px-3 py-2 font-medium text-[#5f6368]">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-[#e8eaed] align-top">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2.5 text-[#3c4043]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "demo-link":
            return (
              <div key={index} className="mb-5 max-w-[68ch]">
                <a
                  href={block.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded bg-gdev-blue px-4 py-2.5 text-sm font-medium text-white no-underline hover:bg-[#174ea6]"
                >
                  {block.label} <span aria-hidden="true">↗</span>
                </a>
                {block.note && <p className="mt-1.5 text-xs text-[#5f6368]">{block.note}</p>}
              </div>
            );

          case "links":
            return (
              <ul key={index} className="mb-4 space-y-2.5">
                {block.items.map((link, linkIndex) => (
                  <li key={linkIndex} className="max-w-[68ch] list-none border-l-2 border-[#dadce0] pl-3">
                    <a href={link.url} target="_blank" rel="noreferrer" className="font-medium">
                      {link.label} ↗
                    </a>
                    <p className="text-[13px] text-[#5f6368]">{link.description}</p>
                  </li>
                ))}
              </ul>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
