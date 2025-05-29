import { random } from "./random";

export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const delayRandom = (min: number, max: number): Promise<void> => {
    const randomMs = random(min, max);
    return delay(randomMs);
}