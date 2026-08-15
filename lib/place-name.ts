import type { Locale } from "@/lib/i18n";

const CHO = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
const JUNG = [
  "a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo",
  "u", "wo", "we", "wi", "yu", "eu", "ui", "i",
];
const JONG = [
  "", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l",
  "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t",
];

const BRANDS: [string, string][] = [
  ["투파인드피터", "To Find Peter"],
  ["홍콩반점0410", "Hong Kong Banjum 0410"],
  ["이삭토스트", "Isaac Toast"],
  ["슬로우캘리", "Slowcali"],
  ["써브웨이", "Subway"],
  ["서브웨이", "Subway"],
  ["샐러디", "Salady"],
  ["인도레스토랑", "Indian Restaurant"],
  ["카츠미", "Katsumi"],
  ["캄퐁쿠", "Kampungku"],
  ["코코너즘", "Coconuzm"],
  ["어스돔", "Earth Dome"],
  ["구르카", "Gurkha"],
  ["평양면옥", "Pyongyang Myeonok"],
  ["죠티", "Jyoti"],
  ["피자앤버거플러스", "Pizza & Burger Plus"],
  ["할랄가이즈", "The Halal Guys"],
  ["할랄키친", "Halal Kitchen"],
  ["노스탤지아151", "Nostalgia 151"],
  ["마리무슬림푸드", "Murree Muslim Food"],
  ["스타사마르칸트", "Star Samarkand"],
  ["집밥김선생", "Jibbap Kim Seonsaeng"],
  ["바라카카페", "Baraka Cafe"],
  ["체리가든", "Cherry Garden"],
  ["봄베이그릴", "Bombay Grill"],
  ["오세계향", "Osegyehyang"],
  ["서울이야", "Seoul-iya"],
  ["쭈꾸미킹", "Jjukkumi King"],
  ["케르반", "Kervan"],
  ["세차완", "Sechawan"],
  ["플랜트", "Plant"],
  ["비건인사", "Vegan Insa"],
  ["발우공양", "Balwoo Gongyang"],
  ["꽃밥에피다", "Kkotbape Pida"],
  ["몽크스부처", "Monk's Butcher"],
  ["비건키친", "Vegan Kitchen"],
  ["러빙헛랜드", "Loving Hut Land"],
  ["바이두부", "ByTOFU"],
  ["더브레드블루", "The Bread Blue"],
  ["레귬", "Legume"],
  ["산촌", "Sanchon"],
  ["마지", "Maji"],
  ["알촌", "Alchon"],
  ["양국", "Yang Good"],
  ["쌀람", "Salam"],
  ["페트라", "Petra"],
  ["마칸", "Makan"],
  ["이드", "Eid"],
  ["이태원점", "Itaewon"],
  ["코엑스점", "COEX"],
  ["광화문점", "Gwanghwamun"],
  ["반포점", "Banpo"],
  ["이대점", "Edae"],
  ["연남점", "Yeonnam"],
  ["신촌점", "Sinchon"],
  ["명동점", "Myeongdong"],
];

const SPLIT_WORDS = ["닭한마리", "칼국수", "쭈꾸미", "불고기", "마라탕", "면옥", "카츠", "토스트", "레스토랑", "할머니집"];

function romanizeSyllable(code: number) {
  const value = code - 0xac00;
  const cho = Math.floor(value / 588);
  const jung = Math.floor((value % 588) / 28);
  const jong = value % 28;
  return `${CHO[cho]}${JUNG[jung]}${JONG[jong]}`;
}

function romanizeHangul(text: string) {
  let out = "";
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      out += romanizeSyllable(code);
    } else {
      out += char;
    }
  }
  return out;
}

function insertWordBreaks(text: string) {
  let next = text;
  for (const word of SPLIT_WORDS) {
    next = next.replaceAll(word, ` ${word} `);
  }
  return next.replace(/\s+/g, " ").trim();
}

function titleCaseWord(word: string) {
  if (!word) return word;
  if (/^[A-Z0-9]/.test(word) && /[a-z]/.test(word) === false) return word;
  if (["Station", "No.", "To", "Find", "Peter", "Hong", "Kong", "Banjum", "Indian", "Restaurant", "COEX", "The", "&"].includes(word)) {
    return word;
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function applyBrands(text: string) {
  let next = text;
  for (const [hangul, english] of BRANDS) {
    next = next.replaceAll(hangul, ` ${english} `);
  }
  return next;
}

function toLatinPlaceName(name: string) {
  let text = applyBrands(name);
  text = text.replaceAll("역점", " Station ");
  text = text.replace(/(\d+)\s*호점/g, " No. $1 ");
  text = text.replace(/점(?=\s|$)/g, " ");
  text = insertWordBreaks(text);
  text = text
    .split(/(\s+)/)
    .map((part) => (/^\s+$/.test(part) ? " " : romanizeHangul(part)))
    .join("");
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(titleCaseWord)
    .join(" ");
}

function compactSearchText(value: string) {
  return value.replace(/[\s.'-]/g, "").toLowerCase();
}

export function displayPlaceName(name: string, locale: Locale) {
  if (locale !== "en") {
    return { primary: name, secondary: null as string | null };
  }
  const latin = toLatinPlaceName(name);
  if (!latin || compactSearchText(latin) === compactSearchText(name)) {
    return { primary: name, secondary: null as string | null };
  }
  return { primary: latin, secondary: name };
}

function toLatinAddress(address: string) {
  const spaced = address
    .replace(/([가-힣])(\d)/g, "$1 $2")
    .replace(/(\d)([가-힣])/g, "$1 $2");
  return romanizeHangul(spaced)
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(titleCaseWord)
    .join(" ")
    .replace(/\b([A-Za-z]+)(gu|si|dong|ro|gil)\b/gi, (_, stem: string, suffix: string) => {
      const lower = suffix.toLowerCase();
      return `${stem.charAt(0).toUpperCase()}${stem.slice(1).toLowerCase()}-${lower}`;
    });
}

export function displayAddress(address: string, locale: Locale) {
  if (locale !== "en") {
    return { primary: address, secondary: null as string | null };
  }
  const latin = toLatinAddress(address);
  if (!latin || compactSearchText(latin) === compactSearchText(address)) {
    return { primary: address, secondary: null as string | null };
  }
  return { primary: latin, secondary: address };
}

export function searchNeedle(query: string) {
  const needle = compactSearchText(query);
  return needle.length < 2 ? null : needle;
}

export function spotSearchHaystack(
  spot: { name: string; address: string | null; memo: string; memo_en?: string | null },
) {
  return compactSearchText(
    [
      spot.name,
      toLatinPlaceName(spot.name),
      spot.address ?? "",
      spot.address ? toLatinAddress(spot.address) : "",
      spot.memo,
      spot.memo_en ?? "",
    ].join(" "),
  );
}

export function memoForLocale(
  spot: { memo: string; memo_en?: string | null },
  locale: Locale,
) {
  const value = locale === "en" ? spot.memo_en : spot.memo;
  return value?.trim() || "";
}
