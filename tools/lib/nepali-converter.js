"use strict";
var NepaliConverter = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    FONT_MAPS: () => FONT_MAPS,
    SUPPORTED_FONTS: () => SUPPORTED_FONTS,
    convert: () => convert,
    detectFont: () => detectFont
  });

  // src/maps/himalb.ts
  var CHARACTER_MAP = {
    "~": "\u091E",
    "!": "\u091C\u094D\u091E",
    "@": "\u0926\u094D\u0926",
    "#": "\u0918",
    $: "\u0926\u094D\u0927",
    "%": "\u091B",
    "^": "\u091F",
    "&": "\u0920",
    "*": "\u0921",
    "(": "\u0922",
    ")": "\u0923\u094D",
    _: ")",
    "+": "\u0902",
    "`": "\u091E\u094D",
    "1": "\u0967",
    "2": "\u0968",
    "3": "\u0969",
    "4": "\u096A",
    "5": "\u096B",
    "6": "\u096C",
    "7": "\u096D",
    "8": "\u096E",
    "9": "\u096F",
    "0": "\u0966",
    "-": "(",
    "=": ".",
    Q: "\u0924\u094D\u0924",
    W: "\u0927\u094D",
    E: "\u092D\u094D",
    R: "\u091A\u094D",
    T: "\u0924\u094D",
    Y: "\u0925\u094D",
    U: "\u0917\u094D",
    I: "\u0915\u094D\u0937\u094D",
    O: "\u0907",
    P: "\u090F",
    "}": "\u0948",
    "|": "\u094D\u0930",
    q: "\u0924\u094D\u0930",
    w: "\u0927",
    e: "\u092D",
    r: "\u091A",
    t: "\u0924",
    y: "\u0925",
    u: "\u0917",
    i: "\u0937\u094D",
    o: "\u092F",
    p: "\u0909",
    "[": "\u0943",
    "]": "\u0947",
    "\\": "\u094D",
    A: "\u092C\u094D",
    S: "\u0915\u094D",
    D: "\u092E\u094D",
    F: "\u093E",
    G: "\u0928\u094D",
    H: "\u091C\u094D",
    J: "\u0935\u094D",
    K: "\u092A\u094D",
    L: "\u0940",
    ":": "\u0938\u094D",
    '"': "\u0942",
    a: "\u092C",
    s: "\u0915",
    d: "\u092E",
    f: "\u093E",
    g: "\u0928",
    h: "\u091C",
    j: "\u0935",
    k: "\u092A",
    l: "\u093F",
    ";": "\u0938",
    "'": "\u0941",
    Z: "\u0936\u094D",
    X: "\u0939\u0943",
    C: "\u090B",
    V: "\u0916\u094D",
    B: "\u0926\u094D\u092F",
    N: "\u0932\u094D",
    M: "\u0903",
    "<": "?",
    ">": "\u0936\u094D\u0930",
    "?": "\u0930\u0941",
    z: "\u0936",
    x: "\u0939",
    c: "\u0905",
    v: "\u0916",
    b: "\u0926",
    n: "\u0932",
    ",": ",",
    ".": "\u0964",
    "/": "\u0930",
    "\xA1": "\u091C\u094D\u091E\u094D",
    "\xA2": "\u0926\u094D\u0918",
    "\xA3": "\u0918\u094D",
    "\xA4": "\u0901",
    "\xA5": "\u0930\u094D\u200D",
    "\xA7": "\u091F\u094D\u091F",
    "\xAA": "\u0919",
    "\xAB": "\u094D\u0930",
    "\xAD": "(",
    "\xAE": "+",
    "\xB0": "\u0919\u094D\u0915",
    "\xB4": "\u091D",
    "\xB6": "\u0920\u094D\u0920",
    "\xBB": "",
    "\xBF": "\u0930\u0942",
    "\xC6": "\u201D",
    "\xD1": "\u0919",
    "\xD2": "\u0942",
    "\xD4": "\u0915\u094D\u0937",
    "\xD7": "\xD7",
    "\xD8": "\u094D\u092F",
    "\xD9": "\u0939",
    "\xDA": "\u0941",
    "\xDF": "\u0926\u094D\u092E",
    "\xE5": "\u0926\u094D\u0935",
    "\xE6": "\u201C",
    "\xE7": "\u0950",
    "\xE9": "\u0919\u094D\u0917",
    "\xED": "\u0937",
    "\xF7": "/",
    "\xF8": "\u092F\u094D",
    "\xFA": "\u0942",
    "\xEC": "\u0924\u094D\u0924\u094D"
  };

  // src/maps/kantipur.ts
  var CHARACTER_MAP2 = {
    "~": "\u091E\u094D",
    "!": "\u0967",
    "@": "\u0968",
    "#": "\u0969",
    "$": "\u096A",
    "%": "\u096B",
    "^": "\u096C",
    "&": "\u096D",
    "*": "\u096E",
    "(": "\u096F",
    ")": "\u0966",
    _: ")",
    "+": "\u0902",
    "`": "\u091E",
    "1": "\u091C\u094D\u091E",
    "2": "\u0926\u094D\u0926",
    "3": "\u0918",
    "4": "\u0926\u094D\u0927",
    "5": "\u091B",
    "6": "\u091F",
    "7": "\u0920",
    "8": "\u0921",
    "9": "\u0922",
    "0": "\u0923\u094D",
    "-": "(",
    "=": ".",
    Q: "\u0924\u094D\u0924",
    W: "\u0927\u094D",
    E: "\u092D\u094D",
    R: "\u091A\u094D",
    T: "\u0924\u094D",
    Y: "\u0925\u094D",
    U: "\u0917\u094D",
    I: "\u0915\u094D\u0937\u094D",
    O: "\u0907",
    P: "\u090F",
    "}": "\u0948",
    "|": "\u094D\u0930",
    q: "\u0924\u094D\u0930",
    w: "\u0927",
    e: "\u092D",
    r: "\u091A",
    t: "\u0924",
    y: "\u0925",
    u: "\u0917",
    i: "\u0937\u094D",
    o: "\u092F",
    p: "\u0909",
    "[": "\u0943",
    "]": "\u0947",
    "\\": "\u094D",
    A: "\u092C\u094D",
    S: "\u0915\u094D",
    D: "\u092E\u094D",
    F: "\u093E",
    G: "\u0928\u094D",
    H: "\u091C\u094D",
    J: "\u0935\u094D",
    K: "\u092A\u094D",
    L: "\u0940",
    ":": "\u0938\u094D",
    '"': "\u0942",
    a: "\u092C",
    s: "\u0915",
    d: "\u092E",
    f: "\u093E",
    g: "\u0928",
    h: "\u091C",
    j: "\u0935",
    k: "\u092A",
    l: "\u093F",
    ";": "\u0938",
    "'": "\u0941",
    Z: "\u0936\u094D",
    X: "\u0939\u0943",
    C: "\u090B",
    V: "\u0916\u094D",
    B: "\u0926\u094D\u092F",
    N: "\u0932\u094D",
    M: "\u0903",
    "<": "?",
    ">": "\u0936\u094D\u0930",
    "?": "\u0930\u0941",
    z: "\u0936",
    x: "\u0939",
    c: "\u0905",
    v: "\u0916",
    b: "\u0926",
    n: "\u0932",
    ",": ",",
    ".": "\u0964",
    "/": "\u0930",
    "\u201E": "\u0927\u094D\u0930",
    "\u2026": "\u2018",
    "\u2020": "!",
    "\u2030": "\u091D\u094D",
    "\u2039": "\u0919\u094D\u0917",
    "\u0152": "\u0924\u094D\u0924\u094D",
    "\u2018": "\u0945",
    "\u201C": "\u0901",
    "\u2022": "\u0921\u094D\u0921",
    "\u02DC": "\u093D",
    "\u2122": "\u0930",
    "\u203A": "\u093D",
    "\u0153": "\u0924\u094D\u0930\u094D",
    "\xA1": "\u091C\u094D\u091E\u094D",
    "\xA2": "\u0926\u094D\u0918",
    "\xA3": "\u0918\u094D",
    "\xA4": "\u091D\u094D",
    "\xA5": "\u0930\u094D\u200D",
    "\xA7": "\u091F\u094D\u091F",
    "\xA8": "\u0919\u094D\u0917",
    "\xA9": "\u0930",
    "\xAA": "\u0919",
    "\xAB": "\u094D\u0930",
    "\xAC": "\u2026",
    "\xAD": "(",
    "\xAE": "\u0930",
    "\xAF": "\xAF",
    "\xB0": "\u0919\u094D\u0922",
    "\xB1": "+",
    "\xB4": "\u091D",
    "\xB5": "\u0930",
    "\xB6": "\u0920\u094D\u0920",
    "\xBA": "\u092B\u094D",
    "\xBF": "\u0930\u0942",
    "\xC2": "\u0930",
    "\xC6": "\u201D",
    "\xC8": "\u0937",
    "\xCB": "\u0919\u094D\u0917",
    "\xCC": "\u0928\u094D\u0928",
    "\xCD": "\u0919\u094D\u0915",
    "\xCE": "\u092B\u094D",
    "\xCF": "\u092B\u094D",
    "\xD2": "\xA8",
    "\xD4": "\u0915\u094D\u0937",
    "\xD8": "\u094D\u092F",
    "\xDA": "\u2019",
    "\xDF": "\u0926\u094D\u092E",
    "\xE5": "\u0926\u094D\u0935",
    "\xE6": "\u201C",
    "\xE7": "\u0950",
    "\xF7": "/",
    "\xF8": "\u092F\u094D",
    "\xEC": "\u0924\u094D\u0924\u094D"
  };

  // src/maps/preeti.ts
  var CHARACTER_MAP3 = {
    "0": "\u0923\u094D",
    "1": "\u091C\u094D\u091E",
    "2": "\u0926\u094D\u0926",
    "3": "\u0918",
    "4": "\u0926\u094D\u0927",
    "5": "\u091B",
    "6": "\u091F",
    "7": "\u0920",
    "8": "\u0921",
    "9": "\u0922",
    "~": "\u091E\u094D",
    "!": "\u0967",
    "@": "\u0968",
    "#": "\u0969",
    "$": "\u096A",
    "%": "\u096B",
    "^": "\u096C",
    "&": "\u096D",
    "*": "\u096E",
    "(": "\u096F",
    ")": "\u0966",
    _: ")",
    "+": "\u0902",
    "`": "\u091E",
    "-": "(",
    "=": ".",
    Q: "\u0924\u094D\u0924",
    W: "\u0927\u094D",
    E: "\u092D\u094D",
    R: "\u091A\u094D",
    T: "\u0924\u094D",
    Y: "\u0925\u094D",
    U: "\u0917\u094D",
    I: "\u0915\u094D\u0937\u094D",
    O: "\u0907",
    P: "\u090F",
    "}": "\u0948",
    "|": "\u094D\u0930",
    q: "\u0924\u094D\u0930",
    w: "\u0927",
    e: "\u092D",
    r: "\u091A",
    t: "\u0924",
    y: "\u0925",
    u: "\u0917",
    i: "\u0937\u094D",
    o: "\u092F",
    p: "\u0909",
    "[": "\u0943",
    "]": "\u0947",
    "\\": "\u094D",
    A: "\u092C\u094D",
    S: "\u0915\u094D",
    D: "\u092E\u094D",
    F: "\u0901",
    G: "\u0928\u094D",
    H: "\u091C\u094D",
    J: "\u0935\u094D",
    K: "\u092A\u094D",
    L: "\u0940",
    ":": "\u0938\u094D",
    '"': "\u0942",
    a: "\u092C",
    s: "\u0915",
    d: "\u092E",
    f: "\u093E",
    g: "\u0928",
    h: "\u091C",
    j: "\u0935",
    k: "\u092A",
    l: "\u093F",
    ";": "\u0938",
    "'": "\u0941",
    Z: "\u0936\u094D",
    X: "\u0939\u094D",
    C: "\u090B",
    V: "\u0916\u094D",
    B: "\u0926\u094D\u092F",
    N: "\u0932\u094D",
    M: "\u0903",
    "<": "?",
    ">": "\u0936\u094D\u0930",
    "?": "\u0930\u0941",
    z: "\u0936",
    x: "\u0939",
    c: "\u0905",
    v: "\u0916",
    b: "\u0926",
    n: "\u0932",
    ",": ",",
    ".": "\u0964",
    "/": "\u0930",
    "\u201E": "\u0927\u094D\u0930",
    "\u2026": "\u2018",
    "\u02C6": "\u092B\u094D",
    "\u2030": "\u091D\u094D",
    "\u2039": "\u0919\u094D\u0918",
    "\u2018": "\u0945",
    "\u2022": "\u0921\u094D\u0921",
    "\u02DC": "\u093D",
    "\u203A": "\u0926\u094D\u0930",
    "\xA1": "\u091C\u094D\u091E\u094D",
    "\xA2": "\u0926\u094D\u0918",
    "\xA3": "\u0918\u094D",
    "\xA4": "\u091D\u094D",
    "\xA5": "\u0930\u094D\u200D",
    "\xA7": "\u091F\u094D\u091F",
    "\xA9": "\u0930",
    "\xAA": "\u0919",
    "\xAB": "\u094D\u0930",
    "\xB0": "\u0919\u094D\u0922",
    "\xB1": "+",
    "\xB4": "\u091D",
    "\xB6": "\u0920\u094D\u0920",
    "\xBF": "\u0930\u0942",
    "\xC5": "\u0939\u0943",
    "\xC6": "\u201D",
    "\xCB": "\u0919\u094D\u0917",
    "\xCC": "\u0928\u094D\u0928",
    "\xCD": "\u0919\u094D\u0915",
    "\xCE": "\u0919\u094D\u0916",
    "\xD2": "\xA8",
    "\xD6": "=",
    "\xD7": "\xD7",
    "\xD8": "\u094D\u092F",
    "\xD9": ";",
    "\xDA": "\u2019",
    "\xDB": "!",
    "\xDC": "%",
    "\xDD": "\u091F\u094D\u0920",
    "\xDF": "\u0926\u094D\u092E",
    "\xE5": "\u0926\u094D\u0935",
    "\xE6": "\u201C",
    "\xE7": "\u0950",
    "\xF7": "/",
    "\xEC": "\u0924\u094D\u0924\u094D"
  };

  // src/maps/sagarmatha.ts
  var CHARACTER_MAP4 = {
    "~": "\u091E\u094D",
    "!": "\u0967",
    "@": "\u0968",
    "#": "\u0969",
    "$": "\u096A",
    "%": "\u096B",
    "^": "\u096C",
    "&": "\u096D",
    "*": "\u096E",
    "(": "\u096F",
    ")": "\u0966",
    _: ")",
    "+": "\u0902",
    "`": "\u091E",
    "1": "\u091C\u094D\u091E",
    "2": "\u0926\u094D\u0926",
    "3": "\u0918",
    "4": "\u0926\u094D\u0927",
    "5": "\u091B",
    "6": "\u091F",
    "7": "\u0920",
    "8": "\u0921",
    "9": "\u0922",
    "0": "\u0923\u094D",
    "-": "(",
    "=": ".",
    Q: "\u0924\u094D\u0924",
    W: "\u0927\u094D",
    E: "\u092D\u094D",
    R: "\u091A\u094D",
    T: "\u0924\u094D",
    Y: "\u0925\u094D",
    U: "\u0917\u094D",
    I: "\u0915\u094D\u0937\u094D",
    O: "\u0907",
    P: "\u090F",
    "}": "\u0948",
    "|": "\u094D\u0930",
    q: "\u0924\u094D\u0930",
    w: "\u0927",
    e: "\u092D",
    r: "\u091A",
    t: "\u0924",
    y: "\u0925",
    u: "\u0917",
    i: "\u0937\u094D",
    o: "\u092F",
    p: "\u0909",
    "[": "\u0943",
    "]": "\u0947",
    "\\": "\u094D",
    A: "\u092C\u094D",
    S: "\u0915\u094D",
    D: "\u092E\u094D",
    F: "\u0901",
    G: "\u0928\u094D",
    H: "\u091C\u094D",
    J: "\u0935\u094D",
    K: "\u092A\u094D",
    L: "\u0940",
    ":": "\u0938\u094D",
    '"': "\u0942",
    a: "\u092C",
    s: "\u0915",
    d: "\u092E",
    f: "\u093E",
    g: "\u0928",
    h: "\u091C",
    j: "\u0935",
    k: "\u092A",
    l: "\u093F",
    ";": "\u0938",
    "'": "\u0941",
    Z: "\u0936\u094D",
    X: "\u0939\u094D",
    C: "\u090B",
    V: "\u0916\u094D",
    B: "\u0926\u094D\u092F",
    N: "\u0932\u094D",
    M: "\u0903",
    "<": "?",
    ">": "\u0936\u094D\u0930",
    "?": "\u0930\u0941",
    z: "\u0936",
    x: "\u0939",
    c: "\u0905",
    v: "\u0916",
    b: "\u0926",
    n: "\u0932",
    ",": ",",
    ".": "\u0964",
    "/": "\u0930",
    "\u201A": ")",
    "\u0192": "\u0926\u094D\u0930",
    "\u201E": "\u094D",
    "\u2020": ";",
    "\u2021": "\u0947",
    "\u02C6": "\u0943",
    "\u2030": "\u091D\u094D",
    "\u0160": "\u0930\u094D",
    "\u2039": "\u0948",
    "\u0152": "\u0924\u094D\u0924\u094D",
    "\u2018": "\u2018",
    "\u2019": "\u2019",
    "\u201C": "\u0901",
    "\u201D": "\u201D",
    "\u0153": "\u0924\u094D\u0930\u094D",
    "\xA1": "\u091C\u094D\u091E\u094D",
    "\xA2": "\u0926\u094D\u0918",
    "\xA3": "\u0918\u094D",
    "\xA4": "!",
    "\xA5": "\u0930\u094D\u200D",
    "\xA7": "\u091F\u094D\u091F",
    "\xAA": "\u0919",
    "\xAB": "\u094D\u0930",
    "\xAC": "\u0941",
    "\xAD": "(",
    "\xAE": "\u0930",
    "\xB0": "\u0919\u094D\u0915",
    "\xB1": "+",
    "\xB4": "\u091D",
    "\xB5": "\u091D",
    "\xB6": "\u0920\u094D\u0920",
    "\xB7": "\u0919\u094D\u0917",
    "\xB8": "\u0921\u094D\u0921",
    "\xBF": "\u0930\u0942",
    "\xC5": "\u092B",
    "\xC6": "\u201D",
    "\xC7": "\u092B\u094D",
    "\xC8": "\u0937",
    "\xC9": "\u0938",
    "\xD2": "\u0942",
    "\xD4": "\u0915\u094D\u0937",
    "\xD8": "\u094D\u092F",
    "\xD9": "\u0939",
    "\xDC": "%",
    "\xDE": "\u0939\u094D",
    "\xDF": "\u0926\u094D\u092E",
    "\xE5": "\u0926\u094D\u0935",
    "\xE6": "\u201C",
    "\xE7": "\u0950",
    "\xE8": "\u0926\u094D\u092D",
    "\xF7": "/",
    "\xF8": "\u092F\u094D",
    "\xEC": "\u0924\u094D\u0924\u094D"
  };

  // src/maps/index.ts
  var FONT_MAPS = {
    preeti: CHARACTER_MAP3,
    kantipur: CHARACTER_MAP2,
    sagarmatha: CHARACTER_MAP4,
    himalb: CHARACTER_MAP
  };
  var SUPPORTED_FONTS = Object.keys(FONT_MAPS);

  // src/converter.ts
  var POST_RULES = [
    [/्ा/g, ""],
    [/(त्र|त्त)([^उभप]+?)m/g, "$1m$2"],
    [/त्रm/g, "\u0915\u094D\u0930"],
    [/त्तm/g, "\u0915\u094D\u0924"],
    [/व्रm/g, "\u0915\u094D\u0930"],
    [/([^उभप]+?)m/g, "m$1"],
    [/उm/g, "\u090A"],
    [/भm/g, "\u091D"],
    [/पm/g, "\u092B"],
    [/इ\{/g, "\u0908"],
    [/ि((.्)*[^्])/g, "$1\u093F"],
    [/(.[ािीुूृेैोौंःँ]*?)\{/g, "{$1"],
    [/((.्)*)\{/g, "{$1"],
    [/\{/g, "\u0930\u094D"],
    [/([ाीुूृेैोौंःँ]+?)(्(.्)*[^्])/g, "$2$1"],
    [/्([ाीुूृेैोौंःँ]+?)((.्)*[^्])/g, "\u094D$2$1"],
    [/([ंँ])([ािीुूृेैोौः]*)/g, "$2$1"],
    [/ँँ/g, "\u0901"],
    [/ंं/g, "\u0902"],
    [/ेे/g, "\u0947"],
    [/ैै/g, "\u0948"],
    [/ुु/g, "\u0941"],
    [/ूू/g, "\u0942"],
    [/^ः/g, ":"],
    [/टृ/g, "\u091F\u094D\u091F"],
    [/ेा/g, "\u093E\u0947"],
    [/ैा/g, "\u093E\u0948"],
    [/अाे/g, "\u0913"],
    [/अाै/g, "\u0914"],
    [/अा/g, "\u0906"],
    [/एे/g, "\u0910"],
    [/ाे/g, "\u094B"],
    [/ाै/g, "\u094C"]
  ];
  function convert(text, sourceFont) {
    const fontKey = sourceFont.toLowerCase();
    const charMap = FONT_MAPS[fontKey];
    if (!charMap) {
      throw new Error(
        `Unknown font: ${JSON.stringify(sourceFont)}. Supported: ${SUPPORTED_FONTS.join(", ")}`
      );
    }
    const tokens = text.split(/(\s+)/);
    const out = [];
    for (const token of tokens) {
      if (!token || /^\s+$/.test(token)) {
        out.push(token);
        continue;
      }
      let mapped = "";
      for (const ch of token) {
        mapped += charMap[ch] ?? ch;
      }
      for (const [pattern, replacement] of POST_RULES) {
        mapped = mapped.replace(pattern, replacement);
      }
      out.push(mapped);
    }
    return out.join("");
  }

  // src/detector.ts
  var FONT_SIGNATURES = {
    preeti: /* @__PURE__ */ new Set(["\u02C6", "\u203A", "\xCB", "\xCC", "\xCD", "\xCE"]),
    kantipur: /* @__PURE__ */ new Set(["\u2122", "\xC2", "\xB5", "\xBA", "\xCF", "\xF8"]),
    sagarmatha: /* @__PURE__ */ new Set(["\u0192", "\u0160", "\u2021", "\xB7", "\xB8", "\xC7", "\xC9", "\xDE", "\xE8"]),
    himalb: /* @__PURE__ */ new Set(["\xD1", "\xE9", "\xED", "\xFA"])
  };
  var LEGACY_SPECIAL = /* @__PURE__ */ new Set(["{", "}", "[", "]", "|", "\\"]);
  function isDevanagari(text) {
    for (const ch of text) {
      if (ch >= "\u0900" && ch <= "\u097F" || ch >= "\uA8E0" && ch <= "\uA8FF") {
        return true;
      }
    }
    return false;
  }
  function hasNonAsciiLegacy(text) {
    for (const ch of text) {
      const code = ch.charCodeAt(0);
      if (code >= 128 && code <= 255 || [
        338,
        339,
        352,
        402,
        710,
        732,
        8216,
        8217,
        8218,
        8220,
        8221,
        8222,
        8224,
        8225,
        8226,
        8230,
        8240,
        8249,
        8250,
        8482
      ].includes(code)) {
        return true;
      }
    }
    return false;
  }
  function detectFont(text) {
    if (!text || !text.trim()) {
      return null;
    }
    if (isDevanagari(text)) {
      return null;
    }
    const chars = new Set(text.split(""));
    const scores = {};
    for (const [fontName, signatures] of Object.entries(FONT_SIGNATURES)) {
      let score = 0;
      for (const ch of chars) {
        if (signatures.has(ch)) {
          score += 1;
        }
      }
      scores[fontName] = score;
    }
    let best = null;
    let bestScore = 0;
    for (const [fontName, score] of Object.entries(scores)) {
      if (score > bestScore) {
        best = fontName;
        bestScore = score;
      }
    }
    if (best && bestScore > 0) {
      return best;
    }
    if (hasNonAsciiLegacy(text)) {
      return "preeti";
    }
    let specialCount = 0;
    let nonSpace = 0;
    for (const ch of text) {
      if (!/\s/.test(ch)) {
        nonSpace += 1;
        if (LEGACY_SPECIAL.has(ch)) {
          specialCount += 1;
        }
      }
    }
    if (nonSpace > 0 && specialCount / nonSpace > 0.05) {
      return "preeti";
    }
    return null;
  }
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=index.global.js.map