// ==UserScript==
// @name         Better Scholar
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  按引用/年份排序，自动提取年份和出版商并打标签，左侧边栏添加出版商过滤功能。
// @author       Albert & Gemini
// @match        *://scholar.google.com/*
// @match        *://scholar.google.cz/*
// @match        *://scholar.google.co.jp/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let originalOrder = [];
    let isInitialized = false;
    let uniquePublishers = new Set();

    // --- 注入自定义 CSS (完全匹配 Google Scholar 原生风格) ---
    function injectStyles() {
        if (document.getElementById('gs-custom-styles')) return;
        const style = document.createElement('style');
        style.id = 'gs-custom-styles';
        style.textContent = `
            /* 标签样式：白底、浅灰框、深灰字、小圆角 */
            .gs-custom-tag {
                display: inline-block;
                color: #555;
                background-color: #fff;
                border: 1px solid #ccc;
                border-radius: 3px;
                padding: 1px 6px;
                font-size: 12px;
                margin-right: 8px;
                line-height: 1.4;
            }
            /* 顶部按钮样式：白底、谷歌蓝字、悬停变灰 */
            .gs-custom-btn {
                margin-right: 8px;
                padding: 4px 10px;
                cursor: pointer;
                background-color: #fff;
                color: #1a0dab; /* 经典的谷歌学术链接蓝 */
                border: 1px solid #ccc;
                border-radius: 3px;
                font-size: 13px;
                transition: background-color 0.2s, box-shadow 0.2s;
            }
            .gs-custom-btn:hover {
                background-color: #f8f9fa;
                border-color: #b5b5b5;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            /* 侧边栏标题样式：匹配原生 #777 灰色和字号 */
            #custom-publisher-filter h3 {
                font-size: 13px;
                color: #777;
                margin-bottom: 8px;
                font-weight: normal;
                padding-left: 16px;
            }
            /* 侧边栏复选框列表样式 */
            .gs-custom-checkbox-label {
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                font-size: 13px;
                color: #222;
                cursor: pointer;
            }
            .gs-custom-checkbox-label input {
                margin-right: 8px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    // --- 智能提取出版商 ---
    function extractPublisher(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('ieee')) return 'IEEE';
        if (lowerText.includes('arxiv')) return 'arXiv';
        if (lowerText.includes('acm')) return 'ACM';
        if (lowerText.includes('nature')) return 'Nature';
        if (lowerText.includes('science')) return 'Science';
        if (lowerText.includes('springer')) return 'Springer';
        if (lowerText.includes('elsevier') || lowerText.includes('sciencedirect')) return 'Elsevier';
        if (lowerText.includes('wiley')) return 'Wiley';
        if (lowerText.includes('acs ') || lowerText.includes('acs publications') || lowerText.includes('chemical reviews')) return 'ACS';
        if (lowerText.includes('iop ')) return 'IOP';

        const parts = text.split('-');
        if (parts.length > 1) {
            let lastPart = parts[parts.length - 1].trim();
            lastPart = lastPart.replace(/\.\.\./g, '').trim();
            lastPart = lastPart.replace(/\.com$/i, '').trim();
            lastPart = lastPart.replace(/\.org$/i, '').trim();
            lastPart = lastPart.replace(/\.net$/i, '').trim();
            if (lastPart.length > 0) return lastPart;
        }
        return 'Other';
    }

    // --- 步骤 1：解析文献并打标签 ---
    function processArticles() {
        const parent = document.getElementById('gs_res_ccl_mid');
        if (!parent || isInitialized) return false;

        const articles = Array.from(parent.querySelectorAll('.gs_r.gs_or.gs_scl'));
        if (articles.length === 0) return false;

        articles.forEach(article => {
            let year = "未知";
            let publisher = "未知";

            const infoNode = article.querySelector('.gs_a');
            if (infoNode) {
                const text = infoNode.textContent;
                const yearMatch = text.match(/\b(19|20)\d{2}\b/g);
                if (yearMatch) year = yearMatch[yearMatch.length - 1];
                publisher = extractPublisher(text);
            }

            article.dataset.year = year === "未知" ? "0" : year;
            article.dataset.publisher = publisher;

            uniquePublishers.add(publisher);

            const contentContainer = article.querySelector('.gs_ri');
            if (contentContainer && !article.querySelector('.custom-tags-container')) {
                const tagsDiv = document.createElement('div');
                tagsDiv.className = 'custom-tags-container';
                tagsDiv.style.cssText = 'margin-bottom: 4px;'; // 减小标签与标题的间距

                // 使用原生的纯文本灰白黑风格标签
                tagsDiv.innerHTML = `
                    <span class="gs-custom-tag">${year}</span>
                    <span class="gs-custom-tag">${publisher}</span>
                `;
                contentContainer.insertBefore(tagsDiv, contentContainer.firstChild);
            }
        });

        originalOrder = articles;
        isInitialized = true;
        return true;
    }

    // --- 步骤 2：创建左侧边栏过滤面板 ---
    function createSidebarFilter() {
        const sidebar = document.getElementById('gs_bdy_sb_in') || document.getElementById('gs_bdy_sb');
        if (!sidebar || document.getElementById('custom-publisher-filter')) return;

        const filterPanel = document.createElement('div');
        filterPanel.id = 'custom-publisher-filter';
        // 分割线采用原生的 #ebebeb
        filterPanel.style.cssText = 'margin-top: 20px; padding-top: 15px; border-top: 1px solid #ebebeb; font-family: Arial, sans-serif; padding-bottom: 15px;';

        const title = document.createElement('h3');
        title.innerText = '出版商';
        filterPanel.appendChild(title);

        const listContainer = document.createElement('div');
        listContainer.style.cssText = 'padding-left: 16px;';

        Array.from(uniquePublishers).sort().forEach(pub => {
            const label = document.createElement('label');
            label.className = 'gs-custom-checkbox-label';
            label.innerHTML = `<input type="checkbox" checked value="${pub}" class="pub-filter-cb"> ${pub}`;
            listContainer.appendChild(label);
        });

        filterPanel.appendChild(listContainer);
        sidebar.appendChild(filterPanel);

        const checkboxes = filterPanel.querySelectorAll('.pub-filter-cb');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', updateFilterDisplay);
        });
    }

    // --- 过滤逻辑 ---
    function updateFilterDisplay() {
        const checkedPubs = Array.from(document.querySelectorAll('.pub-filter-cb:checked')).map(cb => cb.value);
        const parent = document.getElementById('gs_res_ccl_mid');
        if (!parent) return;

        const articles = parent.querySelectorAll('.gs_r.gs_or.gs_scl');
        articles.forEach(article => {
            article.style.display = checkedPubs.includes(article.dataset.publisher) ? '' : 'none';
        });
    }

    // --- 步骤 3：创建顶部排序按钮 ---
    function createSortingButtons() {
        const toolbar = document.querySelector('#gs_ab_md');
        if (!toolbar || document.querySelector('#custom-sort-container')) return;

        const container = document.createElement('div');
        container.id = 'custom-sort-container';
        container.style.cssText = 'display: inline-block; margin-left: 15px; vertical-align: middle;';

        const btnCite = document.createElement('button');
        btnCite.className = 'gs-custom-btn';
        btnCite.innerHTML = '按引用排序';
        btnCite.onclick = (e) => { e.preventDefault(); sortResults('citations'); };

        const btnYear = document.createElement('button');
        btnYear.className = 'gs-custom-btn';
        btnYear.innerHTML = '按年份排序';
        btnYear.onclick = (e) => { e.preventDefault(); sortResults('year'); };

        const btnDefault = document.createElement('button');
        btnDefault.className = 'gs-custom-btn';
        btnDefault.innerHTML = '默认排序';
        btnDefault.style.color = '#555'; // 默认排序按钮使用深灰色文字以示区分
        btnDefault.onclick = (e) => { e.preventDefault(); restoreDefault(); };

        container.append(btnCite, btnYear, btnDefault);
        toolbar.appendChild(container);
    }

    // --- 排序逻辑 ---
    function sortResults(type) {
        const parent = document.getElementById('gs_res_ccl_mid');
        if (!parent || originalOrder.length === 0) return;

        let articles = Array.from(parent.querySelectorAll('.gs_r.gs_or.gs_scl'));

        articles.sort((a, b) => {
            let valA = 0, valB = 0;
            if (type === 'citations') {
                const citeA = a.querySelector('a[href*="/scholar?cites="]');
                if (citeA) valA = parseInt((citeA.textContent.match(/\d+/) || [0])[0], 10);
                const citeB = b.querySelector('a[href*="/scholar?cites="]');
                if (citeB) valB = parseInt((citeB.textContent.match(/\d+/) || [0])[0], 10);
            } else if (type === 'year') {
                valA = parseInt(a.dataset.year, 10);
                valB = parseInt(b.dataset.year, 10);
            }
            return valB - valA;
        });

        articles.forEach(article => parent.appendChild(article));
    }

    function restoreDefault() {
        const parent = document.getElementById('gs_res_ccl_mid');
        if (parent && originalOrder.length > 0) {
            originalOrder.forEach(article => parent.appendChild(article));
        }
    }

    // --- 主初始化函数 ---
    function init() {
        injectStyles(); // 注入自定义原生样式
        if (processArticles()) {
            createSidebarFilter();
            createSortingButtons();
        } else {
            setTimeout(init, 200);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
