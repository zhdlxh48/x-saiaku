import { unlikeTweetAll } from './service/like-service';
import { logger } from './util/log';

let testB = false;

const htmlElement = document.createElement("button");
htmlElement.setAttribute("hidden", "");
htmlElement.className = "floating-button"
htmlElement.innerText = "Remove\nLikes";

document.querySelector('body')?.append(htmlElement);

htmlElement.onclick = () => {
  if (!testB) {
    return;
  }

  if (confirm('진짜 삭제하시겠습니까?')) {
    unlikeTweetAll().then(result => {
      if (!result) {
        logger.error('마음에 들어요 트윗 해제에 실패했습니다. 작업을 중단하겠습니다.');
        return;
      }
      logger.info(`마음에 들어요 트윗 ${result.successed}개를 해제했습니다.`);
      logger.info(`마음에 들어요 트윗 ${result.failed}개를 해제하지 못했습니다.`);
      for (let i = 0; i < result.successedTweets.length; i++) {
        logger.infoElement(`Success [${i}]`, result.successedTweets[i]);
      }
      for (let i = 0; i < result.failedTweets.length; i++) {
        logger.infoElement(`Failed [${i}]`, result.failedTweets[i]);
      }
    });
  }
}

const cssElement = document.createElement("style");
cssElement.innerHTML = `
.floating-button {
position: fixed;  /* 화면에 고정 */
top: 20px;     /* 하단에서 20px 위 */
right: 20px;      /* 오른쪽에서 20px 왼쪽 */
padding: 10px;
border-radius: 16px; /* 원형 버튼 */
background-color: #4CAF50; /* 배경색 */
color: white;     /* 글자색 */
border: none;     /* 테두리 제거 */
font-size: 16px;  /* 아이콘 크기 */
cursor: pointer;  /* 커서 포인터로 변경 */
box-shadow: 0 2px 5px rgba(0,0,0,0.3); /* 그림자 효과 */
display: flex;
align-items: center;
justify-content: center;
text-align: center;
z-index: 1000;    /* 다른 요소들 위에 표시 */
}

.floating-button:hover {
background-color: #45a049; /* 호버 시 색상 변경 */
}
`;

document.querySelector('head')?.append(cssElement);

function checkUrlAndToggleElement() {
  const targetUrlPattern = /^https:\/\/x\.com\/[^\/]+\/likes(\?.*)?$/; // 예: https://x.com/username/likes 또는 https://x.com/username/likes?query=param

  if (targetUrlPattern.test(window.location.href)) {
    testB = true;
  }
  else {
    // 조건 불만족 시
    logger.info('현재 페이지는 마음에 들어요 목록이 아닙니다.');
    testB = false;
  }
}

function startScript(): void {
  setTimeout(() => {
    // DOM 변경 감지 시작
    const observer = new MutationObserver(function (mutations) {
      // URL 변경과 관련된 DOM 변경이 감지되면 URL 체크
      checkUrlAndToggleElement();
    });

    // body 요소의 변경을 감지 (SPA에서 URL 변경 시 body 내용이 자주 바뀜)
    observer.observe(document.body, { childList: true, subtree: true });

    // 페이지 초기 로드 시에도 실행
    checkUrlAndToggleElement();
  }, 2000);
}

// @run-at document-idle 메타데이터를 사용하므로,
// 스크립트가 실행될 때 DOM은 이미 준비된 상태일 가능성이 높습니다.
// 따라서 window.onload나 DOMContentLoaded를 기다릴 필요 없이 바로 실행할 수 있습니다.
// 다만, X.com과 같은 SPA는 초기 로드 후에도 동적으로 컨텐츠를 많이 그리므로,
// 약간의 추가 지연(setTimeout)은 안정성을 더할 수 있습니다.
startScript();

export { }; // 이 파일이 모듈임을 명시