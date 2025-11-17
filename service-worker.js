console.log('[ReYou] service-worker.js 로드');

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.storage.local.set({
      playlistIds: [],
    });
    console.log('[ReYou] 설치 완료');
  }
});
