import type { ImageMetadata } from "astro";
import akirameruYukiCover from "../assets/books/akirameru-yuki.jpg";
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
import tanukiNoTenaraiCover from "../assets/books/tanuki-no-tenarai.jpg";
import umiNoShogakkoCover from "../assets/books/umi-no-shogakko.jpg";
import yankeeToJushokuCover from "../assets/books/yankee-to-jushoku.jpg";

export interface BookshopBook {
  id: string;
  coverImage: ImageMetadata;
  genre: string;
  title: string;
  authors: string;
  publisher: string;
  regularPriceYen: number;
  summary: string;
  productUrl: string;
  newArrival?: boolean;
}

export const bookshopUpdatedAt = "2026-07-17";

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
    newArrival: true,
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
    newArrival: true,
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
    newArrival: true,
  },
];

export const bookshopStockById: Record<string, number> = {
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
};

export const bookshopStockTotal = Object.values(bookshopStockById).reduce(
  (total, quantity) => total + quantity,
  0,
);

export function specialSalePriceYen(regularPriceYen: number): number {
  return Math.floor(regularPriceYen / 100) * 100;
}
