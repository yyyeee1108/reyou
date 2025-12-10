import { getReviewState, calculateDday, REVIEW_STATE } from '../utils.js';

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

// 2. 동영상 목록 로드
// DOM 요소 가져오기
const videoListContainer = document.getElementById('video-list-container');
const template = document.getElementById('video-card-template');

videoListContainer.innerHTML = '';

videos.forEach((item, index) => {
  // template 복제
  const clone = document.importNode(template.content, true);
  console.log('clone: ', clone);

  // 재생목록 정보 요소 가져오기
  const card = clone.querySelector('.card');
  const cardIndex = clone.querySelector('.index');
  const thumbnail = clone.querySelector('.thumbnail-img');
  const title = clone.querySelector('.video-title');
  const channelName = clone.querySelector('.channel-name');

  // 데이터 배치
  cardIndex.textContent = index + 1;
  thumbnail.src = item.videoThumbnail;
  title.textContent = item.title;
  channelName.textContent = item.channelName;

  // data-id(dataset)에 동영상 ID 저장
  card.dataset.id = item.videoId;

  // 컨테이너에 추가
  videoListContainer.appendChild(clone);
});

renderReviewState(data);

// 복습 상태 렌더링
function renderReviewState(data) {
  const reviewBadge = document.getElementById('detailBadge');
  const ddayText = document.getElementById('detailDday');
  const reviewCount = document.getElementById('detailReviewCount');

  // 리뷰 뱃지, D-Day 텍스트 설정
  const reviewState = getReviewState(data);
  switch (reviewState) {
    case REVIEW_STATE.STATUS_DUE:
      reviewBadge.textContent = REVIEW_STATE.STATUS_DUE;
      reviewBadge.classList.add('badge-due');
      const dDayDue = calculateDday(data.reviewState.nextReviewDate);
      if (dDayDue < 0) {
        ddayText.textContent = `D+${Math.abs(dDayDue)}`;
      } else {
        ddayText.textContent = 'D-Day';
      }
      break;

    case REVIEW_STATE.STATUS_NEW:
      reviewBadge.textContent = REVIEW_STATE.STATUS_NEW;
      reviewBadge.classList.add('badge-new');
      ddayText.textContent = '';
      break;

    case REVIEW_STATE.STATUS_IN_PROGRESS:
      reviewBadge.textContent = `${data.reviewState.stage}단계`;
      reviewBadge.classList.add('badge-in-progress');
      const dDayInProg = calculateDday(data.reviewState.nextReviewDate);
      ddayText.textContent = `D-${dDayInProg}`;
      break;

    case REVIEW_STATE.STATUS_COMPLETED:
      reviewBadge.textContent = REVIEW_STATE.STATUS_COMPLETED;
      reviewBadge.classList.add('badge-completed');
      ddayText.textContent = '';
      break;
  }

  // 복습 횟수 설정
  reviewCount.textContent = `${data.reviewState.reviewCount}회`;
}

async function getPlaylistData(playlistId) {
  const data = (await chrome.storage.local.get('playlists')).playlists[
    playlistId
  ];
  return data;
}

// 재생버튼 클릭
const playButton = document.getElementById('playBtn');

playButton.addEventListener('click', () => {
  console.log('click 이벤트 발생');

  const firstVideoId = videos[0].videoId;

  const playUrl = `https://www.youtube.com/watch?v=${firstVideoId}&list=${playlistId}`;

  // 2. 창 크기 설정 (원하는 대로 조절 가능)
  const width = 480;
  const height = 270; // 16:9 비율

  // 3. 미니 팝업 윈도우 생성
  chrome.windows.create(
    {
      url: playUrl,
      type: 'popup', // 'popup' 타입은 주소창/탭바가 없는 깔끔한 창입니다
      width: width,
      height: height,
      focused: true, // 창을 바로 활성화
      // left, top 값을 계산해서 모니터 구석에 띄울 수도 있습니다 (선택사항)
    },
    (newWindow) => {
      if (newWindow && newWindow.tabs) {
        const targetTabId = newWindow.tabs[0].id;

        const updateListener = (tabId, changeInfo, tab) => {
          if (tabId === targetTabId && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(updateListener);
            const cssCode = `
                body {overflow: hidden !important}
                #masthead-container{
                  display: none !important;
                }
            `;
            chrome.scripting
              .insertCSS({
                target: { tabId: tabId },
                css: cssCode,
              })
              .then(() => {
                console.log('[ReYou] CSS 주입 성공!');
              })
              .catch((err) => {
                console.error('[ReYou] CSS 주입 실패:', err);
              });
          }
        };
        chrome.tabs.onUpdated.addListener(updateListener);
      }
    }
  );
});
