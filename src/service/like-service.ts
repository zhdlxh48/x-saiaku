import {
  DEFAULT_LIKE_DELAY_MAX_MS,
  DEFAULT_LIKE_DELAY_MIN_MS,
  DEFAULT_SCROLL_DELAY_MAX_MS,
  DEFAULT_SCROLL_DELAY_MIN_MS,
  DEFAULT_UNLIKES_DELAY_MAX_MS,
  DEFAULT_UNLIKES_DELAY_MIN_MS,
} from '../constants/delay';
import {
  CELL_INNER_DIV_SELECTOR,
  LIKE_BUTTON_SELECTOR,
  PRIMARY_COLUMN_SELECTOR,
  UNLIKE_BUTTON_SELECTOR
} from '../constants/selector';

import { clickElementRandom, getTweetTranslateY } from '../util/dom';
import { logger } from '../util/log';
import { delayRandom } from '../util/time';

interface UnlikeTweetResult {
  successed: number;
  failed: number;
  successedTweets: HTMLElement[];
  failedTweets: HTMLElement[];
}

const unlikeTweet = async (cellElement: HTMLElement) => {
  let unlikeButton = cellElement.querySelector(UNLIKE_BUTTON_SELECTOR);

  if (!unlikeButton) {
    logger.warn('마음에 들어요 버튼에 오류가 있는 것 같습니다.');

    const likeButton = cellElement.querySelector(LIKE_BUTTON_SELECTOR);
    await clickElementRandom(likeButton as HTMLElement, DEFAULT_LIKE_DELAY_MIN_MS, DEFAULT_LIKE_DELAY_MAX_MS);
    logger.warn('마음에 들어요 버튼의 오류의 해결을 시도했습니다. 해결되었는지 확인중...');

    unlikeButton = cellElement.querySelector(UNLIKE_BUTTON_SELECTOR);
    if (!unlikeButton) {
      logger.error('마음에 들어요 버튼의 오류의 해결을 시도했음에도 불구하고, 버튼을 찾을 수 없습니다.');
      return false;
    }
    logger.info('마음에 들어요 버튼의 오류가 해결되었습니다. 계속해서 마음에 들어요 버튼을 해제하겠습니다.');
  }

  console.log('마음에 들어요 버튼을 해제하겠습니다.');
  await clickElementRandom(unlikeButton as HTMLElement, DEFAULT_UNLIKES_DELAY_MIN_MS, DEFAULT_UNLIKES_DELAY_MAX_MS);
  unlikeButton = cellElement.querySelector(UNLIKE_BUTTON_SELECTOR);
  if (unlikeButton) {
    logger.warn('마음에 들어요 버튼의 해제를 시도했으나, 실패했습니다. 다시 시도하겠습니다.');

    await clickElementRandom(unlikeButton as HTMLElement, DEFAULT_UNLIKES_DELAY_MIN_MS, DEFAULT_UNLIKES_DELAY_MAX_MS);
    unlikeButton = cellElement.querySelector(UNLIKE_BUTTON_SELECTOR);
    if (unlikeButton) {
      logger.warn('다시 한번 마음에 들어요 버튼의 해제를 시도했으나, 실패했습니다.');
      return false;
    }
  }

  return true;
}

