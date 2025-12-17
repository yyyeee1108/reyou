import { initTheme } from '../utils.js';
console.log('[ReYou] add_playlist.js 실행');

initTheme();

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
      console.log('GET_PARSE_PLAYLIST_INFO response:', response);
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
  videoCnt.innerText = `동영상 ${formatNumberWithCommas(data.videoCnt)}개`;
  videoViews.innerText = `조회수 ${formatNumberWithCommas(data.videoViews)}회`;
}

// 재생목록 추가 버튼 및 모달 처리
const modal = document.getElementById('addModal');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');
const modalTitle = document.querySelector('.modal-title');
const modalDesc = document.querySelector('.modal-desc');

// 추가 버튼 클릭
addPlaylistBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

// 취소 버튼 클릭
modalCancelBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// 확인 버튼 클릭
modalConfirmBtn.addEventListener('click', () => {
  // 저장 중 UI 피드백
  modalConfirmBtn.disabled = true;
  modalTitle.textContent = '저장 중...';
  modalDesc.textContent = '저장 중입니다. 잠시 기다려주십시오.';

  // 해당 재생목록 storage에 저장
  if (playlistId) {
    chrome.runtime
      .sendMessage({ type: 'PLAYLIST_ID', playlistId })
      .then((response) => {
        if (response.status === 'ok' && response.detail === 'success') {
          console.log('재생목록 추가 성공');
          modalTitle.textContent = '재생목록 추가 성공';
          modalDesc.textContent =
            "추가한 재생목록은 홈 화면의 '시작 전' 탭에서 확인하실 수 있습니다.";
          setTimeout(() => {
            modal.classList.add('hidden');
            chrome.storage.local.set({ lastFilter: 'new' });
            window.location.href = 'popup.html';
          }, 3000);
        } else if (
          response.status === 'ok' &&
          response.detail === 'duplicatedId'
        ) {
          console.log('중복된 재생목록. 저장하지 않음');
          modalTitle.textContent = '이미 저장된 재생목록입니다';
          modalDesc.textContent = '';
          setTimeout(() => {
            modal.classList.add('hidden');
          }, 3500);
        } else {
          console.log('재생목록 저장 실패');
          modal.classList.add('hidden');
        }
      });
  }
});

// 배경 클릭 시 닫기
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});

// 뒤로가기 버튼 이벤트 -> 메인 팝업 화면으로 전환
backBtn.addEventListener('click', () => {
  window.location.href = 'popup.html';
});

// 숫자 구분자 추가해주는 함수
function formatNumberWithCommas(number) {
  const cleanNumber = String(number).replace(/[^0-9]/g, '');

  // 숫자로 변환 후, 로컬 포맷(콤마 추가)으로 변경
  return Number(cleanNumber).toLocaleString();
}
