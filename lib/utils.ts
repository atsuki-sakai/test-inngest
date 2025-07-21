import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
import { URL } from 'node:url';
import { calculateInstagramRelevance } from '@/services/instagramExtractor';

// ======================= ユーティリティ関数 ========================

/**
 * 指定されたミリ秒数だけ処理を停止する
 * @param ms 停止時間（ミリ秒）
 */
export const sleep = (ms: number): Promise<void> => 
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 相対URLを絶対URLに変換する
 * @param href 相対または絶対URL
 * @param baseUrl ベースURL
 * @returns 絶対URL
 */
export function resolveUrl(href: string, baseUrl: string): string {
    return href.startsWith('http') ? href : new URL(href, baseUrl).href;
}

/**
 * URLからクエリパラメータの値を抽出する
 * @param url URL文字列
 * @param paramName パラメータ名
 * @returns パラメータの値、見つからない場合は undefined
 */
export function extractQueryParam(url: string, paramName: string): string | undefined {
    const match = url.match(new RegExp(`${paramName}=(\\d+)`));
    return match ? match[1] : undefined;
}

/**
 * 配列から重複要素を除去する
 * @param array 重複を含む可能性のある配列
 * @param keyFn 重複判定のキー抽出関数
 * @returns 重複が除去された配列
 */
