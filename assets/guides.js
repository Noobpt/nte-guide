(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./guide-core.js') : root.GameGuideCore);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GameGuidesUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (C) {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
  const number = value => Number(value).toLocaleString('ko-KR', {maximumFractionDigits: 1});
  const list = value => Array.isArray(value) ? value : [];
  const href = (game = 'all', guide = '', character = '') => C.guideHref(game, guide, character);
  const external = value => /^https:\/\//i.test(String(value || '')) ? String(value) : '';
  const imageSrc = value => /^(?:assets\/[a-z0-9_./-]+|https:\/\/[^\s]+)$/i.test(String(value || '')) ? String(value) : '';
  const date = value => value ? esc(value) : '확인일 미기록';
  const catalog = [{id:'gifts', game:'nte', gameName:'이환', title:'캐릭터별 상시선물', description:'누구에게 무엇을 줄지, 어디서 구할지. 선물과 구매처를 한 번에 확인하세요.', href:href('nte', 'gifts')}];

  function portrait(character, portraits, compact = false) {
    const entry = portraits?.[character.id];
    const src = imageSrc(entry?.src);
    const position = /^(?:\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%|center (?:top|center|bottom))$/.test(entry?.position || '') ? entry.position : 'center top';
    return `<span class="guide-portrait${compact ? ' guide-portrait-small' : ''}">${src ? `<img data-guide-portrait src="${esc(src)}" alt="" width="240" height="240" loading="lazy" decoding="async" style="object-position:${position}">` : ''}<span class="guide-portrait-fallback" aria-hidden="true">${esc(character.name)}</span></span>`;
  }

  function search(query, label, placeholder) {
    return `<label class="guide-search" for="guide-query"><span>${esc(label)}</span><input id="guide-query" data-guide-input="query" type="search" value="${esc(query || '')}" placeholder="${esc(placeholder)}" autocomplete="off"></label>`;
  }

  function empty(title, description, back = false) {
    return `<div class="guide-empty"><h2>${esc(title)}</h2><p>${esc(description)}</p>${back ? `<a class="guide-button" href="${href('nte', 'gifts')}">캐릭터 목록으로</a>` : '<button class="guide-button" type="button" data-guide-action="clear-search">검색 지우기</button>'}</div>`;
  }

  function meta(data) {
    return `<p class="guide-meta">자료 확인 ${date(data.meta?.checkedAt)}<span>항목별 확인일과 출처는 상세에서 확인할 수 있습니다.</span></p>`;
  }

  function guideList(route, data, portraits) {
    const characters = list(data.characters);
    const previews = characters.filter(character => imageSrc(portraits?.[character.id]?.src)).slice(0, 3);
    const available = catalog.filter(guide => !route.game || route.game === 'all' || guide.game === route.game);
    const games = [...new Map(catalog.map(guide => [guide.game, guide.gameName]))];
    const cards = available.map(guide => `<a class="guide-library-card" href="${esc(guide.href)}"><div class="guide-library-copy"><span class="guide-game-tag">${esc(guide.gameName)}</span><h2>${esc(guide.title)}</h2><p>${esc(guide.description)}</p><span class="guide-library-facts">캐릭터 ${characters.length}명 · 상점 선물 ${list(data.gifts).length}종</span><strong class="guide-library-cta">캐릭터 선택하기 <span aria-hidden="true">›</span></strong></div>${previews.length ? `<div class="guide-library-portraits" aria-hidden="true">${previews.map(character => portrait(character, portraits)).join('')}</div>` : ''}</a>`).join('');
    return {
      title: '공략 · 자료',
      subtitle: '플레이 중 필요한 정보를 게임별로 찾아보세요.',
      breadcrumb: '공략 · 자료',
      toolbar: `<div class="guide-library-toolbar"><div class="guide-game-filter" role="group" aria-label="공략 게임 필터"><a href="${href()}"${(!route.game || route.game === 'all') ? ' aria-current="page"' : ''}>전체 게임</a>${games.map(([id,name]) => `<a href="${href(id)}"${route.game === id ? ' aria-current="page"' : ''}>${esc(name)}</a>`).join('')}</div><a class="guide-text-link" href="#sources">전체 자료 · 출처</a></div>`,
      content: `<div class="guide-view guide-library">${cards || `<div class="guide-empty"><h2>등록된 공략이 없습니다.</h2><p>현재 공개된 공략을 전체 목록에서 확인하세요.</p><a class="guide-button" href="${href()}">전체 공략 보기</a></div>`}<p class="guide-library-note">숙제의 기준과 기존 참고자료는 <a href="#sources">자료 · 출처</a>에서 볼 수 있습니다.</p></div>`
    };
  }

  function characterList(route, data, portraits) {
    const characters = C.searchCharacters(data, route.query || '');
    const giftCounts = new Map(list(data.characters).map(character => [character.id, list(data.gifts).filter(gift => list(gift.characterIds).includes(character.id)).length]));
    return {
      title: '이환 상시선물',
      subtitle: '선물을 줄 캐릭터를 선택하세요. 상점 구매부터 공용 선물의 획득 경로까지 확인할 수 있습니다.',
      breadcrumb: '공략 · 자료 / 이환 / 상시선물',
      toolbar: `<div class="guide-picker-toolbar"><a class="guide-text-link" href="${href('nte')}">‹ 이환 공략</a>${search(route.query, '캐릭터 검색', '이름 또는 별칭으로 찾기')}</div>`,
      content: `<div class="guide-view">${meta(data)}<p class="guide-result-count" role="status">캐릭터 ${characters.length}명${route.query ? ` · “${esc(route.query)}” 검색 결과` : ''}</p>${characters.length ? `<div class="guide-character-grid">${characters.map(character => `<a class="guide-character" href="${href('nte', 'gifts', character.id)}">${portrait(character, portraits)}<span class="guide-character-caption"><strong>${esc(character.name)}</strong><small>${giftCounts.get(character.id) ? `상점 선물 ${giftCounts.get(character.id)}종` : '상점 선물 확인 중'}</small></span></a>`).join('')}</div>` : empty('찾는 캐릭터가 없습니다.', '이름의 일부나 다른 별칭으로 다시 검색해 보세요.')}<p class="guide-scope-note">${esc(data.meta?.scopeNote || '상시 상점과 반복 가능한 교환·생산 경로를 정리했습니다. 재고와 해금 조건은 게임에서 확인하세요.')}</p></div>`
    };
  }

  function giftSources(gift, data) {
    const sources = list(gift.sourceIds).map(id => data.sources?.[id]).filter(source => source && external(source.url));
    return `<details class="guide-item-sources"><summary>출처${sources.length ? ` ${sources.length}` : ' 확인 중'} · ${date(gift.checkedAt)}</summary>${sources.length ? `<ul>${sources.map(source => `<li><a href="${esc(external(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a></li>`).join('')}</ul>` : '<p>확인 가능한 출처를 정리하고 있습니다.</p>'}</details>`;
  }

  function notes(notesValue, className = 'guide-item-notes') {
    const values = list(notesValue).filter(Boolean);
    return values.length ? `<ul class="${className}">${values.map(note => `<li>${esc(note)}</li>`).join('')}</ul>` : '';
  }

  function acquisition(gift) {
    const labels = {shop: '상점', vending: '자판기', exchange: '교환', production: '생산'};
    return list(gift.acquisition).length ? `<ul class="guide-acquisition">${gift.acquisition.map(place => `<li><span class="guide-acquisition-type">${esc(labels[place.type] || '획득')}</span><strong>${esc(place.name)}</strong>${place.area ? `<span>${esc(place.area)}</span>` : ''}${place.conditions ? `<small>${esc(place.conditions)}</small>` : ''}</li>`).join('')}</ul>` : '<span class="guide-muted">획득처 확인 필요</span>';
  }

  function price(gift) {
    return Number.isFinite(gift.price) && gift.price >= 0 ? `${number(gift.price)} <small>${esc(gift.currency || '')}</small>` : '<span class="guide-muted">가격 확인 필요</span>';
  }

  function gain(gift) {
    return Number.isFinite(gift.gain) ? `+${number(gift.gain)}` : '확인 필요';
  }

  function recommendation(gifts, title, description, kind) {
    return `<section class="guide-recommendation"><h2>${title}</h2><p>${description}</p>${gifts.length ? `<ul>${gifts.map(gift => `<li><strong>${esc(gift.name)}</strong><span>${kind === 'gain' ? `${gain(gift)} 호감도` : `${number(C.costPer100(gift))} ${esc(gift.currency)} / 100 호감도`}</span></li>`).join('')}</ul>` : '<p class="guide-muted">추천할 수 있는 확인된 정보가 아직 없습니다.</p>'}</section>`;
  }

  function giftTable(gifts, data) {
    return `<div class="guide-table-wrap"><table class="guide-gift-table"><caption class="guide-sr-only">캐릭터 선물의 호감도, 가격, 구매처와 출처</caption><thead><tr><th scope="col">선물</th><th scope="col">호감도</th><th scope="col">가격 · 효율</th><th scope="col">구매처 · 지역</th></tr></thead><tbody>${gifts.map(gift => {
      const value = C.costPer100(gift);
      return `<tr id="guide-gift-${esc(gift.id)}"><th scope="row"><strong class="guide-gift-name">${esc(gift.name)}</strong>${gift.status !== 'confirmed' ? '<span class="guide-unverified">확인 필요 · 추천 제외</span>' : ''}${notes(gift.notes)}${giftSources(gift, data)}</th><td data-label="호감도"><span class="guide-gain">${gain(gift)}</span></td><td data-label="가격 · 효율"><div class="guide-price">${price(gift)}</div>${value === null ? '' : `<span class="guide-efficiency">100 호감도당 ${number(value)} ${esc(gift.currency)}</span>`}</td><td data-label="구매처 · 지역">${acquisition(gift)}</td></tr>`;
    }).join('')}</tbody></table></div>`;
  }

  function commonGifts(data) {
    return `<section class="guide-common-section" aria-labelledby="guide-common-title"><div class="guide-section-heading"><h2 id="guide-common-title">모든 캐릭터에게 주는 공용 선물</h2><p>교환과 생산은 해금 조건·재고·갱신 주기를 함께 확인하세요.</p></div><div class="guide-common-grid">${list(data.commonGifts).map(gift => `<article class="guide-common-gift"><div class="guide-common-heading"><h3>${esc(gift.name)}</h3><span class="guide-gain">${gain(gift)}</span></div>${gift.status !== 'confirmed' ? '<span class="guide-unverified">확인 필요</span>' : ''}${Number.isFinite(gift.price) ? `<p class="guide-common-price">${price(gift)}</p>` : ''}${acquisition(gift)}${notes(gift.notes)}${giftSources(gift, data)}</article>`).join('')}</div></section>`;
  }

  function referenceList(character, data, portraits) {
    const ids = new Set([...list(data.gifts).filter(gift => list(gift.characterIds).includes(character.id)), ...list(data.commonGifts)].flatMap(gift => list(gift.sourceIds)));
    const sources = [...ids].map(id => data.sources?.[id]).filter(source => source && external(source.url));
    const portraitSource = external(portraits?.[character.id]?.sourceUrl);
    return `<details class="guide-references"><summary>자료의 범위와 출처</summary><p>${esc(data.meta?.scopeNote || '')}</p>${notes(data.notes, 'guide-reference-notes')}${sources.length ? `<ul class="guide-reference-list">${sources.map(source => `<li><a href="${esc(external(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a><span>${date(source.checkedAt)} 확인</span></li>`).join('')}</ul>` : ''}${portraitSource ? `<p>캐릭터 이미지: <a href="${esc(portraitSource)}" target="_blank" rel="noopener noreferrer">이환 공식 자료</a></p>` : ''}<a class="guide-text-link" href="#sources">게임 노트 전체 자료 · 출처</a></details>`;
  }

  function characterDetail(route, data, portraits) {
    const character = list(data.characters).find(item => item.id === route.characterId);
    if (!character) return missing();
    const gifts = C.filterGifts(data, character.id, {query: route.query || '', sort: route.sort || 'gain'});
    const recommendations = C.recommendations(data, character.id);
    const options = [['gain', '호감도 높은 순'], ['price', '가격 낮은 순'], ['value', '비용 효율순']];
    return {
      title: `${character.name}의 상시선물`,
      subtitle: '확인된 선물을 비교하고, 구매처와 획득 조건을 확인하세요.',
      breadcrumb: `공략 · 자료 / 이환 / ${character.name}`,
      toolbar: `<div class="guide-detail-toolbar"><a class="guide-text-link" href="${href('nte', 'gifts')}">‹ 캐릭터 목록</a><button type="button" class="guide-button" data-guide-action="copy-link">캐릭터 링크 복사</button></div>`,
      content: `<div class="guide-view"><div class="guide-character-heading">${portrait(character, portraits, true)}<div><h2>${esc(character.name)}</h2><p>캐릭터별 상점 선물과 공용 획득 경로</p>${meta(data)}</div></div><div class="guide-recommendations">${recommendation(list(recommendations.highestGain), '호감도를 많이 올리려면', '확인된 상점 선물 중 증가량이 가장 큽니다.', 'gain')}${recommendation(list(recommendations.bestValue), '비용을 아끼려면', '같은 통화의 구매 가격으로 비교했습니다.', 'value')}</div>${notes(character.notes, 'guide-character-notes')}<section class="guide-shop-section" aria-labelledby="guide-shop-title"><div class="guide-section-heading"><h2 id="guide-shop-title">상점에서 구하는 선물</h2><p>공용 교환·생산 선물은 아래에서 확인할 수 있습니다.</p></div><div class="guide-gift-controls">${search(route.query, '선물 · 구매처 검색', '선물, 상점 또는 지역')}<label class="guide-sort" for="guide-sort"><span>정렬</span><select id="guide-sort" data-guide-input="sort">${options.map(([value, label]) => `<option value="${value}"${(route.sort || 'gain') === value ? ' selected' : ''}>${label}</option>`).join('')}</select></label></div><p class="guide-result-count" role="status">선물 ${gifts.length}종${route.query ? ` · “${esc(route.query)}” 검색 결과` : ''}</p>${gifts.length ? giftTable(gifts, data) : route.query ? empty('찾는 선물이 없습니다.', '다른 이름이나 구매처로 검색해 보세요.') : '<div class="guide-empty"><h3>확인된 상점 선물을 정리하고 있습니다.</h3><p>아래 공용 선물의 획득 경로를 확인해 보세요.</p></div>'}<p class="guide-efficiency-note">비용 효율 = 가격 ÷ 호감도 × 100. 이동 시간과 재고는 계산하지 않으며, 가격 미상·확인 필요 항목은 효율 추천에서 제외합니다.</p></section>${commonGifts(data)}${referenceList(character, data, portraits)}</div>`
    };
  }

  function missing() {
    return {
      title: '공략을 찾을 수 없습니다',
      subtitle: '주소를 확인하거나 캐릭터 목록에서 다시 선택해 주세요.',
      breadcrumb: '공략 · 자료',
      toolbar: '',
      content: `<div class="guide-view">${empty('연결된 캐릭터나 공략이 없습니다.', '캐릭터 목록에서 현재 제공하는 상시선물을 확인할 수 있습니다.', true)}</div>`
    };
  }

  function render(route, data = globalThis.NteGiftsData, portraits = globalThis.NteGiftPortraits || {}) {
    if (!data || !C) return {title:'공략 · 자료', subtitle:'자료를 불러오지 못했습니다.', breadcrumb:'공략 · 자료', toolbar:'', content:'<div class="guide-view guide-empty"><h2>자료를 불러오지 못했습니다.</h2><p>페이지를 새로고침해 주세요.</p></div>'};
    if (route.invalid || (route.guideId && route.guideId !== 'gifts') || (route.guideId && route.game !== 'nte')) return missing();
    if (!route.guideId) return guideList(route, data, portraits);
    return route.characterId ? characterDetail(route, data, portraits) : characterList(route, data, portraits);
  }

  return {render, catalog};
});
