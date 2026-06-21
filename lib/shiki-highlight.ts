import { codeToHtml } from "shiki";

// HTML 특수문자 이스케이프
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Shiki를 사용한 코드 구문 강조
 * @param code 소스 코드
 * @param language 프로그래밍 언어 (기본값: "plain")
 * @returns HTML로 변환된 강조 코드
 */
export async function highlightCode(
  code: string,
  language: string = "plain"
): Promise<string> {
  if (!code) {
    return "<pre><code></code></pre>";
  }

  try {
    console.log(
      `[Shiki] 코드 강조 시작: ${language} (${code.length}글자)`
    );

    const html = await codeToHtml(code, {
      lang: language,
      theme: "github-light",
    });

    console.log(`[Shiki] ✅ 코드 강조 완료`);
    return html;
  } catch (error: any) {
    console.warn(
      `[Shiki] 경고: 언어 '${language}' 지원 안 함. 기본 텍스트로 렌더링합니다.`,
      error.message
    );

    // Fallback: 일반 코드 블록으로 렌더링
    return `<pre><code class="language-${escapeHtml(language)}">${escapeHtml(
      code
    )}</code></pre>`;
  }
}

/**
 * 지원하는 언어 목록
 * (참고용: Shiki는 대부분의 일반적인 언어를 지원합니다)
 */
export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "scss",
  "bash",
  "shell",
  "json",
  "yaml",
  "xml",
  "markdown",
  "jsx",
  "tsx",
];
