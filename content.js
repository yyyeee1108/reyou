// 함수 스코프로 만들어 스크립트 재삽입 시 const 변수 재선언 오류 문제 해결
(() => {
  if (!window.__REYOU_CONTENT_LOADED__) {
    window.__REYOU_CONTENT_LOADED__ = true;
    console.log('[ReYou] content.js 첫 동작');
  } else {
    console.log('[ReYou] content.js 재동작');
  }

  console.log('[ReYou] content.js 로드');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PARSE_PLAYLIST_INFO') {
      console.log('[ReYou] 팝업에서 재생목록 정보 요청 받음');

      try {
        const info = parsePlaylistInfo();
        sendResponse(info);
      } catch (error) {
        console.error('[ReYou] 파싱 실패:', error);
        sendResponse({ error: '파싱 실패' });
      }
    }
    return true;
  });

  // 유튜브 재생목록 페이지(playlist?list=) 파싱하는 함수
  function parsePlaylistInfo() {
    try {
      // 썸네일 파싱
      const thumbnail = document.querySelector(
        'yt-content-preview-image-view-model > img.ytCoreImageLoaded'
      ).src;

      // 재생목록 제목
      const title = document
        .querySelector('head > title')
        .textContent.slice(0, -10);

      // 재생목록 작성자 프로필 이미지
      const channelImg = document.querySelector(
        'avatar-view-model img.ytCoreImageLoaded'
      ).src;

      // 재생목록 작성자 이름
      const channelName = document
        .querySelector('yt-avatar-stack-view-model a')
        .textContent.slice(5);

      // 재생목록 비디오 개수
      const videoCnt = document
        .querySelector(
          'yt-content-metadata-view-model > div:nth-child(2) > span:nth-child(3)'
        )
        .textContent.replace(/\D/g, '');

      // 재생목록 비디오 조회수
      const videoViews = document
        .querySelector(
          'yt-content-metadata-view-model > div:nth-child(2) > span:nth-child(5)'
        )
        .textContent.replace(/\D/g, '');

      // 재생목록 ID
      const playlistId = new URL(location.href).searchParams.get('list');

      return {
        playlistId,
        title,
        thumbnail,
        channelName,
        channelImg,
        videoCnt,
        videoViews,
      };
    } catch (e) {
      console.error('[ReYou] 파싱 에러:', e);
      return null;
    }
  }
})();
