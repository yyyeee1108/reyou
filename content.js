// content.js 작동 확인 로그
console.log('[content.js 작동]');

// manifest.json에서 재생목록 사이트 들어가면 content.js 실행되도록 함
// 확장 프로그램에서 재생목록 사이트에 들어옴을 인지하고 팝업에 재생목록 정보 뜨게 한다

// 재생목록의 제목 가져오기
const playlistTitle = document
  .querySelector(
    '#page-header > yt-page-header-renderer > yt-page-header-view-model > div.yt-page-header-view-model__page-header-content > div.yt-page-header-view-model__page-header-headline.yt-page-header-view-model__page-header-headline--page-header-headline-full-width-hero > div > yt-dynamic-text-view-model > h1 > span'
  )
  ?.textContent?.trim();

console.log(playlistTitle ?? '[playlistTitle 없음]');
