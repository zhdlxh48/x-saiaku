export const logger = {
    info: (message: string, ...optionalParams: any[]) => {
        console.log(message, ...optionalParams);
    },
    infoElement: (message: string, element?: HTMLElement | null, ...optionalParams: any[]) => {
        console.log(message, element, ...optionalParams);
    },
    warn: (message: string, ...optionalParams: any[]) => {
        console.warn(message, ...optionalParams);
    },
    warnElement: (message: string, element?: HTMLElement | null, ...optionalParams: any[]) => {
        console.warn(message, element, ...optionalParams);
    },
    error: (message: string, error?: Error, ...optionalParams: any[]) => {
        console.error(message, error, ...optionalParams);
    },
    errorElement: (message: string, element?: HTMLElement | null, ...optionalParams: any[]) => {
        console.error(message, element, ...optionalParams);
    }
};