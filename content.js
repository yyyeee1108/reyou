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

      (async () => {
        try {
          const info = await parsePlaylistInfo();
          sendResponse(info);
        } catch (error) {
          console.error('[ReYou] 파싱 실패:', error);
          sendResponse({ error: '파싱 실패' });
        }
      })();
    }
    return true;
  });

  // 유튜브 재생목록 페이지(playlist?list=) 파싱하는 함수
  async function parsePlaylistInfo() {
    try {
      // ytInitialData 데이터 변수 추출
      const jsonData = await fetchCurrentPlaylistData();
      console.log('jsonData: ', jsonData);

      if (jsonData.metadata && jsonData.microformat && jsonData.sidebar) {
        console.log('[ReYou] ytInitialData 추출 성공', jsonData);
        return parseFromJson(jsonData);
      }

      console.log('[ReYou] 유효한 ytInitialData 없음. DOM 파싱 진행');
      // ytInitialData 실패 시 기존 파싱 형태로 진행
      return parseFromDom();
    } catch (e) {
      console.error('[ReYou] 파싱 에러:', e);
      return parseFromDom();
    }
  }

  // 현재 재생목록 페이지 새 요청 넣고 ytInitialData 변수 얻기
  async function fetchCurrentPlaylistData() {
    console.log('fetchCurrentPlaylistData 실행');
    try {
      const response = await fetch(window.location.href);
      const html = await response.text();

      const varText = 'var ytInitialData = ';
      const startIndex = html.indexOf(varText);

      if (startIndex === -1) {
        return null;
      }

      let braceCount = 0;
      let endIndex = -1;
      let foundStart = false;

      for (let i = startIndex + varText.length; i < html.length; i++) {
        const char = html[i];
        if (char === '{') {
          braceCount++;
          foundStart = true;
        } else if (char === '}') {
          braceCount--;
        }

        // 시작했고, 중괄호 짝이 다 맞으면 종료
        if (foundStart && braceCount === 0) {
          endIndex = i;
          break;
        }
      }

      if (endIndex !== -1) {
        const jsonStr = html.substring(
          startIndex + varText.length,
          endIndex + 1
        );
        return JSON.parse(jsonStr);
      }

      return null;
    } catch (e) {}
  }

  function parseFromJson(data) {
    const metadata = data.metadata.playlistMetadataRenderer;
    const microformat = data.microformat.microformatDataRenderer;
    const sidebar = data.sidebar.playlistSidebarRenderer.items;

    // 재생목록 ID
    const playlistId = new URL(location.href).searchParams.get('list');

    // 썸네일 파싱
    const thumbnails = microformat.thumbnail.thumbnails;
    const thumbnail = thumbnails[thumbnails.length - 1]?.url;

    // 재생목록 제목
    const title = metadata?.title || microformat.title;

    // 재생목록 작성자 제목, 프로필 이미지
    const secondaryInfo = sidebar.find(
      (item) => item.playlistSidebarSecondaryInfoRenderer
    )?.playlistSidebarSecondaryInfoRenderer;
    const videoOwner = secondaryInfo.videoOwner.videoOwnerRenderer;
    const channelImg = videoOwner.thumbnail.thumbnails[0]?.url;
    const channelName = videoOwner.title.runs[0]?.text;

    // 재생목록 비디오 개수
    let videoCnt = '0';
    let videoViews = '0';

    const primaryInfo = sidebar.find(
      (item) => item.playlistSidebarPrimaryInfoRenderer
    )?.playlistSidebarPrimaryInfoRenderer;

    if (primaryInfo) {
      const stats = primaryInfo.stats;

      const videoCntText = stats[0]?.runs?.find((item) => {
        return /\d/.test(item.text);
      })?.text;
      if (videoCntText) {
        videoCnt = videoCntText.replace(/[^0-9]/g, '');
      }

      const videoViewsText = stats[1]?.simpleText?.replace(/[^0-9]/g, '');
      if (videoViewsText) {
        videoViews = videoViewsText.replace(/[^0-9]/g, '');
      }
    }

    return {
      playlistId,
      title,
      thumbnail,
      channelName,
      channelImg,
      videoCnt,
      videoViews,
    };
  }

  function parseFromDom() {
    try {
      // 재생목록 ID
      const playlistId = new URL(location.href).searchParams.get('list');

      // 썸네일 파싱
      const ogImage = document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute('content');

      const thumbnail = ogImage.includes('youtube')
        ? document.querySelector(
            'yt-content-preview-image-view-model > img.ytCoreImageLoaded'
          ).src
        : ogImage;

      // 재생목록 제목
      const title =
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute('content') ||
        document
          .querySelector('head > title')
          .textContent.replace(' - YouTube', '');

      // 재생목록 작성자 프로필 이미지
      const channelImg =
        document.querySelector('avatar-view-model img.ytCoreImageLoaded')
          ?.src || '';

      // 재생목록 작성자 이름
      let channelName = '';
      const channelNameElement =
        document.querySelector('ytd-channel-name#channel-name a') ||
        document.querySelector('yt-avatar-stack-view-model a');

      if (channelNameElement) {
        const channelNameText = channelNameElement.textContent.trim();
        channelName = channelNameText.includes(':')
          ? channelNameText.split(':').pop().trim()
          : channelNameText;
      }

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
