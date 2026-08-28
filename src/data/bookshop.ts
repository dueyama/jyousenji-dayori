import type { ImageMetadata } from "astro";
import akirameruYukiCover from "../assets/books/akirameru-yuki.jpg";
import bukkyoHyakuninIsshuCover from "../assets/books/bukkyo-hyakunin-isshu.jpg";
import eDeYomuKanmuryojukyoCover from "../assets/books/e-de-yomu-kanmuryojukyo.jpg";
import ehonGohanNoKokoroCover from "../assets/books/ehon-gohan-no-kokoro.jpg";
import emonogatariShoshinge2Cover from "../assets/books/emonogatari-shoshinge-2.jpg";
import emonogatariShoshingeCover from "../assets/books/emonogatari-shoshinge.jpg";
import heiwaToSensoCover from "../assets/books/heiwa-to-senso.jpg";
import jigokuToGokurakuCover from "../assets/books/jigoku-to-gokuraku.jpg";
import mangaShoshingeGeCover from "../assets/books/manga-shoshinge-ge.jpg";
import mangaShoshingeJoCover from "../assets/books/manga-shoshinge-jo.jpg";
import montoMonoshirichoGeCover from "../assets/books/monto-monoshiricho-ge.jpg";
import montoMonoshirichoJoCover from "../assets/books/monto-monoshiricho-jo.jpg";
import ojiichanNoGokurakuGokurakuCover from "../assets/books/ojiichan-no-gokuraku-gokuraku.jpg";
import shinranGaMichibikuTannishoCover from "../assets/books/shinran-ga-michibiku-tannisho.jpg";
import shinranShoninNoShogaiCover from "../assets/books/shinran-shonin-no-shogai.jpg";
import shoshinNembutsuMonogatariCover from "../assets/books/shoshin-nembutsu-monogatari.jpg";
import shirokiRengeNoHirakuTokiCover from "../assets/books/shiroki-renge-no-hiraku-toki.jpg";
import tanukiNoTenaraiCover from "../assets/books/tanuki-no-tenarai.jpg";
import umiNoShogakkoCover from "../assets/books/umi-no-shogakko.jpg";
import yankeeToJushokuCover from "../assets/books/yankee-to-jushoku.jpg";

export interface BookshopBook {
  id: string;
  coverImage?: ImageMetadata;
  genre: string;
  title: string;
  authors: string;
  publisher: string;
  regularPriceYen: number;
  summary: string;
  productUrl?: string;
}

export interface BookshopCatalog {
  id: string;
  status: "current" | "ended";
  eventId: string;
  eventTitle: string;
  eventStartAt: string;
  eventSectionLabel: string;
  eventHeading: string;
  eventButtonLabel: string;
  updatedAt: string;
  caption: string;
  stockById: Record<string, number>;
  newArrivalIds: string[];
}

