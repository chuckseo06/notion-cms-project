// Phase 3.1 테스트 스크립트
require('dotenv').config({ path: '.env.local' });

const { getAllPosts, getPostBySlug, getPostBlocks } = require('./lib/notion.ts');

async function testPhase31() {
  console.log('='.repeat(60));
  console.log('Phase 3.1 테스트 시작');
  console.log('='.repeat(60));

  try {
    // Step 1: 모든 포스트 조회
    console.log('\n[Step 1] 모든 포스트 조회...');
    const allPosts = await getAllPosts();
    console.log(`✅ ${allPosts.length}개 포스트 조회됨`);

    if (allPosts.length === 0) {
      console.error('❌ 포스트가 없습니다. Notion DB에 Published=true 포스트를 추가하세요.');
      return;
    }

    // Step 2: 첫 번째 포스트로 테스트
    const testPost = allPosts[0];
    console.log(`\n[Step 2] 테스트 포스트 선택: "${testPost.title}" (slug: ${testPost.slug})`);

    // Step 3: getPostBySlug() 테스트
    console.log(`\n[Step 3] getPostBySlug('${testPost.slug}') 호출...`);
    const foundPost = await getPostBySlug(testPost.slug);

    if (!foundPost) {
      console.error('❌ 포스트를 찾지 못했습니다.');
      return;
    }

    console.log(`✅ 포스트 찾음: "${foundPost.title}"`);
    console.log(`   - ID: ${foundPost.id}`);
    console.log(`   - Slug: ${foundPost.slug}`);
    console.log(`   - Tags: ${foundPost.tags.join(', ') || 'none'}`);

    // Step 4: getPostBlocks() 테스트
    console.log(`\n[Step 4] getPostBlocks('${foundPost.id}') 호출...`);
    const blocks = await getPostBlocks(foundPost.id);

    if (blocks.length === 0) {
      console.error('❌ 블록이 없습니다.');
      return;
    }

    console.log(`✅ ${blocks.length}개 블록 조회됨`);
    console.log('\n블록 타입 분석:');

    const blockTypes = {};
    for (const block of blocks) {
      blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;
    }

    for (const [type, count] of Object.entries(blockTypes)) {
      console.log(`   - ${type}: ${count}개`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Phase 3.1 테스트 완료!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

testPhase31();
