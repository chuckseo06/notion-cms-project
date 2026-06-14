"use client";

// 태그 필터 컴포넌트 (클라이언트 컴포넌트)
// 태그를 클릭하면 URL searchParams를 업데이트하여 필터링합니다.
// 서버 컴포넌트와 분리하여 인터랙티브 동작만 처리합니다.

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: string[];
  selectedTag?: string;
}

export function TagFilter({ tags, selectedTag }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 태그 선택/해제 핸들러
  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedTag === tag) {
      // 이미 선택된 태그 클릭 시 필터 해제
      params.delete("tag");
    } else {
      params.set("tag", tag);
    }

    router.push(`/?${params.toString()}`);
  };

  // 전체 보기 (필터 초기화)
  const handleClearFilter = () => {
    router.push("/");
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 전체 보기 버튼 */}
      <Button
        variant={selectedTag ? "outline" : "default"}
        size="sm"
        onClick={handleClearFilter}
        className="h-7"
      >
        전체
      </Button>

      {/* 태그 배지 목록 */}
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? "default" : "outline"}
          className={cn(
            "cursor-pointer select-none transition-colors",
            "hover:bg-primary hover:text-primary-foreground"
          )}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
