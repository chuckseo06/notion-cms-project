import { highlightCode } from "@/lib/shiki-highlight";

interface BlockRendererProps {
  block: any;
}

// RichText 포맷팅 헬퍼
function RichText({ text }: { text: any }) {
  const { bold, italic, strikethrough, code, underline, color } =
    text.annotations ?? {};

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

  try {
    switch (type) {
      case "paragraph":
        return (
          <p className="my-4 text-base leading-relaxed">
            {block.paragraph?.rich_text?.map((text: any) => (
              <RichText key={text.id} text={text} />
            ))}
          </p>
        );

      case "heading_1":
        return (
          <h1 className="text-3xl font-bold my-6">
            {block.heading_1?.rich_text
              ?.map((text: any) => text.text?.content || "")
              .join("")}
          </h1>
        );

      case "heading_2":
        return (
          <h2 className="text-2xl font-bold my-4">
            {block.heading_2?.rich_text
              ?.map((text: any) => text.text?.content || "")
              .join("")}
          </h2>
        );

      case "heading_3":
        return (
          <h3 className="text-xl font-bold my-3">
            {block.heading_3?.rich_text
              ?.map((text: any) => text.text?.content || "")
              .join("")}
          </h3>
        );

      case "code": {
        const code = block.code?.rich_text
          ?.map((t: any) => t.text?.content || "")
          .join("");
        const language = block.code?.language || "plain";

        try {
          const html = await highlightCode(code || "", language);

          return (
            <div
              className="my-4 rounded-lg overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (error) {
          console.warn(
            `[BlockRenderer] 코드 강조 실패 (언어: ${language}):`,
            error
          );
          return (
            <pre className="my-4 rounded-lg bg-gray-100 p-4 overflow-x-auto text-sm border border-gray-300">
              <code>{code}</code>
            </pre>
          );
        }
      }

      case "image": {
        const imageUrl =
          block.image?.file?.url || block.image?.external?.url;
        const caption = block.image?.caption
          ?.map((t: any) => t.text?.content || "")
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
              {block.bulleted_list_item?.rich_text?.map((text: any) => (
                <RichText key={text.id} text={text} />
              ))}
            </li>
          </ul>
        );

      case "numbered_list_item":
        return (
          <ol className="list-decimal list-inside my-4">
            <li>
              {block.numbered_list_item?.rich_text?.map((text: any) => (
                <RichText key={text.id} text={text} />
              ))}
            </li>
          </ol>
        );

      case "quote":
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700">
            {block.quote?.rich_text?.map((text: any) => (
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
  } catch (error) {
    console.error(`[BlockRenderer] 블록 렌더링 오류 (${type}):`, error);
    return (
      <div className="my-4 p-4 bg-red-100 border border-red-400 rounded text-red-700">
        블록 렌더링 중 오류 발생 (타입: {type})
      </div>
    );
  }
}
