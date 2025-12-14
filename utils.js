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
  // 복습 완료의 경우 null 반환
  if (stage === 6) {
    return null;
  }

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

  // 다음 복습 날짜와 현재 날짜의 연/월/일 정보를 사용자의 로컬 시간대를 따르게 하여 저장
  const targetDateLocal = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  const currentDateLocal = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const difference = targetDateLocal - currentDateLocal;
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

/**
 * 복습 완료 시 reviewState 데이터를 업데이트하는 함수
 * @param {object} playlist - 업데이트할 재생목록 항목 데이터
 * - 미리 복습하는 경우 (due status가 아닌 경우) 단계 유지, 복습 횟수만 증가
 */
export function updateReviewState(playlist) {
  // 데이터 받아오기
  const newReviewState = playlist.reviewState;

  // 복습 횟수 변경
  newReviewState.reviewCount = newReviewState.reviewCount + 1;

  // 마지막 복습 날짜 변경
  newReviewState.lastReviewDate = new Date().toISOString();

  // 단계 변경
  const currentReviewState = getReviewState(playlist);
  if (
    currentReviewState === REVIEW_STATE.STATUS_DUE ||
    currentReviewState === REVIEW_STATE.STATUS_NEW
  ) {
    // 정상 복습 -> 단계 증가
    const nextStage = newReviewState.stage + 1;
    newReviewState.stage = nextStage;

    // 다음 복습 날짜 계산
    const nextReviewDate = calculateNextDate(nextStage);
    newReviewState.nextReviewDate = nextReviewDate;

    // 30일 차 복습의 경우 복습 완료 처리
    if (!nextReviewDate) {
      newReviewState.isCompleted = true;
      newReviewState.nextReviewDate = null;
    }
  }

  return newReviewState;
}
