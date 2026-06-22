import { highlightCode } from "@/lib/shiki-highlight";

interface RichTextData {
  id: string;
  text?: { content: string };
  href?: string;
  annotations?: { bold?: boolean; italic?: boolean; strikethrough?: boolean; code?: boolean };
}

interface NotionBlock {
  type: string;
  paragraph?: { rich_text?: RichTextData[] };
  heading_1?: { rich_text?: RichTextData[] };
  heading_2?: { rich_text?: RichTextData[] };
  heading_3?: { rich_text?: RichTextData[] };
  code?: { rich_text?: RichTextData[]; language?: string };
  image?: { file?: { url: string }; external?: { url: string }; caption?: RichTextData[] };
  bulleted_list_item?: { rich_text?: RichTextData[] };
  numbered_list_item?: { rich_text?: RichTextData[] };
  quote?: { rich_text?: RichTextData[] };
}

interface BlockRendererProps {
  block: NotionBlock;
}

// RichText 포맷팅 헬퍼
function RichText({ text }: { text: RichTextData }) {
  const { bold, italic, strikethrough, code } = text.annotations ?? {};

  let className = "";
  if (bold) className += "font-bold ";
  if (italic) className += "italic ";
  if (strikethrough) className += "line-through ";
  if (code) className += "bg-gray-200 px-2 py-1 rounded font-mono text-sm ";

  const content = text.text?.content || "";

  if (text.href) {
    return (
      <a href={text.href} className="text-blue-600 underline hover:opacity-80">
        {content}
      </a>
    );
  }

  return <span className={className}>{content}</span>;
}

export async function BlockRenderer({ block }: BlockRendererProps) {
  const { type } = block;

  switch (type) {
    case "paragraph":
      return (
        <p className="my-4 text-base leading-relaxed">
          {block.paragraph?.rich_text?.map((text) => (
            <RichText key={text.id} text={text} />
          ))}
        </p>
      );

    case "heading_1":
      return (
        <h1 className="text-3xl font-bold my-6">
          {block.heading_1?.rich_text
            ?.map((text) => text.text?.content || "")
            .join("")}
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="text-2xl font-bold my-4">
          {block.heading_2?.rich_text
            ?.map((text) => text.text?.content || "")
            .join("")}
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="text-xl font-bold my-3">
          {block.heading_3?.rich_text
            ?.map((text) => text.text?.content || "")
            .join("")}
        </h3>
      );

    case "code": {
      const code = block.code?.rich_text
        ?.map((t) => t.text?.content || "")
        .join("");
      const language = block.code?.language || "plain";

      let html = "";
      try {
        html = await highlightCode(code || "", language);
      } catch (error) {
        console.warn(
          `[BlockRenderer] 코드 강조 실패 (언어: ${language}):`,
          error
        );
      }

      if (html) {
        return (
          <div
            className="my-4 rounded-lg overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      return (
        <pre className="my-4 rounded-lg bg-gray-100 p-4 overflow-x-auto text-sm border border-gray-300">
          <code>{code}</code>
        </pre>
      );
    }

    case "image": {
      const imageUrl =
        block.image?.file?.url || block.image?.external?.url;
      const caption = block.image?.caption
        ?.map((t) => t.text?.content || "")
        .join("");

      if (!imageUrl) {
        return null;
      }

      return (
        <figure className="my-8">
          <img
            src={imageUrl}
            alt={caption || "Post image"}
            className="w-full rounded-lg"
          />
          {caption && (
            <figcaption className="text-center text-sm text-gray-600 mt-2">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "bulleted_list_item":
      return (
        <ul className="list-disc list-inside my-4">
          <li>
            {block.bulleted_list_item?.rich_text?.map((text) => (
              <RichText key={text.id} text={text} />
            ))}
          </li>
        </ul>
      );

    case "numbered_list_item":
      return (
        <ol className="list-decimal list-inside my-4">
          <li>
            {block.numbered_list_item?.rich_text?.map((text) => (
              <RichText key={text.id} text={text} />
            ))}
          </li>
        </ol>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700">
          {block.quote?.rich_text?.map((text) => (
            <RichText key={text.id} text={text} />
          ))}
        </blockquote>
      );

    case "divider":
      return <hr className="my-8 border-gray-300" />;

    // 지원하지 않는 블록 타입
    case "table":
    case "toggle":
    case "callout":
    case "video":
    case "audio":
    case "file":
      console.warn(`[BlockRenderer] 지원하지 않는 블록 타입: ${type}`);
      return null;

    default:
      console.warn(`[BlockRenderer] 알 수 없는 블록 타입: ${type}`);
      return null;
  }
}
