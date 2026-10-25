(function (root, factory) {
  'use strict';
  const portraits = factory();
  if (typeof module === 'object' && module.exports) module.exports = portraits;
  else root.NteGiftPortraits = portraits;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // Original official navigation sprites: show the upper (unselected) square.
  // Keep the source bytes intact; the guide crops their second state with CSS.
  const sources = {
    'guwon': 'main260402/role-tab-jiuyuan.png',
    'nanally': 'main260402/role-tab-nanally.png',
    'daffodill': 'main260402/role-tab-dfde.png',
    'lacrimosa': 'main260603/role-tab-an.png',
    'raven': 'main260930/role-tab-heiyu.png',
    'linko': 'main260909/role-tab-lingke.png',
    'mint': 'main260402/role-tab-mint.png',
    'baicang': 'main260402/role-tab-baicang.png',
    'sakiri': 'main260402/role-tab-zaowu.png',
    'xinku': 'main260708/role-tab-zhen.png',
    'iloy': 'main260729/role-tab-yi.png',
    'zhanhong': 'main260819/role-tab-canhong.png',
    'chiz': 'main260402/role-tab-xiaozhi.png',
    'chaos': 'main260618/role-tab-ka.png',
    'fadia': 'main260402/role-tab-fadiya.png',
    'hathor': 'main260402/role-tab-hasuoer.png',
    'hotori': 'main260513/role-tab-xun.png',
    'akane-rin': 'main261021/role-tab-mingyin.png'
  };
  return Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, {
    src: 'assets/portraits/nte/' + id + '.png',
    position: 'center top',
    sourceUrl: 'https://nte.perfectworld.com/public/images/' + source
  }]));
});
