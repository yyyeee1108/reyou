console.log('utils.js 실행');

export const REVIEW_INTERVALS = [0, 1, 4, 7, 14, 30];

/**
 * 복습 단계를 입력으로 받아 다음 복습 날짜를 반환하는 함수
 * @param {number} stage
 * @returns {string} nextDate
 */
export function calculateNextDate(stage) {
  const interval = REVIEW_INTERVALS[stage];

  const nextDate = new Date(); // 현재 날짜 생성

  // 날짜 계산
  nextDate.setDate(nextDate.getDate() + interval);

  return nextDate.toISOString();
}

/**
 * 다음 복습 날짜를 입력으로 받아 D-Day를 반환하는 함수
 * @param {string} targetDateStr
 * @returns {number} D-Day
 */
export function calculateDday(targetDateStr) {
  const targetDate = new Date(targetDateStr); // 다음 복습 날짜
  const currentDate = new Date(); // 현재 날짜

  // 날짜만 비교하도록 hours, min, sec, ms는 0으로 초기화
  currentDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const difference = targetDate - currentDate;
  const dDay = Math.floor(difference / (1000 * 60 * 60 * 24));

  console.log(`D-Day: ${dDay}`);
  return dDay;
}