export const bookshopBooks: BookshopBook[] = [
  {
    id: "shinran-shonin-no-shogai",
    coverImage: shinranShoninNoShogaiCover,
    genre: "親鸞",
    title: "親鸞聖人の生涯",
    authors: "梯 實圓 著",
    publisher: "法藏館",
    regularPriceYen: 1980,
    summary: "親鸞聖人の歩みをたどる一冊です。",
    productUrl: "https://pub.hozokan.co.jp/book/b523841.html",
  },
  {
    id: "emonogatari-shoshinge",
    coverImage: emonogatariShoshingeCover,
    genre: "正信偈",
    title: "絵ものがたり正信偈【絵本】",
    authors: "浅野 執持 文・市角 壮玄 絵",
    publisher: "法藏館",
    regularPriceYen: 1430,
    summary: "正信偈の内容を絵と物語で伝える絵本です。",
    productUrl: "https://pub.hozokan.co.jp/book/b523813.html",
  },
  {
    id: "emonogatari-shoshinge-2",
    coverImage: emonogatariShoshinge2Cover,
    genre: "正信偈",
    title: "絵ものがたり 正信偈2【絵本】",
    authors: "浅野 執持 文・釈 徹宗 解説・藤井 智子ほか 絵",
    publisher: "法藏館",
    regularPriceYen: 1430,
    summary: "正信偈を絵と物語で読むシリーズの第2巻です。",
    productUrl: "https://pub.hozokan.co.jp/book/b588846.html",
  },
  {
    id: "manga-shoshinge-jo",
    coverImage: mangaShoshingeJoCover,
    genre: "正信偈",
    title: "まんが正信偈のおはなし 上巻（漫画） 仏さまの教え",
    authors: "和田 真雄 原著・森村 たつお イラスト",
    publisher: "法藏館",
    regularPriceYen: 734,
    summary: "正信偈に説かれる仏さまの教えを漫画で紹介します。",
    productUrl: "https://pub.hozokan.co.jp/book/b523533.html",
  },
  {
    id: "manga-shoshinge-ge",
    coverImage: mangaShoshingeGeCover,
    genre: "正信偈",
    title: "まんが正信偈のおはなし 下巻（漫画） 七人の高僧の教え",
    authors: "和田 真雄 原著・森村 たつお イラスト",
    publisher: "法藏館",
    regularPriceYen: 734,
    summary: "七人の高僧の教えを漫画で紹介する下巻です。",
    productUrl: "https://pub.hozokan.co.jp/book/b523534.html",
  },
  {
    id: "shoshin-nembutsu-monogatari",
    coverImage: shoshinNembutsuMonogatariCover,
    genre: "正信偈",
    title: "正信念仏物語",
    authors: "松下 雅文 訳",
    publisher: "法藏館",
    regularPriceYen: 220,
    summary: "正信偈を物語として読み進められる小冊子です。",
    productUrl: "https://pub.hozokan.co.jp/book/b616793.html",
  },
  {
    id: "monto-monoshiricho-jo",
    coverImage: montoMonoshirichoJoCover,
    genre: "実用",
    title: "門徒もの知り帳 上",
    authors: "野々村 智剣 著",
    publisher: "法藏館",
    regularPriceYen: 935,
    summary: "門徒として知っておきたいことをまとめた上巻です。",
    productUrl: "https://pub.hozokan.co.jp/book/b523922.html",
  },
  {
    id: "monto-monoshiricho-ge",
    coverImage: montoMonoshirichoGeCover,
    genre: "実用",
    title: "門徒もの知り帳 下",
    authors: "野々村 智剣 著",
    publisher: "法藏館",
    regularPriceYen: 628,
    summary: "門徒として知っておきたいことをまとめた下巻です。",
    productUrl: "https://pub.hozokan.co.jp/book/b523923.html",
  },
  {
    id: "shinran-ga-michibiku-tannisho",
    coverImage: shinranGaMichibikuTannishoCover,
    genre: "歎異抄",
    title: "親鸞が導く 歎異抄",
    authors: "釈 徹宗 監",
    publisher: "リベラル社",
    regularPriceYen: 1210,
    summary: "親鸞聖人の教えから歎異抄を読む入門書です。",
    productUrl: "https://pub.hozokan.co.jp/book/b673621.html",
  },
  {
    id: "yankee-to-jushoku",
    coverImage: yankeeToJushokuCover,
    genre: "仏教",
    title: "ヤンキーと住職（漫画）",
    authors: "近藤丸",
    publisher: "KADOKAWA",
    regularPriceYen: 1760,
    summary: "漫画で仏教に触れられる一冊です。",
    productUrl: "https://pub.hozokan.co.jp/book/b621833.html",
  },
  {
    id: "jigoku-to-gokuraku",
    coverImage: jigokuToGokurakuCover,
    genre: "仏教",
    title: "地獄と極楽（漫画）",
    authors: "野沢 ともかつ 画・勝崎 裕彦 監",
    publisher: "大道社",
    regularPriceYen: 700,
    summary: "地獄と極楽について漫画で伝える本です。",
    productUrl: "https://pub.hozokan.co.jp/book/b590675.html",
  },
  {
    id: "tanuki-no-tenarai",
    coverImage: tanukiNoTenaraiCover,
    genre: "仏教",
    title: "たぬきの手習い（絵本）",
    authors: "こやま もえ 作画",
    publisher: "東本願寺出版",
    regularPriceYen: 1540,
    summary: "絵本を通して仏教に親しめる一冊です。",
    productUrl: "https://pub.hozokan.co.jp/book/b674378.html",
  },
  {
    id: "umi-no-shogakko",
    coverImage: umiNoShogakkoCover,
    genre: "教育",
    title: "海の小学校（絵本）",
    authors: "あまん きみこ 文・いとう えみ 絵",
    publisher: "本願寺出版社",
    regularPriceYen: 1320,
    summary: "海の小学校を描いた子ども向けの絵本です。",
    productUrl: "https://pub.hozokan.co.jp/book/b531905.html",
  },
  {
    id: "heiwa-to-senso",
    coverImage: heiwaToSensoCover,
    genre: "教育",
    title: "へいわとせんそう（絵本）",
    authors: "谷川 俊太郎 文・Noritake 絵",
    publisher: "ブロンズ新社",
    regularPriceYen: 1320,
    summary: "平和と戦争を対比しながら考える絵本です。",
    productUrl: "https://pub.hozokan.co.jp/book/b674220.html",
  },
  {
    id: "ojiichan-no-gokuraku-gokuraku",
    coverImage: ojiichanNoGokurakuGokurakuCover,
    genre: "教育",
    title: "おじいちゃんの ごくらく ごくらく（絵本）",
    authors: "西本 鶏介 作・長谷川 義史 絵",
    publisher: "すずき出版",
    regularPriceYen: 1650,
    summary: "おじいちゃんとの物語を通して、いのちを見つめる絵本です。",
    productUrl: "https://pub.hozokan.co.jp/book/b645417.html",
  },
  {
    id: "ehon-gohan-no-kokoro",
    coverImage: ehonGohanNoKokoroCover,
    genre: "仏教",
    title: "えほん ごはんのこころ",
    authors: "前田 まゆみ 文・絵",
    publisher: "春秋社",
    regularPriceYen: 2200,
    summary: "食べものや料理する人への感謝を、日々の食卓から考える絵本です。",
    productUrl: "https://pub.hozokan.co.jp/book/b677850.html",
  },
  {
    id: "e-de-yomu-kanmuryojukyo",
    coverImage: eDeYomuKanmuryojukyoCover,
    genre: "仏教",
    title: "絵で読む観無量寿経",
    authors: "稲葉 是邦 文・佐川 美代太郎 絵",
    publisher: "西山浄土宗",
    regularPriceYen: 2200,
    summary: "観無量寿経の世界を、印象的な絵と簡潔な言葉で表した一冊です。",
    productUrl: "https://pub.hozokan.co.jp/book/b542389.html",
  },
  {
    id: "akirameru-yuki",
    coverImage: akirameruYukiCover,
    genre: "道徳",
    title: "あきらめる勇気",
    authors: "松永 信也 著",
    publisher: "法藏館",
    regularPriceYen: 1540,
    summary: "視覚を失った著者が、障害の現実と日々の豊かさを綴った随筆です。",
    productUrl: "https://pub.hozokan.co.jp/book/b654710.html",
  },
  {
    id: "bukkyo-hyakunin-isshu",
    coverImage: bukkyoHyakuninIsshuCover,
    genre: "文学",
    title: "仏教百人一首 万葉の歌人から宮沢賢治まで",
    authors: "大角 修 編著",
    publisher: "法藏館",
    regularPriceYen: 1540,
    summary:
      "和歌や俳句などに表れた日本仏教の心を、万葉の歌人から宮沢賢治までたどります。",
    productUrl: "https://pub.hozokan.co.jp/book/b553877.html",
  },
  {
    id: "okaasan-okawari-arimasenka",
    genre: "法話・随筆",
    title: "お母さんお変りありませんか",
    authors: "山野 千代子 著",
    publisher: "百華苑",
    regularPriceYen: 1870,
    summary:
      "病を通して得た聞法のよろこびを、母への手紙としてつづった一冊です。",
  },
  {
    id: "shiroki-renge-no-hiraku-toki",
    coverImage: shirokiRengeNoHirakuTokiCover,
    genre: "法話・随筆",
    title: "白き蓮華のひらく刻",
    authors: "森田 真円 著",
    publisher: "本願寺出版社",
    regularPriceYen: 1320,
    summary: "大学生に向けて、仏教の教えをやさしく語る法話集です。",
    productUrl: "https://j-soken.jp/read/8945",
  },
];

