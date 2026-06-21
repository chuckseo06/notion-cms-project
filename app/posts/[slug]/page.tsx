import { getPostBySlug, getPostBlocks } from "@/lib/notion";
import { BlockRenderer } from "@/components/BlockRenderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 3600;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: PostPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "포스트를 찾을 수 없습니다",
      description: "요청하신 포스트를 찾을 수 없습니다."
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const postUrl = `${siteUrl}/posts/${slug}`;
  const description = post.excerpt || post.title;

  return {
    title: `${post.title} | 보석함`,
    description,
    keywords: [...post.tags, "블로그", "일상"],
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: postUrl,
      publishedTime: post.publishedAt.toISOString(),
      authors: ["보석함"],
      tags: post.tags,
      ...(post.coverImage && {
        images: [
          {
            url: post.coverImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(post.coverImage && {
        images: [post.coverImage],
      }),
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  if (!post.isPublished) {
    notFound();
  }

  const blocks = await getPostBlocks(post.id);

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      {/* 커버 이미지 */}
      {post.coverImage && (
        <div className="mb-8 -mx-4 md:mx-0 md:rounded-lg overflow-hidden bg-gray-200">
          <div className="relative w-full h-96">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1000px"
            />
          </div>
        </div>
      )}

      {/* 포스트 헤더 */}
      <header className="mb-12">
        {/* 제목 */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          {post.title}
        </h1>

        {/* 메타정보 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-gray-200">
          <time
            dateTime={post.publishedAt.toISOString()}
            className="text-sm text-gray-600"
          >
            {new Intl.DateTimeFormat("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(post.publishedAt)}
          </time>

          <div className="text-sm text-gray-500 mt-2 md:mt-0">
            읽기 시간: ~5분
          </div>
        </div>

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="inline-block px-3 py-1 text-xs font-semibold bg-rose-50 text-rose-700 rounded-full hover:bg-rose-100 transition"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* 요약 */}
        {post.excerpt && (
          <p className="text-lg text-gray-600 italic leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* 포스트 본문 */}
      <main className="prose prose-sm md:prose-base max-w-none mb-12">
        {blocks.length > 0 ? (
          blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            포스트 내용이 없습니다.
          </p>
        )}
      </main>

      {/* 포스트 푸터 */}
      <footer className="mt-16 pt-8 border-t border-gray-200">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-rose-500 hover:text-rose-600 transition font-medium"
          >
            <span className="mr-2">←</span>
            목록으로 돌아가기
          </Link>
        </div>

        {/* 관련 포스트 네비게이션 (선택적) */}
        <div className="text-xs text-gray-500">
          <p>공유하기:</p>
          <div className="flex gap-3 mt-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                post.title
              )}&url=${encodeURIComponent(
                `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/posts/${post.slug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600 transition"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </article>
  );
}
