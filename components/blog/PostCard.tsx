// 포스트 목록 카드 컴포넌트
// 홈 페이지에서 각 블로그 포스트를 카드 형태로 표시합니다.

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NotionPost } from "@/types/notion";

interface PostCardProps {
  post: NotionPost;
}

export function PostCard({ post }: PostCardProps) {
  // 게시 날짜 포맷 (YYYY년 MM월 DD일)
  const formattedDate = post.publishedAt
    ? new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(post.publishedAt))
    : null;

  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        {/* 커버 이미지 */}
        {post.coverImage && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <CardHeader className="pb-2">
          {/* 날짜 */}
          {formattedDate && (
            <time
              dateTime={post.publishedAt ?? undefined}
              className="text-sm text-muted-foreground"
            >
              {formattedDate}
            </time>
          )}

          {/* 제목 */}
          <h2 className="line-clamp-2 text-xl font-semibold leading-snug group-hover:underline">
            {post.title}
          </h2>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {/* 요약 */}
          {post.excerpt && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          {/* 태그 목록 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
