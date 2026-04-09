import { getAuthToken } from './oauth.js';

const DEFAULT_URL = 'https://www.googleapis.com/youtube/v3';

// 사용자 정보 얻어오는 함수
export async function getUserProfile(token) {
  const url =
    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true';

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('API 요청 실패');
  }

  // 결과 JSON 반환
  return await response.json();
}

// 토큰 얻어 YouTube Data API에 요청 넣는 함수
export async function getPlaylistItems(playlistId, nextPageToken = undefined) {
  const accessToken = await getAuthToken();
  let init = {
    method: 'GET',
    async: true,
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
    contentType: 'json',
  };
  const url = `${DEFAULT_URL}/playlistItems?maxResults=50&part=snippet,status&playlistId=${playlistId}`;

  if (nextPageToken) {
    url = url + `&pageToken=${nextPageToken}`;
  }

  const response = await fetch(url, init);
  console.log('api사용 response:', response);
}
