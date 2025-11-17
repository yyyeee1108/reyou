console.log('[ReYou] content.js 로드');

let lastUrl = location.href; // URL을 저장. 이 변수를 통해 URL 변화 감지
let currentUrl = location.href; // 현재의 URL을 저장.

extractPlaylistId(currentUrl);

// 재생목록 ID 추출
function extractPlaylistId(currentUrl) {
  const playlistId = new URL(currentUrl).searchParams.get('list');
  console.log(`[ReYou] 현재 재생목록의 ID: ${playlistId}`);

  if (playlistId) {
    chrome.runtime.sendMessage({
      type: 'PLAYLIST_ID',
      playlistId,
    });
  }
}

const urlObserver = new MutationObserver(() => {
  currentUrl = location.href;

  if (lastUrl != currentUrl && currentUrl.includes('playlist?list=')) {
    console.log(
      `[ReYou] URL 변화 감지\n[이전URL]: ${lastUrl}\n[현재URL]: ${currentUrl}`
    );
    lastUrl = currentUrl;

    // 재생목록 ID 추출
    extractPlaylistId(currentUrl);
  }
});

urlObserver.observe(document, {
  subtree: true,
  childList: true,
});