export const bookshopCatalogs: BookshopCatalog[] = [
  {
    id: "2026-autumn-houza",
    status: "current",
    eventId: "2026-10-17-autumn-houza",
    eventTitle: "秋法座",
    eventStartAt: "2026-10-17T13:30:00+09:00",
    eventSectionLabel: "次回のお寺本や",
    eventHeading: "秋法座で開きます",
    eventButtonLabel: "秋法座の予定を見る",
    updatedAt: "2026-08-28",
    caption: "2026年10月17日の秋法座で販売予定の本",
    stockById: {
      "shinran-shonin-no-shogai": 1,
      "emonogatari-shoshinge": 2,
      "emonogatari-shoshinge-2": 2,
      "manga-shoshinge-jo": 2,
      "manga-shoshinge-ge": 2,
      "shoshin-nembutsu-monogatari": 2,
      "monto-monoshiricho-jo": 2,
      "monto-monoshiricho-ge": 2,
      "shinran-ga-michibiku-tannisho": 1,
      "yankee-to-jushoku": 2,
      "jigoku-to-gokuraku": 2,
      "tanuki-no-tenarai": 2,
      "umi-no-shogakko": 1,
      "heiwa-to-senso": 1,
      "ojiichan-no-gokuraku-gokuraku": 2,
      "ehon-gohan-no-kokoro": 2,
      "e-de-yomu-kanmuryojukyo": 2,
      "akirameru-yuki": 1,
      "bukkyo-hyakunin-isshu": 2,
      "okaasan-okawari-arimasenka": 2,
      "shiroki-renge-no-hiraku-toki": 2,
    },
    newArrivalIds: [
      "bukkyo-hyakunin-isshu",
      "okaasan-okawari-arimasenka",
      "shiroki-renge-no-hiraku-toki",
    ],
  },
  {
    id: "2026-bon-houza",
    status: "ended",
    eventId: "2026-08-08-bon-houza",
    eventTitle: "盆法座",
    eventStartAt: "2026-08-08T10:00:00+09:00",
    eventSectionLabel: "これまでのお寺本や",
    eventHeading: "盆法座で開きました",
    eventButtonLabel: "盆法座の記録を見る",
    updatedAt: "2026-07-17",
    caption: "2026年8月8日の盆法座で販売した本",
    stockById: {
      "shinran-shonin-no-shogai": 1,
      "emonogatari-shoshinge": 2,
      "emonogatari-shoshinge-2": 2,
      "manga-shoshinge-jo": 2,
      "manga-shoshinge-ge": 2,
      "shoshin-nembutsu-monogatari": 2,
      "monto-monoshiricho-jo": 2,
      "monto-monoshiricho-ge": 2,
      "shinran-ga-michibiku-tannisho": 1,
      "yankee-to-jushoku": 2,
      "jigoku-to-gokuraku": 2,
      "tanuki-no-tenarai": 2,
      "umi-no-shogakko": 1,
      "heiwa-to-senso": 1,
      "ojiichan-no-gokuraku-gokuraku": 1,
      "ehon-gohan-no-kokoro": 2,
      "e-de-yomu-kanmuryojukyo": 2,
      "akirameru-yuki": 2,
    },
    newArrivalIds: [
      "ehon-gohan-no-kokoro",
      "e-de-yomu-kanmuryojukyo",
      "akirameru-yuki",
    ],
  },
];

export const currentBookshopCatalog = bookshopCatalogs[0];

export function getBookshopCatalogBooks(catalog: BookshopCatalog) {
  const newArrivalIds = new Set(catalog.newArrivalIds);
  return bookshopBooks
    .filter((book) => (catalog.stockById[book.id] ?? 0) > 0)
    .map((book) => ({
      ...book,
      newArrival: newArrivalIds.has(book.id),
      stock: catalog.stockById[book.id],
    }));
}

export function getBookshopStockTotal(catalog: BookshopCatalog): number {
  return Object.values(catalog.stockById).reduce(
    (total, quantity) => total + quantity,
    0,
  );
}

export function specialSalePriceYen(regularPriceYen: number): number {
  return Math.floor(regularPriceYen / 100) * 100;
}
