import { Api } from "../mount"

export interface ThrottleOptions {
  hasTrailing?: boolean
}

export interface ThrottleBehavior {
  destroy?: (entity: any, payload?: any, api?: Api) => void
  [handlerName: string]:
    | ((entity: any, payload?: any, api?: Api) => void)
    | undefined
}

export declare function withThrottle(
  config: number,
  handlerNames: string[],
  options?: ThrottleOptions,
): <T extends Record<string, any>>(type: T) => ThrottleBehavior

export declare function withThrottle(
  config: Record<string, number>,
  handlerNames?: undefined,
  options?: ThrottleOptions,
): <T extends Record<string, any>>(type: T) => ThrottleBehavior
