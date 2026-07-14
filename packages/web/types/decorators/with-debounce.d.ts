import { Api } from "../mount"

export interface DebounceBehavior {
  destroy?: (entity: any, payload?: any, api?: Api) => void
  [handlerName: string]:
    | ((entity: any, payload?: any, api?: Api) => void)
    | undefined
}

export declare function withDebounce(
  config: number,
  handlerNames: string[],
): <T extends Record<string, any>>(type: T) => DebounceBehavior

export declare function withDebounce(
  config: Record<string, number>,
  handlerNames?: undefined,
): <T extends Record<string, any>>(type: T) => DebounceBehavior
