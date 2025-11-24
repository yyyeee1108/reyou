// 함수 스코프로 만들어 스크립트 재삽입 시 const 변수 재선언 오류 문제 해결
(() => {
  if (!window.__REYOU_CONTENT_LOADED__) {
    window.__REYOU_CONTENT_LOADED__ = true;
    console.log('[ReYou] content.js 첫 동작');
  } else {
    console.log('[ReYou] content.js 재동작');
  }

  console.log('[ReYou] content.js 로드');

  const currentUrl = location.href; // 현재의 URL을 저장.

  console.log(`[ReYou] 현재 url: ${currentUrl}`);
  const playlistId = new URL(currentUrl).searchParams.get('list');
  console.log(`[ReYou] 현재 재생목록의 ID: ${playlistId}`);

  if (playlistId) {
    chrome.runtime.sendMessage({
      type: 'PLAYLIST_ID',
      playlistId,
    });
  }
})();
