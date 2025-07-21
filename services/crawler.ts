import axios from 'axios';
import * as cheerio from 'cheerio';
import { SubArea, DetailArea, SalonDetails } from '@/lib/types';
import { sleep, resolveUrl, extractQueryParam, removeDuplicates, normalizeText } from '@/lib/utils';
import { DELAY_MS, SELECTORS } from '@/lib/constants';

// ======================= スクレイピングサービス ========================

/**
 * 指定されたエリアトップページからサブエリア一覧を抽出する
 * @param areaUrl エリアのトップページURL
 * @returns サブエリア一覧
 */
export async function fetchSubAreas(areaUrl: string): Promise<SubArea[]> {
    try {
        const { data } = await axios.get(areaUrl);
        const $ = cheerio.load(data);

        const subAreas: SubArea[] = [];

        $(SELECTORS.SUBAREAS).each((_, element) => {
            const href = $(element).attr('href');
            const rawName = $(element).text();
            const name = normalizeText(rawName);

            if (href && name) {
                const url = resolveUrl(href, areaUrl);
                subAreas.push({ name, url });
            }
        });

        // 重複を除去
        return removeDuplicates(subAreas, (area) => area.url);
    } catch (err) {
        console.error('サブエリア取得に失敗しました:', err);
        return [];
    }
}

/**
 * サブエリアページから更に詳細なエリア一覧を取得
 * @param subAreaUrl サブエリアページのURL
 * @returns 詳細エリア一覧
 */
export async function fetchDetailAreas(subAreaUrl: string): Promise<DetailArea[]> {
    try {
        const { data } = await axios.get(subAreaUrl);
        const $ = cheerio.load(data);

        const detailAreas: DetailArea[] = [];

        $(SELECTORS.DETAIL_AREAS).each((_, el) => {
            const href = $(el).attr('href');
            const rawName = $(el).text();
            const name = normalizeText(rawName);

            if (href && name) {
                const url = resolveUrl(href, subAreaUrl);
                detailAreas.push({ name, url });
            }
        });

        return removeDuplicates(detailAreas, (area) => area.url);
    } catch (err) {
        console.error('詳細エリア取得に失敗しました:', err);
        return [];
    }
}

/**
 * ページネーションを解析して最後のページURLを返す
 * @param listUrl リストページのURL
 * @returns 最後のページのURL
 */
export async function resolveLastPageUrl(listUrl: string): Promise<string> {
    try {
        const { data } = await axios.get(listUrl);
        const $ = cheerio.load(data);

        const pageAnchors = $(SELECTORS.PAGINATION);
        if (pageAnchors.length === 0) return listUrl;

        let maxPage = 1;
        let lastUrl = listUrl;

        pageAnchors.each((_, el) => {
            const href = $(el).attr('href');
            if (!href) return;
            
            const pageNum = extractQueryParam(href, 'PN');
            if (pageNum) {
                const num = parseInt(pageNum);
                if (num > maxPage) {
                    maxPage = num;
                    lastUrl = resolveUrl(href, listUrl);
                }
            }
        });

        return lastUrl;
    } catch (err) {
        console.error('最終ページURL取得に失敗しました:', err);
        return listUrl;
    }
}

/**
 * サロンページから詳細情報を抽出する
 * @param salonUrl サロンページのURL
 * @returns サロン詳細情報
 */
export async function extractSalonDetails(salonUrl: string): Promise<SalonDetails | null> {
    try {
        const { data } = await axios.get(salonUrl);
        const $ = cheerio.load(data);

        // サロン名をタイトルから取得
        const pageTitle = $('title').text();
        const salonName = pageTitle.split('｜')[0].trim();

        const details: Partial<SalonDetails> = {
            name: salonName
        };

        // 電話番号の取得処理
        let phoneUrl: string | undefined;
        
        // まず、電話番号のリンクを探す
        $(SELECTORS.SALON_DATA_TABLE).each((_, row) => {
            const $row = $(row);
            const header = $row.find('th').first().text().trim();
            
            if (header === '電話番号') {
                const phoneLink = $row.find('td a').first();
                const phoneHref = phoneLink.attr('href');
                
                if (phoneHref && phoneLink.text().includes('番号を表示')) {
                    // 電話番号表示ページのURLを構築
                    phoneUrl = resolveUrl(phoneHref, salonUrl);
                }
                
                return false; // break the each loop
            }
        });

        // 電話番号ページが見つかった場合、別途取得
        if (phoneUrl) {
            try {
                await sleep(DELAY_MS); // レート制限対策
                const phonePageResponse = await axios.get(phoneUrl);
                const $phonePage = cheerio.load(phonePageResponse.data);
                
                // 電話番号テーブルから番号を抽出
                $phonePage('table.wFull.bdCell.pCell10.mT15 tr').each((_, phoneRow) => {
                    const $phoneRow = $phonePage(phoneRow);
                    const phoneHeader = $phoneRow.find('th').text().trim();
                    
                    if (phoneHeader.includes('電話番号')) {
                        const phoneValue = $phoneRow.find('td').text().trim();
                        // &nbsp;や余分な空白を削除
                        details.phone = phoneValue.replace(/&nbsp;/g, '').trim();
                        return false; // break
                    }
                });
            } catch (phoneErr) {
                console.error('電話番号ページの取得に失敗しました:', phoneErr);
            }
        }

        // テーブルから各項目を抽出
        $(SELECTORS.SALON_DATA_TABLE).each((_, row) => {
            const $row = $(row);
            const header = $row.find('th').first().text().trim();
            const content = $row.find('td').first().text().trim();

            switch (header) {
                case '住所':
                    details.address = content;
                    break;
                case 'アクセス・道案内':
                    details.access = content;
                    break;
                case '営業時間':
                    details.businessHours = content;
                    break;
                case '定休日':
                    details.closedDays = content;
                    break;
                case '支払い方法':
                    details.paymentMethods = content;
                    break;
                case 'カット価格':
                    details.cutPrice = content;
                    break;
                case 'スタッフ数':
                    details.staffCount = content;
                    break;
                case 'こだわり条件':
                    details.features = content;
                    break;
                case '備考':
                    details.remarks = content;
                    break;
                case 'その他':
                    details.other = content;
                    break;
            }
        });

        return {
            name: details.name || '',
            address: details.address || '',
            phone: details.phone,
            access: details.access || '',
            businessHours: details.businessHours || '',
            closedDays: details.closedDays || '',
            paymentMethods: details.paymentMethods || '',
            cutPrice: details.cutPrice || '',
            staffCount: details.staffCount || '',
            features: details.features || '',
            remarks: details.remarks || '',
            other: details.other || ''
        };
    } catch (err) {
        console.error('サロン詳細情報の取得に失敗しました:', err);
        return null;
    }
}

