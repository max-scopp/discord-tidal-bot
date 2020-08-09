/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { RouterHistory } from "@stencil/router";
export namespace Components {
    interface AppBotQueue {
    }
    interface AppHome {
    }
    interface AppNowPlaying {
    }
    interface AppRoot {
        "history": RouterHistory;
    }
    interface AppTidalList {
    }
    interface AppTidalListOverview {
    }
    interface AppTidalLogin {
    }
}
declare global {
    interface HTMLAppBotQueueElement extends Components.AppBotQueue, HTMLStencilElement {
    }
    var HTMLAppBotQueueElement: {
        prototype: HTMLAppBotQueueElement;
        new (): HTMLAppBotQueueElement;
    };
    interface HTMLAppHomeElement extends Components.AppHome, HTMLStencilElement {
    }
    var HTMLAppHomeElement: {
        prototype: HTMLAppHomeElement;
        new (): HTMLAppHomeElement;
    };
    interface HTMLAppNowPlayingElement extends Components.AppNowPlaying, HTMLStencilElement {
    }
    var HTMLAppNowPlayingElement: {
        prototype: HTMLAppNowPlayingElement;
        new (): HTMLAppNowPlayingElement;
    };
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
    };
    interface HTMLAppTidalListElement extends Components.AppTidalList, HTMLStencilElement {
    }
    var HTMLAppTidalListElement: {
        prototype: HTMLAppTidalListElement;
        new (): HTMLAppTidalListElement;
    };
    interface HTMLAppTidalListOverviewElement extends Components.AppTidalListOverview, HTMLStencilElement {
    }
    var HTMLAppTidalListOverviewElement: {
        prototype: HTMLAppTidalListOverviewElement;
        new (): HTMLAppTidalListOverviewElement;
    };
    interface HTMLAppTidalLoginElement extends Components.AppTidalLogin, HTMLStencilElement {
    }
    var HTMLAppTidalLoginElement: {
        prototype: HTMLAppTidalLoginElement;
        new (): HTMLAppTidalLoginElement;
    };
    interface HTMLElementTagNameMap {
        "app-bot-queue": HTMLAppBotQueueElement;
        "app-home": HTMLAppHomeElement;
        "app-now-playing": HTMLAppNowPlayingElement;
        "app-root": HTMLAppRootElement;
        "app-tidal-list": HTMLAppTidalListElement;
        "app-tidal-list-overview": HTMLAppTidalListOverviewElement;
        "app-tidal-login": HTMLAppTidalLoginElement;
    }
}
declare namespace LocalJSX {
    interface AppBotQueue {
    }
    interface AppHome {
    }
    interface AppNowPlaying {
    }
    interface AppRoot {
        "history"?: RouterHistory;
    }
    interface AppTidalList {
    }
    interface AppTidalListOverview {
    }
    interface AppTidalLogin {
    }
    interface IntrinsicElements {
        "app-bot-queue": AppBotQueue;
        "app-home": AppHome;
        "app-now-playing": AppNowPlaying;
        "app-root": AppRoot;
        "app-tidal-list": AppTidalList;
        "app-tidal-list-overview": AppTidalListOverview;
        "app-tidal-login": AppTidalLogin;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "app-bot-queue": LocalJSX.AppBotQueue & JSXBase.HTMLAttributes<HTMLAppBotQueueElement>;
            "app-home": LocalJSX.AppHome & JSXBase.HTMLAttributes<HTMLAppHomeElement>;
            "app-now-playing": LocalJSX.AppNowPlaying & JSXBase.HTMLAttributes<HTMLAppNowPlayingElement>;
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
            "app-tidal-list": LocalJSX.AppTidalList & JSXBase.HTMLAttributes<HTMLAppTidalListElement>;
            "app-tidal-list-overview": LocalJSX.AppTidalListOverview & JSXBase.HTMLAttributes<HTMLAppTidalListOverviewElement>;
            "app-tidal-login": LocalJSX.AppTidalLogin & JSXBase.HTMLAttributes<HTMLAppTidalLoginElement>;
        }
    }
}