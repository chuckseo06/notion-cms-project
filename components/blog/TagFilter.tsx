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
    <div className="mb-8">
      <div className="flex items-center mb-3">
        <span className="text-sm font-semibold text-gray-700">필터:</span>
      </div>

      {/* 태그 필터 컨테이너 - 반응형 레이아웃 */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 전체 보기 버튼 */}
        <Button
          variant={selectedTag ? "outline" : "default"}
          size="sm"
          onClick={handleClearFilter}
          className={cn(
            "h-8 px-3 text-xs font-medium rounded-full transition-all",
            selectedTag
              ? "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
              : "bg-rose-500 text-white hover:bg-rose-600"
          )}
        >
          전체
        </Button>

        {/* 태그 배지 목록 */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={cn(
                "h-8 px-3 text-xs font-medium rounded-full transition-all select-none whitespace-nowrap",
                selectedTag === tag
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 필터 표시 */}
      {selectedTag && (
        <div className="mt-3 text-xs text-gray-600">
          선택됨: <span className="font-semibold">{selectedTag}</span>
          <button
            onClick={handleClearFilter}
            className="ml-2 text-rose-500 hover:text-rose-700 underline"
          >
            초기화
          </button>
        </div>
      )}
    </div>
  );
}
