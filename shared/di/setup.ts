
// shared/di/setup.ts

import { DI_TOKENS } from '../di/tokens.ts';
import {DIContainer} from "@shared/di/Container.ts";
import {EventBus} from "@shared/events/EventBus.ts";

export function setupContainer(): DIContainer {
    const container = new DIContainer();

    // Register infrastructure services
    container.registerSingleton(DI_TOKENS.EVENT_BUS, () => new EventBus());

    // Other services will be registered in their respective modules

    return container;
}
