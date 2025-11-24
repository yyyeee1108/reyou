import { API_KEY } from './config.js';

console.log('[ReYou] service-worker.js 로드');

const PLAYLIST_ITEMS_URL =
  'https://www.googleapis.com/youtube/v3/playlistItems';

// 확장 프로그램 설치 시 작동
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log('[ReYou] 설치 완료');
    chrome.storage.local.set({ playlists: [] });
  }
});

// content.js로부터 재생목록 id 수신 시 작동
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PLAYLIST_ID') {
    let playlistId = message.playlistId;
    console.log(`[ReYou] 재생목록 ID 수신: ${playlistId}`);

    getPlaylistVideos(playlistId);
    sendResponse({ status: 'ok' });
  }
});

// 재생목록 영상 목록 얻기
async function getPlaylistVideos(
  playlistId,
  nextPageToken = undefined,
  lastIndex = 0,
  videos = []
) {
  console.log('[ReYou] getPlaylistVideo 실행');
  let url = `${PLAYLIST_ITEMS_URL}?key=${API_KEY}&maxResults=50&part=snippet&playlistId=${playlistId}`;

  // 페이징(다음 페이지가 있다면 요청 파라미터에 추가)
  if (nextPageToken) {
    url = url + `&pageToken=${nextPageToken}`;
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  const items = data.items;
  items.forEach((item, index) => {
    const title = item.snippet.title;
    const channel = item.snippet.videoOwnerChannelTitle;

    const video = { title: title, channel: channel };
    videos.push(video);
  });

  // 다음 페이지 부르기
  if (data.nextPageToken) {
    console.log(data.nextPageToken);
    getPlaylistVideos(playlistId, data.nextPageToken, lastIndex + 1, videos);
  }

  // 마지막 페이지일 때
  if (
    (data.prevPageToken && data.nextPageToken == undefined) ||
    (data.prevPageToken == undefined && data.nextPageToken == undefined)
  ) {
    console.log(`[ReYou] 순회 끝\nvideos입니다\n`, videos);
    const { playlists } = await chrome.storage.local.get('playlists');

    playlists.push({ playlistId: playlistId, videos: videos });

    chrome.storage.local.set({ playlists });
  }
}

// 재생목록 URL 변경 시 content.js를 다시 삽입
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('playlist?list=')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js'],
    });
  }
});
