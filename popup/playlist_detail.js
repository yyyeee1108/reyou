console.log('playlist_detail.js 실행');

// DOM 요소 가져오기
const backBtn = document.getElementById('backBtn');

// 뒤로가기 버튼 이벤트
backBtn.addEventListener('click', () => {
  window.location.href = 'popup.html';
});

// 0. URL로부터 ID 얻어 storage로부터 해당 재생목록 데이터 얻기
const playlistId = new URL(window.location.href).searchParams.get('id');
console.log('playlistId:', playlistId);
const data = await getPlaylistData(playlistId);

if (!data) {
  console.log('[ReYou]데이터가 존재하지 않습니다');
}
console.log('data:', data);

const playlistInfo = data.playlistInfo;
const videos = data.videos;

// 1. 재생목록 정보 로드
// DOM 요소 가져오기
const pageTitle = document.querySelector('.page-title');
const playlistThumbnail = document.getElementById('playlistThumbnail');
const playlistTitle = document.getElementById('playlistTitle');
const playlistChannelName = document.getElementById('playlistChannelName');
const videoCount = document.getElementById('videoCnt');

// 정보 로드
pageTitle.textContent = playlistInfo.title;
playlistThumbnail.src = playlistInfo.playlistThumbnailDetail;
playlistTitle.textContent = playlistInfo.title;
playlistChannelName.textContent = `게시자: ${playlistInfo.channelName}`;
videoCount.textContent = `동영상 ${videos.length}개`;

async function getPlaylistData(playlistId) {
  for (const item of (await chrome.storage.local.get('playlists')).playlists) {
    if (item.playlistInfo.playlistId === playlistId) {
      return item;
    }
  }
  return;
}
