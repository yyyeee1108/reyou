export const REVIEW_INTERVALS = [0, 1, 4, 7, 14, 30];
export const REVIEW_STATE = {
  STATUS_NEW: '시작 전',
  STATUS_IN_PROGRESS: '진행 중',
  STATUS_DUE: 'D-DAY',
  STATUS_COMPLETED: '복습 완료',
};

/**
 * 복습 단계를 입력으로 받아 다음 복습 날짜를 반환하는 함수
 * @param {number} stage - 현재 단계
 * @returns {string} nextDate - 다음 복습 날짜(ISO String)
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
 * @param {string} targetDateStr - 다음 복습 날짜 문자열
 * @returns {number} D-Day - (0: 오늘, 음수: 복습 기간 지남, 양수: 복습 기간 남음)
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

/**
 * 재생목록의 현재 복습 상태를 판별하여 반환하는 함수
 * @param {object} playlist - 특정 재생목록 항목 데이터
 * @returns {string} - 뱃지에 표시될 현재 재생목록 복습 상태
 */
export function getReviewState(playlist) {
  const reviewState = playlist.reviewState;
  const { isCompleted, stage, nextReviewDate } = reviewState;

  // 학습 완료됐는지 확인
  if (isCompleted === true) {
    return REVIEW_STATE.STATUS_COMPLETED;
  }

  // 학습 시작 전인지 확인
  if (stage === 0) {
    return REVIEW_STATE.STATUS_NEW;
  }

  // 학습 진행 중인 경우
  if (nextReviewDate) {
    const dDay = calculateDday(nextReviewDate); // D-Day 계산
    if (dDay <= 0) {
      return REVIEW_STATE.STATUS_DUE;
    }
  }

  // 나머지는 D-Day 남아있는 학습 중 상태
  return REVIEW_STATE.STATUS_IN_PROGRESS;
}
