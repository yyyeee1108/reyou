console.log('utils.js 실행');

export const REVIEW_INTERVALS = [1, 4, 7, 14, 30];

export function calculateNextDate(stage) {
  const interval = REVIEW_INTERVALS[stage];

  const nextDate = new Date(); // 현재 날짜 생성

  // 날짜 계산
  nextDate.setDate(nextDate.getDate() + interval);

  return nextDate.toISOString();
}
