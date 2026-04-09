// 액세스 토큰을 얻는 함수
export function getAuthToken(interactive) {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        resolve(null);
      }
      resolve(token);
    });
  });
}

// 로그인 하는 함수 - 사용자가 확인하므로 팝업 뜸
export async function login() {
  return await getAuthToken(true);
}

// 로그인 체크 함수 - 자동 체크이므로 팝업 안띄움
export async function checkAuth() {
  return await getAuthToken(false);
}

// 토큰 삭제 함수 - 토큰 만료 시 활용
export function deleteToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        // 토큰 제거
        chrome.identity.removeCachedAuthToken({ token }, () => {
          console.log('[ReYou] 토큰 삭제 완료');
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}
