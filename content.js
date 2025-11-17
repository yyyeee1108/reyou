console.log('[ReYou] content.js 로드');

// 현재 URL 저장
let lastUrl = location.href; // URL을 저장. 이 변수를 통해 URL 변화 감지
let videoListObserver = null; // 비디오 리스트를 감지하는 옵저버. 이전의 옵저버를 저장한다.

// URL 변경 감지
const urlObserver = new MutationObserver(() => {
  let currentUrl = location.href;

  // URL이 바뀌어 재생목록 페이지일 때
  if (lastUrl !== currentUrl && currentUrl.includes('playlist?list=')) {
    console.log(
      `[URL 바뀜]\n[이전 URL:] ${lastUrl}\n[현재 URL:] ${currentUrl}`
    );
    lastUrl = currentUrl;

    // 이전 옵저버 정리
    if (videoListObserver) {
      videoListObserver.disconnect();
      videoListObserver = null;
    }

    // 재생목록 추출 로직 실행
    selectAllVideos();
  }
});
urlObserver.observe(document, { subtree: true, childList: true });

/** 전체 영상 로딩 감지
 * 문제: 로딩 완료 시점만 기다리고, 이후 DOM 증가는 감지를 안한다
 * 문제: 스크롤해야 로딩되는 영상의 경우 현재 방식으로 파싱 불가 (스크롤X시 최대 100개 파싱)
 */
async function selectAllVideos() {
  console.log('[ReYou] 재생목록 감지 -> 전체 영상 로딩 대기 시작');

  let videos = await isLoaded(); // 전체 로딩 감지
  if (!videos) {
    console.log('[ReYou] 영상 로딩 실패. 영상 없음');
    return;
  }

  // 재생목록의 제목 가져오기
  const playlistTitle = document
    .querySelector('head > title')
    ?.textContent?.trim();

  console.log('\n=====재생목록 제목=====');
  console.log(playlistTitle ?? '[playlistTitle 없음]');
  console.log('=================\n');

  // 재생목록 영상 목록 출력
  console.log(`[ReYou] 총 ${videos.length}개의 영상 로드됨`);

  videos.forEach((object, index) => {
    var title = object.querySelector('#video-title')?.textContent?.trim();
    var writer = object.querySelector('#text > a')?.textContent?.trim();

    console.log(`${index + 1}. 제목: ${title} | 작성자: ${writer}`);
  });

  console.log(
    `\n[ReYou] ${playlistTitle} 재생목록 영상 파싱 완료 - 총 ${videos.length}개\n`
  );
}

/** 재생목록 영상 리스트 로딩됐는지 확인
 */
function isLoaded() {
  return new Promise((resolve) => {
    const container = document.querySelector('#contents');

    if (!container) {
      console.log('[ReYou] #contents 없음 -> 재시도');
      setTimeout(() => resolve(isLoaded()), 500);
      return;
    }

    let lastCount = 0;
    let timer = null;

    videoListObserver = new MutationObserver(() => {
      let list = document.querySelectorAll(
        '#contents > ytd-playlist-video-renderer'
      );

      // 영상 개수가 변하면 -> 로딩중
      if (list.length !== lastCount) {
        lastCount = list.length;

        clearTimeout(timer);

        // 1초 동안 변화 없으면 로딩 완료로 판단
        timer = setTimeout(() => {
          console.log(`[ReYou] 전체 영상 로딩 완료 (총 ${list.length}개)`);
          videoListObserver.disconnect();
          resolve([...list]); // 영상 리스트 반환
        }, 1000);
      }
    });

    videoListObserver.observe(container, {
      subtree: true,
      childList: true,
    });
  });
}
