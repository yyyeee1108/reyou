import { API_KEY } from './config.js';

console.log('[ReYou] service-worker.js 로드');

const PLAYLIST_ITEMS_URL =
  'https://www.googleapis.com/youtube/v3/playlistItems';

// 확장 프로그램 설치 시 작동
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log('[ReYou] 설치 완료');
  }
});

// content.js로부터 재생목록 id 수신 시 작동
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PLAYLIST_ID') {
    let playlistId = message.playlistId;
    console.log(`[ReYou] 재생목록 ID 수신: ${playlistId}`);

    chrome.storage.local.set({ playlistIds: playlistId }).then(sendResponse);
    sendResponse({ status: 'ok' });
    getPlaylistVideos(playlistId);
  }
});

// 재생목록 영상 목록 얻기
async function getPlaylistVideos(playlistId) {
  const url = `${PLAYLIST_ITEMS_URL}?key=${API_KEY}&maxResults=50&part=snippet&playlistId=${playlistId}`;
  fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
}
