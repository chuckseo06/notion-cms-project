import { getAllPosts, getPostBlocks } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allPosts = await getAllPosts();

    const results = [];
    for (const post of allPosts) {
      const blocks = await getPostBlocks(post.id);

      const blockTypes: Record<string, number> = {};
      for (const block of blocks) {
        blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;
      }

      results.push({
        title: post.title,
        slug: post.slug,
        blockCount: blocks.length,
        blockTypes,
      });
    }

    return NextResponse.json({
      totalPosts: allPosts.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