export const unlikeTweetAll = async (): Promise<UnlikeTweetResult | null> => {
  const processQueue = new Array<HTMLElement>();

  // 변경 감지 시 실행될 콜백 함수
  const callback: MutationCallback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // console.log('자식 노드가 추가되거나 제거되었습니다.');
        // mutation.addedNodes.forEach(node => console.log('추가된 노드:', node));
        // mutation.removedNodes.forEach(node => console.log('제거된 노드:', node));
        mutation.addedNodes.forEach(node => {
          processQueue.push(node as HTMLElement);
          logger.infoElement('새로운 마음에 들어요 트윗이 감지되었습니다.', node as HTMLElement)
        });
        // mutation.removedNodes.forEach(node => logger.infoElement('기존의 마음에 들어요 트윗이 범위 밖으로 이동되었습니다.', node as HTMLElement));
      }
      // else if (mutation.type === 'attributes') {
      //   console.log(`'${mutation.attributeName}' 속성이 변경되었습니다.`);
      //   console.log('이전 값:', mutation.oldValue);
      // }
      // else if (mutation.type === 'characterData') {
      //   console.log('텍스트 내용이 변경되었습니다.');
      //   console.log('이전 값:', mutation.oldValue);
      //   console.log('변경된 노드:', mutation.target);
      // }
    }
  };

  // MutationObserver 인스턴스 생성
  const observer = new MutationObserver(callback);

  // 관찰할 대상 노드 선택
  const primaryColumnNode = document.querySelector(`${PRIMARY_COLUMN_SELECTOR} section > div > div`); // 예시 ID

  // 관찰 옵션 설정
  const config = {
    childList: true,         // 자식 노드의 추가/제거 감지
    subtree: false,           // 대상 노드의 모든 자손 노드에 대한 변경 감지
    attributes: false,        // 속성 변경 감지
    characterData: false,     // 노드의 텍스트 내용 변경 감지 (노드의 data 속성)

    // oldValue 옵션 (필요에 따라 사용)
    characterDataOldValue: false, // 텍스트 내용 변경 시 이전 값 기록
    attributeOldValue: false, // 속성 변경 시 이전 값 기록

    // attributeFilter 옵션 (특정 속성만 감지, attributes가 true일 때 유효)
    // attributeFilter: ['class', 'style']
  };

  // 대상 노드와 설정으로 관찰 시작
  if (primaryColumnNode) {
    observer.observe(primaryColumnNode, config);
  } else {
    logger.errorElement('마음에 들어요 목록 요소를 찾을 수 없었었습니다.', primaryColumnNode);
    return null;
  }

  const initCellInnerDivTweets = primaryColumnNode.querySelectorAll(CELL_INNER_DIV_SELECTOR);
  initCellInnerDivTweets.forEach(cellInnerDivTweet => {
    logger.infoElement('시작 트윗이 감지되었습니다.', cellInnerDivTweet as HTMLElement);
    processQueue.push(cellInnerDivTweet as HTMLElement)
  });

  const result = {
    successed: 0,
    failed: 0,
    successedTweets: new Array<HTMLElement>(),
    failedTweets: new Array<HTMLElement>()
  }

  while (processQueue.length > 0) {
    const cellInnerDivTweet = processQueue.shift();
    if (!cellInnerDivTweet) {
      logger.error('예상치 못한 Queue의 끝에 도달했습니다.');
      break;
    }

    logger.infoElement('트윗을 처리 중입니다.', cellInnerDivTweet);
    const nextScrollY = window.scrollY + cellInnerDivTweet.offsetHeight;
    logger.infoElement(`현재 스크롤 높이는 ${window.scrollY}, 다음 스크롤 높이는 ${nextScrollY} 입니다. (+${cellInnerDivTweet.offsetHeight})`);

    logger.info("==================================================")
    const res = await unlikeTweet(cellInnerDivTweet);
    if (res) {
      result.successed += 1;
      result.successedTweets.push(cellInnerDivTweet);
    } else {
      result.failed += 1;
      result.failedTweets.push(cellInnerDivTweet);
    }
    logger.info("==================================================")

    logger.infoElement(`트윗을 스크롤 중입니다. ${window.scrollY} -> ${nextScrollY}`);
    window.scrollTo(0, nextScrollY);
    logger.info(`스크롤 되었습니다. ${window.scrollY}`);
    await delayRandom(DEFAULT_SCROLL_DELAY_MIN_MS, DEFAULT_SCROLL_DELAY_MAX_MS);
  }

  observer.disconnect();
  return result;
}