/**
 * リストページからサロン一覧を取得する
 * @param listPageUrl リストページのURL
 * @returns サロン一覧
 */
export async function getSalonList(listPageUrl: string): Promise<Array<{name: string, url: string, cstt: string}>> {
    try {
        await sleep(DELAY_MS);
        const { data } = await axios.get(listPageUrl);
        const $ = cheerio.load(data);

        const salonLis = $(SELECTORS.SALON_LIST_ITEMS).filter((_, el) => {
            return $(el).find(SELECTORS.SALON_LINKS).length > 0;
        });

        const salons: Array<{name: string, url: string, cstt: string}> = [];

        salonLis.each((_, el) => {
            const li = $(el);
            const h3Link = li.find(`h3 ${SELECTORS.SALON_LINKS}`).first();
            const href = h3Link.attr('href');
            const name = h3Link.text().trim();
            
            if (href && name) {
                const cstt = extractQueryParam(href, 'cstt') || 'N/A';
                salons.push({
                    name,
                    url: resolveUrl(href, listPageUrl),
                    cstt
                });
            }
        });

        return salons;
    } catch (err) {
        console.error('サロン一覧取得に失敗しました:', err);
        return [];
    }
}

/**
 * 全ページからサロン一覧を取得する
 * @param baseUrl ベースURL
 * @returns 全サロン一覧
 */
export async function getAllSalons(baseUrl: string): Promise<Array<{name: string, url: string, cstt: string}>> {
    try {
        const allSalons: Array<{name: string, url: string, cstt: string}> = [];
        
        // 最終ページ数を取得
        const lastPageUrl = await resolveLastPageUrl(baseUrl);
        const maxPageMatch = lastPageUrl.match(/PN=(\d+)/);
        const maxPage = maxPageMatch ? parseInt(maxPageMatch[1]) : 1;
        
        console.log(`📊 総ページ数: ${maxPage}ページ`);
        
        // ------ ページを順に巡回 ------
        const visited = new Set<string>();
        let currentUrl = baseUrl;
        let page = 1;

        while (true) {
            console.log(`🔍 ページ ${page} を処理中...`);

            if (visited.has(currentUrl)) {
                console.warn('⚠️  同じURLを再訪しそうなのでループを終了します');
                break;
            }
            visited.add(currentUrl);

            // 1ページ分のサロン取得
            const pageSalons = await getSalonList(currentUrl);
            allSalons.push(...pageSalons);

            // ページ内に「次の20件」リンクがあるか判定
            let nextHref: string | undefined;
            try {
                const { data } = await axios.get(currentUrl);
                const $ = cheerio.load(data);
                const nextAnchor = $('ul.paging.jscPagingParents li.afterPage a');
                if (nextAnchor.length > 0) {
                    nextHref = nextAnchor.attr('href');
                }
            } catch (err) {
                console.error('ページ解析に失敗:', err);
            }

            if (!nextHref) {
                break; // 次ページ無し
            }

            currentUrl = resolveUrl(nextHref, currentUrl);
            page++;
            await sleep(DELAY_MS);
        }

        console.log(`✅ 総ページ読込完了: ${page}ページ`);
        
        // 重複を除去
        const uniqueSalons = removeDuplicates(allSalons, salon => salon.cstt);
        
        console.log(`✅ 総サロン数: ${uniqueSalons.length}件を取得`);
        
        return uniqueSalons;
    } catch (err) {
        console.error('全サロン一覧取得に失敗しました:', err);
        return [];
    }
} 