const googleSitesBaseUrl = "https://sites.google.com/view/hitomarujyousenji";
const defaultLineUrl = "https://lin.ee/2Mw0nK8Vn";

export const siteConfig = {
  name: "浄泉寺公式お知らせ",
  shortName: "浄泉寺",
  description:
    "浄泉寺からのお知らせと行事予定をスマートフォンで読みやすく届ける公式PWAです。",
  googleSitesUrl:
    import.meta.env.PUBLIC_GOOGLE_SITES_URL ?? `${googleSitesBaseUrl}/Home`,
  googleSitesAccessUrl: `${googleSitesBaseUrl}/access`,
  historyUrl: `${googleSitesBaseUrl}/history`,
  songVideoUrl: "https://youtu.be/gu21CPj7Mdg",
  lineGuideUrl: `${googleSitesBaseUrl}/about/line`,
  lineUrl: import.meta.env.PUBLIC_LINE_URL || defaultLineUrl,
  address: import.meta.env.PUBLIC_TEMPLE_ADDRESS ?? "",
  mapUrl: import.meta.env.PUBLIC_MAP_URL ?? "",
  phone: import.meta.env.PUBLIC_TEMPLE_PHONE ?? "",
  oneSignalAppId: import.meta.env.PUBLIC_ONESIGNAL_APP_ID ?? "",
  themeColor: "#07543b",
  backgroundColor: "#fbfaf6",
} as const;
