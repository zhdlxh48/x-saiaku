import { DEFAULT_SAFE_DELAY_MS } from "../constants/delay";
import { delay } from "./time";
import { logger } from "./log";
import { random } from "./random";

export const scrollPage = (amount: number): void => {
    window.scrollBy(0, amount);
}

export const getElement = (selector: string): HTMLElement | null => {
    return document.querySelector<HTMLElement>(selector);
}

export const getAllElements = (selector: string): NodeListOf<HTMLElement> => {
    return document.querySelectorAll<HTMLElement>(selector);
}

export const clickElement = async (element: HTMLElement | null, delayMs: number = DEFAULT_SAFE_DELAY_MS): Promise<void> => {
    if (element && typeof element.click === 'function') {
        element.focus();
        element.click();
        await delay(delayMs);
    } else {
        logger.errorElement('클릭할 수 없는 요소이거나 요소가 없습니다:', element);
    }
}

export const clickElementRandom =
    async (element: HTMLElement | null, minDelayMs: number = DEFAULT_SAFE_DELAY_MS, maxDelayMs: number = DEFAULT_SAFE_DELAY_MS): Promise<void> =>
        await clickElement(element, random(minDelayMs, maxDelayMs));

export const getTweetTranslateY = (tweetElement: HTMLElement): number => {
    return Number(tweetElement.style.transform.replace("translateY(", "").replace("px)", ""))
}