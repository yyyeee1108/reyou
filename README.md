# 🔄 ReYou: Smart Learning Assistant

**"단순한 시청을 넘어, 지식이 내 것이 되는 복습 관리 시스템"**

에빙하우스 망각 곡선 이론을 기반으로 한 유튜브 학습 복습 자동화 크롬 확장 프로그램

<div align="center">
  <img width="32%" alt="dark_image_1" src="https://github.com/user-attachments/assets/322b287e-9b23-44e5-a9f2-9f43156abe12" />
  <img width="32%" alt="dark_image_2" src="https://github.com/user-attachments/assets/a42089c2-d90e-42b4-98e1-fc8c28708332" />
  <img width="32%" alt="dark_image_3" src="https://github.com/user-attachments/assets/88f32c0e-2f3c-4891-afa6-799b59e6102c" />
</div>
<div align="center">
  <img width="32%" alt="light_image_1" src="https://github.com/user-attachments/assets/e4f78651-8744-4edd-bde5-c08f99269c29" />
  <img width="32%" alt="light_image_2" src="https://github.com/user-attachments/assets/4fb35433-bb1e-43cd-8b4e-11657b6c9b19" />
  <img width="32%" alt="light_image_3" src="https://github.com/user-attachments/assets/4b9dfdf9-9448-4014-bc84-d488f3cf71c3" />
</div>

## Project Overview

유튜브에는 훌륭한 강의가 많지만, 시청 후 적절한 복습이 이루어지지 않으면 학습 효율이 급격히 떨어집니다. ReYou는 사용자가 공부한 영상을 잊기 전, 에빙하우스 망각 곡선에 따른 1, 4, 7, 14, 30일의 복습 주기에 맞춰 알림을 주고 진척도를 관리함으로써 학습의 완성을 돕습니다.

## Key Features

- **OAuth 2.0 Authentication**: Google 계정 연동을 통한 안전한 사용자 인증 및 개인화된 데이터 관리.

- **YouTube API Integration**: 사용자의 재생목록을 실시간으로 동기화하고 학습 영상 메타데이터 추출.

- **Smart Review Scheduler**: 간격 반복(Spaced Repetition) 이론에 기반한 1/4/7/14/30일 주기 자동 알림 시스템.

- **Learning Dashboard**: 현재 복습 진행 상황 및 학습 통계를 시각적으로 확인하는 대시보드 UI.

## Tech Stack

- **Frontend/Backend**: JavaScript (ES6+), HTML5, CSS3

- **Extension**: Chrome Extension Manifest V3

- **API/Auth**: YouTube Data API v3, Google OAuth 2.0 (Chrome Identity API)

- **State/Storage**: chrome.storage.local

## Roadmap & Future Plans

이 프로젝트는 현재 개발 중입니다.

- [ ] 확장 프로그램 스토어에 게시

- [ ] 유튜브 재생목록 동기화 기능 완성

- [ ] 에빙하우스 알고리즘 기반 알림 팝업 구현

- [ ] Phase 2: 백엔드 서버 구축(Java&Spring&RDB전환) 및 Redis를 활용한 캐싱 최적화

- [ ] Phase 3: React Native를 활용한 모바일 앱 연동 및 푸시 알림 서비스 확장

- [ ] Phase 4: 다양한 플랫폼 데이터 파싱 지원
