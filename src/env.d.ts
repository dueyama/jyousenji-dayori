/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_BASE_PATH?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_ONESIGNAL_APP_ID?: string;
  readonly PUBLIC_GOOGLE_SITES_URL?: string;
  readonly PUBLIC_LINE_URL?: string;
  readonly PUBLIC_TEMPLE_ADDRESS?: string;
  readonly PUBLIC_MAP_URL?: string;
  readonly PUBLIC_TEMPLE_PHONE?: string;
}

interface Window {
  OneSignalDeferred?: Array<
    (oneSignal: OneSignalWebSdk) => void | Promise<void>
  >;
  JOSENJI_ONESIGNAL_CONFIG?: {
    appId: string;
    basePath: string;
    serviceWorkerPath: string;
    serviceWorkerScope: string;
  };
  JOSENJI_ONESIGNAL_ERROR?: string;
  JOSENJI_ONESIGNAL_INSTANCE?: OneSignalWebSdk;
  JOSENJI_ONESIGNAL_READY?: boolean;
  navigator: Navigator & {
    standalone?: boolean;
  };
}

interface OneSignalWebSdk {
  init(options: {
    appId: string;
    serviceWorkerPath: string;
    serviceWorkerParam: { scope: string };
    notifyButton?: { enable: boolean };
    welcomeNotification?: { disable: boolean };
  }): Promise<void>;
  Notifications: {
    requestPermission(): Promise<void>;
    isPushSupported(): boolean;
    permission: boolean;
    addEventListener(
      eventName: "permissionChange",
      listener: (permission: boolean) => void,
    ): void;
  };
  User: {
    PushSubscription: {
      optedIn: boolean;
      optIn(): Promise<void>;
      optOut(): Promise<void>;
      addEventListener(eventName: "change", listener: () => void): void;
    };
  };
}
