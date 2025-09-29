console.log(new Date().toLocaleTimeString());

setTimeout(() => {
  console.log(new Date().toLocaleTimeString());
  /* 문제1: 영상 목록 뽑아오기는 성공함. 실패의 경우가 매우 많음. 이유 알아내고 고쳐야 한다
  해결: DOM 로드 안됐을 때 querySelector 사용하려해서 실패함. 시간 지연을 통해 로드 된 후 뽑아오도록 한다
  가끔 요소가 없을 때는 렌더링 타이밍 문제
  1. setTimeout/setInterval
  2. MutationObserver로 DOM 요소 변화 감지 */

  /*문제2: 스크립트 1번만 실행됨. 다른 재생목록 들어갈 시 작동 안함
   */

  // content.js 작동 확인 로그
  console.log('[content.js 작동]');
  console.log('[location] ' + window.location.href);

  // manifest.json에서 재생목록 사이트 들어가면 content.js 실행되도록 함
  // 확장 프로그램에서 재생목록 사이트에 들어옴을 인지하고 팝업에 재생목록 정보 뜨게 한다

  // 재생목록의 제목 가져오기
  const playlistTitle = document
    .querySelector('head > title')
    ?.textContent?.trim();

  console.log(playlistTitle ?? '[playlistTitle 없음]');

  // 재생목록 영상 목록 가져오기
  console.log('재생목록 영상 목록 가져오기');
  const videos = document
    .querySelectorAll('#contents > ytd-playlist-video-renderer')
    .forEach((object) => {
      var title = object.querySelector('#video-title')?.textContent?.trim();
      var writer = object.querySelector('#text > a')?.textContent?.trim();

      console.log('제목: ' + title + ' 작성자: ' + writer);
    });

  // 각 비디오에서 제목, 만든이, 썸네일 뽑아야 함 -> 이건 클래스가 할 일 아닌가?
  // var resultVideos = videos.forEach((object, index) => {
  //   console.log(index + ':' + object.title + '--' + object.writer);
  // });
}, 10000);
