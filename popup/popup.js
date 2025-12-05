console.log('[ReYou] popup.js 실행');

document.addEventListener('DOMContentLoaded', async () => {
  await loadContent();
});

async function loadContent() {
  // DOM 요소 가져오기
  const playlistContainer = document.getElementById('playlist-list-container');

  // chrome.storage.local로부터 저장한 재생목록 데이터 받아오기
  const data = (await chrome.storage.local.get('playlists')).playlists;
  console.log('popup.js data:', data);

  if (data.length === 0) {
    document.querySelector('.msg').textContent = '저장한 재생목록이 없습니다';
    return;
  }

  // messsage를 빈 문구로 만들기
  playlistContainer.innerHTML = '';
  // 저장한 재생목록 UI 업데이트
  updateUI(data, playlistContainer);
}

// 받아온 데이터로 팝업의 UI 업데이트
function updateUI(data, playlistContainer) {
  console.log('update에서의 data:', data);
  // template DOM 요소 가져오기
  const template = document.getElementById('playlist-card-template');

  data.forEach((item, index) => {
    // template 복제
    const clone = document.importNode(template.content, true);
    console.log('clone: ', clone);

    // 재생목록 정보 요소 가져오기
    const playlistInfo = item.playlistInfo;
    console.log('playlistInfo: ', playlistInfo);
    const card = clone.querySelector('.card');
    const cardIndex = clone.querySelector('.index');
    const thumbnail = clone.querySelector('.thumbnail-img');
    const title = clone.querySelector('.playlist-title');
    const channelName = clone.querySelector('.channel-name');
    const videoCount = clone.querySelector('.video-count');

    // 데이터 배치
    cardIndex.textContent = index + 1;
    thumbnail.src = playlistInfo.playlistThumbnailDefault;
    title.textContent = playlistInfo.title;
    channelName.textContent = playlistInfo.channelName;
    videoCount.textContent = `동영상 ${item.videos.length}개`;

    // data-id(dataset)에 재생목록 ID 저장
    card.dataset.id = item.playlistInfo.playlistId;

    // 항목 클릭 시 상세 페이지로 이동하는 이벤트
    card.addEventListener('click', () => {
      window.location.href = `playlist_detail.html?id=${playlistInfo.playlistId}`;
    });

    // 컨테이너에 추가
    playlistContainer.appendChild(clone);
  });
}
