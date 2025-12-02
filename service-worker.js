import { API_KEY } from './config.js';

console.log('[ReYou] service-worker.js 로드');

const PLAYLIST_ITEMS_URL =
  'https://www.googleapis.com/youtube/v3/playlistItems';
let refreshFlag = false;

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

    getPlaylistVideos(playlistId).then(() => {
      sendResponse({ status: 'ok' });
    });
    return true;
  }
  return false;
});

// storage에 이미 저장된 키인지 확인(중복 확인)
async function isDupllicatePlaylistId(id) {
  const { playlists } = await chrome.storage.local.get('playlists');
  if (playlists) {
    for (let pl of playlists) {
      if (pl.playlistId == id) {
        console.log(`[ReYou] 이미 존재하는 id ${pl.playlistId} -> skip`);
        return true;
      }
    }
  }
  return false;
}

// 재생목록 영상 목록 얻기
async function getPlaylistVideos(
  playlistId,
  nextPageToken = undefined,
  lastIndex = 0,
  videos = []
) {
  console.log('[ReYou] getPlaylistVideo 실행');

  // 이미 저장된 재생목록 ID일 경우 실행 중단
  if (await isDupllicatePlaylistId(playlistId)) {
    console.log(`[ReYou] playlistId 중복 확인함. getPlaylistVideos 실행 중단`);
    return;
  }

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
  console.log(
    '[ReYou - changeInfo]',
    changeInfo,
    '\n[ReYou - tab]',
    tab,
    '======================\n'
  );

  // Loading 중 새로고침 감지
  if (
    changeInfo.status === 'loading' &&
    !changeInfo.url &&
    tab.url.includes('playlist?list=') &&
    !refreshFlag
  ) {
    refreshFlag = true;
    console.log('[ReYou] 새로고침 감지 flag=true', refreshFlag);
  }

  // 새로고침 / 재생목록 페이지일때
  if (
    changeInfo.status === 'complete' &&
    refreshFlag &&
    tab.url.includes('playlist?list=')
  ) {
    console.log(`[ReYou] 새로고침 / content.js를 재삽입합니다.`);
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js'],
    });
    updatePopupUI(tabId, tab.url);
    refreshFlag = false;

    // 재생목록 페이지일때
  } else if (
    changeInfo.status === 'complete' &&
    tab.url.includes('playlist?list=')
  ) {
    console.log(`[ReYou] content.js를 재삽입합니다.`);
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js'],
    });
    updatePopupUI(tabId, tab.url);

    // 재생목록 페이지가 아닐 때
  } else if (
    changeInfo.status === 'complete' &&
    !tab.url.includes('playlist?list=')
  ) {
    updatePopupUI(tabId, tab.url);
  }
});

async function updatePopupUI(tabId, url) {
  if (url.includes('youtube.com/playlist') && url.includes('list=')) {
    // 조건 일치: 재생목록 추가 페이지로 변경
    await chrome.action.setPopup({
      tabId: tabId,
      popup: 'popup/add_playlist.html',
    });
    console.log(`[ReYou] Tab ${tabId}: 팝업 -> add_playlist.html 설정됨`);
  } else {
    // 조건 불일치: 기본 홈 화면으로 원상복구
    await chrome.action.setPopup({
      tabId: tabId,
      popup: 'popup/popup.html',
    });
    console.log(`[ReYou] Tab ${tabId}: 팝업 -> popup.html (기본) 설정됨`);
  }
}
