import {
  REVIEW_INTERVALS,
  REVIEW_STATE,
  getReviewState,
  calculateDday,
  calculateNextDate,
} from '../utils.js';

console.log('[ReYou] popup.js 실행');

// 전역 변수
let playlists = {}; // 모든 재생목록 저장
let currentFilter = 'due';

document.addEventListener('DOMContentLoaded', async () => {
  // local storage 데이터 로드
  const storageData = await chrome.storage.local.get('playlists');
  playlists = storageData.playlists || {};

  // 렌더링
  renderList();

  // 버튼 이벤트
  setFilterButtons();
});

function renderList() {
  // DOM 요소 가져오기
  const playlistContainer = document.getElementById('playlist-list-container');

  if (Object.keys(playlists).length === 0) {
    document.querySelector('.msg').textContent = '저장한 재생목록이 없습니다';
    return;
  }

  // 필터링
  let filteredData = Object.values(playlists).filter((item) => {
    const reviewState = getReviewState(item);
    if (currentFilter === 'all') return true;
    if (currentFilter === 'due') return reviewState === REVIEW_STATE.STATUS_DUE;
    if (currentFilter === 'new') return reviewState === REVIEW_STATE.STATUS_NEW;
    if (currentFilter === 'in-progress')
      return reviewState === REVIEW_STATE.STATUS_IN_PROGRESS;
    if (currentFilter === 'completed')
      return reviewState === REVIEW_STATE.STATUS_COMPLETED;
    return true;
  });

  // 정렬
  filteredData.sort((a, b) => {
    const dDayA = calculateDday(a.reviewState.nextReviewDate) ?? 999;
    const dDayB = calculateDday(b.reviewState.nextReviewDate) ?? 999;
    return dDayA - dDayB;
  });

  // messsage를 빈 문구로 만들기
  playlistContainer.innerHTML = '';

  // UI 업데이트
  updateUI(filteredData, playlistContainer);
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
    const card = clone.querySelector('.card');
    const cardIndex = clone.querySelector('.index');
    const thumbnail = clone.querySelector('.thumbnail-img');
    const title = clone.querySelector('.playlist-title');
    const channelName = clone.querySelector('.channel-name');
    const videoCount = clone.querySelector('.video-count');
    const reviewBadge = clone.querySelector('.review-badge');
    const ddayText = clone.querySelector('.dday-text');

    // 데이터 배치
    cardIndex.textContent = index + 1;
    thumbnail.src = playlistInfo.playlistThumbnailDefault;
    title.textContent = playlistInfo.title;
    channelName.textContent = playlistInfo.channelName;
    videoCount.textContent = `동영상 ${item.videos.length}개`;
    card.dataset.id = item.playlistInfo.playlistId; // data-id(dataset)에 재생목록 ID 저장

    // 리뷰 상태 배치
    const reviewState = getReviewState(item);

    switch (reviewState) {
      case REVIEW_STATE.STATUS_DUE:
        reviewBadge.textContent = REVIEW_STATE.STATUS_DUE;
        reviewBadge.classList.add('badge-due');
        const dDayDue = calculateDday(item.reviewState.nextReviewDate);
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
        reviewBadge.textContent = `${item.reviewState.stage}단계`;
        reviewBadge.classList.add('badge-in-progress');
        const dDayInProg = calculateDday(item.reviewState.nextReviewDate);
        ddayText.textContent = `D-${dDayInProg}`;
        break;

      case REVIEW_STATE.STATUS_COMPLETED:
        reviewBadge.textContent = REVIEW_STATE.STATUS_COMPLETED;
        reviewBadge.classList.add('badge-completed');
        ddayText.textContent = '';
        break;
    }

    // 항목 클릭 시 상세 페이지로 이동하는 이벤트
    card.addEventListener('click', () => {
      window.location.href = `playlist_detail.html?id=${playlistInfo.playlistId}`;
    });

    // 컨테이너에 추가
    playlistContainer.appendChild(clone);
  });
}

function setFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      // selected 클래스 제거
      filterButtons.forEach((b) => b.classList.remove('selected'));

      // 눌린 버튼에 selected 클래스 추가
      btn.classList.add('selected');

      // 현재의 필터 상태를 저장
      currentFilter = e.currentTarget.dataset.filter;

      // 리스트 다시 불러오기
      renderList();
    });
  });
}