export function removeDuplicates<T>(array: T[], keyFn: (item: T) => string): T[] {
    const seen = new Set<string>();
    return array.filter(item => {
        const key = keyFn(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/**
 * 文字列の空白文字を正規化する
 * @param text 対象文字列
 * @returns 正規化された文字列
 */
export function normalizeText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * サロン名とURL/テキストの関連度を計算する
 * @param salonName サロン名
 * @param candidate 候補URL/テキスト
 * @returns 関連度スコア（0-1、高いほど関連性あり）
 */
export function calculateRelevanceScore(salonName: string, candidate: string): number {
    // Instagram URLの場合は専用の関連度計算を使用
    if (candidate.includes('instagram.com')) {
        return calculateInstagramRelevance(candidate, salonName);
    }
    
    // その他のURL/テキストの場合は従来の汎用関連度計算を使用
    const normalizedSalonName = normalizeName(salonName);
    const normalizedCandidate = normalizeName(candidate);
    
    // 完全一致ボーナス
    if (normalizedCandidate.includes(normalizedSalonName)) {
        return 0.9;
    }
    
    // サロン名から主要なキーワードを抽出
    const salonKeywords = extractKeywords(normalizedSalonName);
    const candidateKeywords = extractKeywords(normalizedCandidate);
    
    // キーワードマッチング計算
    let matchScore = 0;
    const totalKeywords = salonKeywords.length;
    
    for (const keyword of salonKeywords) {
        if (keyword.length >= 2) { // 2文字以上のキーワードのみ評価
            for (const candidateKeyword of candidateKeywords) {
                if (candidateKeyword.includes(keyword) || keyword.includes(candidateKeyword)) {
                    matchScore += 1;
                    break;
                }
            }
        }
    }
    
    // 英語名とカタカナ名の変換チェック
    const translationScore = checkTranslationMatch(normalizedSalonName, normalizedCandidate);
    
    // 最終スコア計算（0-1の範囲）
    const keywordScore = totalKeywords > 0 ? (matchScore / totalKeywords) : 0;
    const finalScore = Math.max(keywordScore, translationScore);
    
    return Math.min(finalScore, 1.0);
}

/**
 * 名前を正規化する（カタカナ統一、記号除去等）
 */
function normalizeName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[()（）\[\]【】「」『』<>《》〈〉]/g, '') // 括弧類を除去
        .replace(/[・･]/g, '') // 中点を除去
        .replace(/[&＆]/g, 'and') // ＆をandに変換
        .replace(/\s+/g, '') // 空白を除去
        .replace(/[ァ-ヶ]/g, (match) => { // カタカナをひらがなに変換
            return String.fromCharCode(match.charCodeAt(0) - 0x60);
        });
}

/**
 * キーワードを抽出する
 */
function extractKeywords(text: string): string[] {
    // サロン関連の一般的な単語は除外
    const excludeWords = ['美容室', 'ヘアサロン', 'salon', 'hair', 'beauty', '店', 'ショップ', 'shop'];
    
    // 単語分割（スペース、記号で分割）
    const words = text.split(/[^a-z0-9ぁ-んァ-ヶ一-龯]/i).filter(word => 
        word.length >= 2 && !excludeWords.includes(word.toLowerCase())
    );
    
    return words;
}

/**
 * 英語⇔カタカナの変換マッチングをチェック
 */
function checkTranslationMatch(salonName: string, candidate: string): number {
    // 簡単な英語⇔カタカナ変換例
    const commonTranslations = [
        { en: 'hair', ja: 'ヘア' },
        { en: 'salon', ja: 'サロン' },
        { en: 'beauty', ja: 'ビューティー' },
        { en: 'cut', ja: 'カット' },
        { en: 'style', ja: 'スタイル' },
        { en: 'mode', ja: 'モード' },
        { en: 'charm', ja: 'シャルム' },
        { en: 'bob', ja: 'ボブ' },
        { en: 'slow', ja: 'スロウ' },
        { en: 'slow', ja: 'スロー' },
        { en: 'spa', ja: 'スパ' },
    ];
    
    let translationMatches = 0;
    for (const { en, ja } of commonTranslations) {
        if ((salonName.includes(ja) && candidate.includes(en)) ||
            (salonName.includes(en) && candidate.includes(ja))) {
            translationMatches++;
        }
    }
    
    return translationMatches > 0 ? 0.7 : 0;
}

/**
 * 住所から都道府県と市を抽出する
 * @param address 完全な住所
 * @returns 都道府県と市の情報を含むオブジェクト
 */
export function extractPrefectureAndCity(address: string): { prefecture: string; city: string; combined: string } {
    // 都道府県のパターン
    const prefecturePattern = /(北海道|青森県|岩手県|宮城県|秋田県|山形県|福島県|茨城県|栃木県|群馬県|埼玉県|千葉県|東京都|神奈川県|新潟県|富山県|石川県|福井県|山梨県|長野県|岐阜県|静岡県|愛知県|三重県|滋賀県|京都府|大阪府|兵庫県|奈良県|和歌山県|鳥取県|島根県|岡山県|広島県|山口県|徳島県|香川県|愛媛県|高知県|福岡県|佐賀県|長崎県|熊本県|大分県|宮崎県|鹿児島県|沖縄県)/;
    
    // 市区町村のパターン（「市」「区」「町」「村」で終わるもの）
    const cityPattern = /([^\s]{1,10}(?:市|区|町|村))/;
    
    let prefecture = '';
    let city = '';
    
    // 都道府県を抽出
    const prefectureMatch = address.match(prefecturePattern);
    if (prefectureMatch) {
        prefecture = prefectureMatch[1];
    }
    
    // 市区町村を抽出（都道府県の後ろから検索）
    let addressWithoutPrefecture = address;
    if (prefecture) {
        addressWithoutPrefecture = address.substring(address.indexOf(prefecture) + prefecture.length);
    }
    
    const cityMatch = addressWithoutPrefecture.match(cityPattern);
    if (cityMatch) {
        city = cityMatch[1];
    }
    
    // 組み合わせた地域情報を作成
    const combined = [prefecture, city].filter(Boolean).join(' ');
    
    return {
        prefecture,
        city,
        combined
    };
}

/**
 * サロン名と住所を使って地域を含むInstagram検索クエリを生成
 * @param salonName サロン名
 * @param address 住所
 * @returns 最適化された検索クエリ
 */
export function generateLocationBasedSearchQuery(salonName: string, address: string): string {
    // サロン名の整理
    const cleanSalonName = salonName.trim().replace(/\s+/g, ' ');
    
    // 住所から都道府県と市を抽出
    const location = extractPrefectureAndCity(address);
    
    // 地域情報を含む検索クエリを構築
    if (location.combined) {
        // 都道府県・市が抽出できた場合
        return `ヘアサロン ${cleanSalonName} ${location.combined} Instagram`;
    } else {
        // 抽出できなかった場合は従来のクエリ
        return `ヘアサロン ${cleanSalonName} Instagram`;
    }
} 