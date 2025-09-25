const template = document.getElementById('li_template'); // 복습할 영상 리스트 항목을 나타내는 템플릿
const reviewVideo = template.content.firstElementChild.cloneNode(true);
const startBtn = document.getElementById('startBtn'); // 복습 시작 버튼

reviewVideo.querySelector('.video-title').textContent = '복습 영상 제목';
