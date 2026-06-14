// Notion 블록 렌더러 컴포넌트
// Notion API 블록 데이터를 HTML 요소로 변환합니다.
// 지원 블록 타입: paragraph, heading_1~3, code, image, quote, divider,
//               bulleted_list_item, numbered_list_item, callout, to_do

import type { NotionBlock, NotionRichText } from "@/types/notion";

interface NotionRendererProps {
  blocks: NotionBlock[];
}

/** 리치 텍스트 배열을 JSX로 렌더링 (Bold, Italic, Code, Link 지원) */
function RichText({ richText }: { richText: NotionRichText[] }) {
  return (
    <>
      {richText.map((span, index) => {
        const { bold, italic, strikethrough, underline, code } = span.annotations;
        const text = span.plain_text;
        const href = span.href ?? span.text?.link?.url ?? null;

        let content: React.ReactNode = text;

        // 코드 인라인
        if (code) {
          content = (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              {text}
            </code>
          );
        }

        // 텍스트 서식 적용
        if (bold) content = <strong>{content}</strong>;
        if (italic) content = <em>{content}</em>;
        if (strikethrough) content = <del>{content}</del>;
        if (underline) content = <u>{content}</u>;

        // 링크 적용
        if (href) {
          content = (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:opacity-80"
            >
              {content}
            </a>
          );
        }

        return <span key={index}>{content}</span>;
      })}
    </>
  );
}

/** 단일 블록을 렌더링 */
function Block({ block }: { block: NotionBlock }) {
  const { type } = block;
  const blockData = block[type];

  if (!blockData) return null;

  switch (type) {
    case "paragraph":
      return (
        <p className="leading-7 [&:not(:first-child)]:mt-4">
          <RichText richText={blockData.rich_text ?? []} />
        </p>
      );

    case "heading_1":
      return (
        <h1 className="mt-8 scroll-m-20 text-3xl font-bold tracking-tight first:mt-0">
          <RichText richText={blockData.rich_text ?? []} />
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="mt-6 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0">
          <RichText richText={blockData.rich_text ?? []} />
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="mt-4 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0">
          <RichText richText={blockData.rich_text ?? []} />
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="mt-1 leading-7">
          <RichText richText={blockData.rich_text ?? []} />
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="mt-1 leading-7">
          <RichText richText={blockData.rich_text ?? []} />
        </li>
      );

    case "quote":
      return (
        <blockquote className="mt-4 border-l-4 border-border pl-4 italic text-muted-foreground">
          <RichText richText={blockData.rich_text ?? []} />
        </blockquote>
      );

    case "code":
      // 코드 블록 (구문 강조는 NotionCodeBlock 컴포넌트에서 처리)
      return (
        <NotionCodeBlock
          code={blockData.rich_text?.map((t: NotionRichText) => t.plain_text).join("") ?? ""}
          language={blockData.language ?? "plaintext"}
        />
      );

    case "image": {
      // 이미지 블록 (파일 업로드 또는 외부 URL)
      const imageUrl =
        blockData.type === "file"
          ? blockData.file?.url
          : blockData.external?.url;
      const caption = blockData.caption
        ?.map((t: NotionRichText) => t.plain_text)
        .join("") ?? "";

      if (!imageUrl) return null;

      return (
        <figure className="my-6">
          <div className="relative overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={caption || "포스트 이미지"}
              className="w-full rounded-lg"
            />
          </div>
          {caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "divider":
      return <hr className="my-6 border-border" />;

    case "callout":
      return (
        <div className="my-4 flex gap-3 rounded-lg border border-border bg-muted/50 p-4">
          {blockData.icon?.emoji && (
            <span className="shrink-0 text-xl">{blockData.icon.emoji}</span>
          )}
          <div className="leading-7">
            <RichText richText={blockData.rich_text ?? []} />
          </div>
        </div>
      );

    case "to_do":
      return (
        <div className="mt-1 flex items-start gap-2">
          <input
            type="checkbox"
            checked={blockData.checked ?? false}
            readOnly
            className="mt-1 h-4 w-4 shrink-0 rounded border-border"
          />
          <span className={blockData.checked ? "line-through text-muted-foreground" : ""}>
            <RichText richText={blockData.rich_text ?? []} />
          </span>
        </div>
      );

    default:
      // 지원하지 않는 블록 타입은 무시
      return null;
  }
}

/**
 * 코드 블록 컴포넌트
 * 복사 버튼과 언어 레이블을 포함합니다.
 * Shiki 서버사이드 하이라이팅은 포스트 페이지에서 처리합니다.
 */
function NotionCodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-border bg-muted">
      {/* 언어 레이블 */}
      <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {language}
        </span>
      </div>
      {/* 코드 영역 */}
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm">{code}</code>
      </pre>
    </div>
  );
}

/**
 * 블록 목록을 순서대로 렌더링합니다.
 * 인접한 bulleted/numbered 블록을 자동으로 ul/ol로 묶습니다.
 */
export function NotionRenderer({ blocks }: NotionRendererProps) {
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    // 불릿 목록 그룹핑
    if (block.type === "bulleted_list_item") {
      const listItems: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        listItems.push(blocks[i]);
        i++;
      }
      elements.push(
        <ul key={`ul-${block.id}`} className="my-4 ml-6 list-disc space-y-1">
          {listItems.map((item) => (
            <Block key={item.id} block={item} />
          ))}
        </ul>
      );
      continue;
    }

    // 번호 목록 그룹핑
    if (block.type === "numbered_list_item") {
      const listItems: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        listItems.push(blocks[i]);
        i++;
      }
      elements.push(
        <ol key={`ol-${block.id}`} className="my-4 ml-6 list-decimal space-y-1">
          {listItems.map((item) => (
            <Block key={item.id} block={item} />
          ))}
        </ol>
      );
      continue;
    }

    elements.push(<Block key={block.id} block={block} />);
    i++;
  }

  return <div className="prose-notion">{elements}</div>;
}
