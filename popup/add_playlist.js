console.log('[ReYou] add_playlist.js 실행');

// DOM 요소 가져오기
const title = document.getElementById('playlistTitle');
const thumbnail = document.getElementById('playlistThumbnail');
const channelImg = document.getElementById('channelImg');
const channelName = document.getElementById('channelName');
const videoCnt = document.getElementById('videoCnt');
const videoViews = document.getElementById('videoViews');
const addPlaylistBtn = document.getElementById('addPlaylistBtn');
const backBtn = document.getElementById('backBtn');
let playlistId = undefined;

// 현재 탭(재생목록 페이지) 정보 얻어 content.js에 파싱 요청
chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
  var activeTabId = tabs[0].id;
  console.log(activeTabId);

  // 현재 탭(재생목록 페이지)의 재생목록 ID 얻기
  playlistId = new URL(tabs[0].url).searchParams.get('list');
  console.log('playlistId: ', playlistId);

  // content.js에 재생목록 정보 파싱 요청
  chrome.tabs.sendMessage(
    activeTabId,
    { type: 'GET_PARSE_PLAYLIST_INFO' },
    (response) => {
      console.log(response);
      updateUI(response);
    }
  );
});

// 파싱한 데이터로 팝업의 UI 업데이트
function updateUI(data) {
  title.innerText = data.title;
  thumbnail.src = data.thumbnail;
  channelImg.src = data.channelImg;
  channelName.innerText = `게시자: ${data.channelName}`;
  videoCnt.innerText = `동영상 ${data.videoCnt}개`;
  videoViews.innerText = `조회수 ${data.videoViews}회`;
}

// 재생목록 추가 버튼 이벤트 -> 해당 재생목록 storage에 저장
addPlaylistBtn.addEventListener('click', () => {
  if (playlistId) {
    chrome.runtime.sendMessage({ type: 'PLAYLIST_ID', playlistId });
    console.log('재생목록 추가 버튼 클릭 - sendMessage 실행');
  }
});

// 뒤로가기 버튼 이벤트 -> 메인 팝업 화면으로 전환
backBtn.addEventListener('click', () => {
  window.location.href = 'popup.html';
});
