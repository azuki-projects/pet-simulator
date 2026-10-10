// Comprehensive incremental / idle game suffix list
// Covers all standard orders of magnitude from Thousands (10^3) all the way to Centillion (10^303),
// which is the last standard named suffix within JavaScript's IEEE-754 double precision float (max ~1.79e308).
export const NUMBER_SUFFIXES: readonly string[] = [
  '',
  'K',    // 10^3  Thousand
  'M',    // 10^6  Million
  'B',    // 10^9  Billion
  'T',    // 10^12 Trillion
  'Qa',   // 10^15 Quadrillion
  'Qi',   // 10^18 Quintillion
  'Sx',   // 10^21 Sextillion
  'Sp',   // 10^24 Septillion
  'Oc',   // 10^27 Octillion
  'No',   // 10^30 Nonillion
  'Dc',   // 10^33 Decillion
  'Ud',   // 10^36 Undecillion
  'Dd',   // 10^39 Duodecillion
  'Td',   // 10^42 Tredecillion
  'Qad',  // 10^45 Quattuordecillion
  'Qid',  // 10^48 Quindecillion
  'Sxd',  // 10^51 Sexdecillion
  'Spd',  // 10^54 Septendecillion
  'Ocd',  // 10^57 Octodecillion
  'Nod',  // 10^60 Novemdecillion
  'Vg',   // 10^63 Vigintillion
  'Uvg',  // 10^66 Unvigintillion
  'Dvg',  // 10^69 Duovigintillion
  'Tvg',  // 10^72 Tresvigintillion
  'Qavg', // 10^75 Quattuorvigintillion
  'Qivg', // 10^78 Quinquavigintillion
  'Sxvg', // 10^81 Sesvigintillion
  'Spvg', // 10^84 Septemvigintillion
  'Ocvg', // 10^87 Octovigintillion
  'Novg', // 10^90 Novemvigintillion
  'Tg',   // 10^93 Trigintillion
  'Utg',  // 10^96 Untrigintillion
  'Dtg',  // 10^99 Duotrigintillion
  'Ttg',  // 10^102 Trestrigintillion
  'Qatg', // 10^105 Quattuortrigintillion
  'Qitg', // 10^108 Quinquatrigintillion
  'Sxtg', // 10^111 Sestrigintillion
  'Sptg', // 10^114 Septentrigintillion
  'Octg', // 10^117 Octotrigintillion
  'Notg', // 10^120 Novemtrigintillion
  'Qag',  // 10^123 Quadragintillion
  'Uqag', // 10^126 Unquadragintillion
  'Dqag', // 10^129 Duoquadragintillion
  'Tqag', // 10^132 Tresquadragintillion
  'Qaqag',// 10^135 Quattuorquadragintillion
  'Qiqag',// 10^138 Quinquaquadragintillion
  'Sxqag',// 10^141 Sesquadragintillion
  'Spqag',// 10^144 Septenquadragintillion
  'Ocqag',// 10^147 Octoquadragintillion
  'Noqag',// 10^150 Novemquadragintillion
  'Qg',   // 10^153 Quinquagintillion
  'Uqg',  // 10^156 Unquinquagintillion
  'Dqg',  // 10^159 Duoquinquagintillion
  'Tqg',  // 10^162 Tresquinquagintillion
  'Qaqg', // 10^165 Quattuorquinquagintillion
  'Qiqg', // 10^168 Quinquaquinquagintillion
  'Sxqg', // 10^171 Sesquinquagintillion
  'Spqg', // 10^174 Septenquinquagintillion
  'Ocqg', // 10^177 Octoquinquagintillion
  'Noqg', // 10^180 Novemquinquagintillion
  'Sxg',  // 10^183 Sexagintillion
  'Usxg', // 10^186 Unsexagintillion
  'Dsxg', // 10^189 Duosexagintillion
  'Tsxg', // 10^192 Tresexagintillion
  'Qasxg',// 10^195 Quattuorsexagintillion
  'Qisxg',// 10^198 Quinquasexagintillion
  'Sxsxg',// 10^201 Sesexagintillion
  'Spsxg',// 10^204 Septensexagintillion
  'Ocsxg',// 10^207 Octosexagintillion
  'Nosxg',// 10^210 Novemsexagintillion
  'Spg',  // 10^213 Septuagintillion
  'Uspg', // 10^216 Unseptuagintillion
  'Dspg', // 10^219 Duoseptuagintillion
  'Tspg', // 10^222 Tresseptuagintillion
  'Qaspg',// 10^225 Quattuorseptuagintillion
  'Qispg',// 10^228 Quinquaseptuagintillion
  'Sxspg',// 10^231 Sesseptuagintillion
  'Spspg',// 10^234 Septenseptuagintillion
  'Ocspg',// 10^237 Octoseptuagintillion
  'Nospg',// 10^240 Novemseptuagintillion
  'Ocg',  // 10^243 Octogintillion
  'Uocg', // 10^246 Unoctogintillion
  'Docg', // 10^249 Duooctogintillion
  'Tocg', // 10^252 Tresoctogintillion
  'Qaocg',// 10^255 Quattuoroctogintillion
  'Qiocg',// 10^258 Quinquaoctogintillion
  'Sxocg',// 10^261 Sesoctogintillion
  'Spocg',// 10^264 Septenoctogintillion
  'Ococg',// 10^267 Octooctogintillion
  'Noocg',// 10^270 Novemoctogintillion
  'Nog',  // 10^273 Nonagintillion
  'Unog', // 10^276 Unnonagintillion
  'Dnog', // 10^279 Duononagintillion
  'Tnog', // 10^282 Tresnonagintillion
  'Qanog',// 10^285 Quattuornonagintillion
  'Qinog',// 10^288 Quinquanonagintillion
  'Sxnog',// 10^291 Sesnonagintillion
  'Spnog',// 10^294 Septennonagintillion
  'Ocnog',// 10^297 Octononagintillion
  'Nonog',// 10^300 Novemnonagintillion
  'Ce',   // 10^303 Centillion (last named Latin suffix before JS float overflow)
  'Uce',  // 10^306 Uncentillion
];

export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (!isFinite(num)) return '∞';
  
  const absNum = Math.abs(num);
  if (absNum < 1000) {
    return Math.floor(absNum).toLocaleString();
  }

  // Calculate index in chunks of 1000 (10^3)
  const order = Math.floor(Math.log10(absNum) / 3);

  if (order < NUMBER_SUFFIXES.length) {
    const scaled = absNum / Math.pow(10, order * 3);
    const suffix = NUMBER_SUFFIXES[order];
    // Keep 2 decimals if < 10, 1 decimal if < 100, 0 decimals if >= 100
    const formatted = scaled >= 100 
      ? scaled.toFixed(0) 
      : scaled >= 10 
        ? scaled.toFixed(1) 
        : scaled.toFixed(2);
    return `${num < 0 ? '-' : ''}${formatted}${suffix}`;
  }

  // Fallback for extreme magnitudes beyond 10^306
  return num.toExponential(2);
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return 'Ready!';
  const s = Math.floor(seconds);

  if (s < 60) {
    return `${s}s`;
  }

  const m = Math.floor(s / 60);
  const remainingSeconds = s % 60;

  if (m < 60) {
    return `${m}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  }

  const h = Math.floor(m / 60);
  const remainingMinutes = m % 60;
  return `${h}h ${remainingMinutes.toString().padStart(2, '0')}m`;
}
