/**
 * CUSTOM PERMISSIVE SOURCE LICENSE (WITH TARGETED EXCLUSION)
 * Copyright (c) 2026 Ngvida2108. All rights reserved.
 * 
 * Part of this file is derived from chess.js (Copyright (c) Jeff Hlywa, BSD-2-Clause).
 * Optimized Bitboards & 15 Variants implementation by Ngvida2108.
 * 
 * 1. TARGETED ENTITY EXCLUSION:
 *    Under no circumstances is Chess.com, LLC or its subsidiaries granted 
 *    permission to view, copy, use, train AI models on, or integrate this software.
 * 
 * 2. COMMERCIAL FREEDOM FOR ALL OTHER PARTIES:
 *    All other commercial entities, competitors, and developers are granted
 *    full commercial rights to use and embed this file into closed-source software.
 */
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];
export const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const CHESS960_FENS = (function() {
    const fens = [];
    const knight_table = [[0,1], [0,2], [0,3], [0,4], [1,2], [1,3], [1,4], [2,3], [2,4], [3,4]];
    for (let i = 0; i < 960; i++) {
        let n = i;
        let b1 = n % 4; n = Math.floor(n / 4);
        let b2 = n % 4; n = Math.floor(n / 4);
        let q = n % 6; n = Math.floor(n / 6);
        let arr = Array(8).fill('');
        arr[b1 * 2 + 1] = 'B';
        arr[b2 * 2] = 'B';
        let empty = () => arr.map((v, idx) => v === '' ? idx : -1).filter(idx => idx !== -1);
        arr[empty()[q]] = 'Q';
        let k_pos = knight_table[n];
        let e = empty();
        arr[e[k_pos[0]]] = 'N';
        arr[e[k_pos[1]]] = 'N';
        e = empty();
        arr[e[0]] = 'R';
        arr[e[1]] = 'K';
        arr[e[2]] = 'R';
        let backRank = arr.join('');
        fens.push(`${backRank.toLowerCase()}/pppppppp/8/8/8/8/PPPPPPPP/${backRank} w KQkq - 0 1`);
    }
    return fens;
})();
export const VARIANT_STARTING_FENS = {
    'classical': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'chess960': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    '3check': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 +0+0',
    'antichess': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1',
    'atomic': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'bughouse': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR[] w KQkq - 0 1',
    'chaturanga': 'rnbkqbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1',
    'crazyhouse': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR[] w KQkq - 0 1',
    'duck': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'horde': 'rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP w kq - 0 1',
    'kingofthehill': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'racingkings': '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1',
    'placement': '8/8/8/8/8/8/8/8[RNBQKBNRPPPPPPPPrnbqkbnrpppppppp] w KQkq - 0 1',
    'alice': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'spell': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 [S:0,0,0,0,5,2,5,2,-1,0,-1,0,-1,0,-1,0]',
};
export const ISO_TO_COUNTRY_NAME = {
    "us": "United States", "ca": "Canada", "ar": "Argentina", "be": "Belgium", "af": "Afghanistan",
    "al": "Albania", "ad": "Andorra", "ai": "Anguilla", "ag": "Antigua and Barbuda", "am": "Armenia",
    "aw": "Aruba", "au": "Australia", "at": "Austria", "bs": "Bahamas", "bh": "Bahrain", "bb": "Barbados",
    "xx": "International", "bz": "Belize", "bm": "Bermuda", "bo": "Bolivia", "ba": "Bosnia and Herzegovina",
    "br": "Brazil", "bg": "Bulgaria", "es-cn": "Canary Islands", "ky": "Cayman Islands", "cl": "Chile",
    "cn": "China", "co": "Colombia", "cr": "Costa Rica", "hr": "Croatia", "cu": "Cuba", "cw": "Curaçao",
    "cy": "Cyprus", "cz": "Czech Republic", "dk": "Denmark", "dm": "Dominica", "do": "Dominican Republic",
    "ec": "Ecuador", "eg": "Egypt", "sv": "El Salvador", "ee": "Estonia", "fk": "Falkland Islands",
    "fo": "Faroe Islands", "fj": "Fiji", "fi": "Finland", "fr": "France", "ge": "Georgia", "de": "Germany",
    "gi": "Gibraltar", "gr": "Greece", "gl": "Greenland", "gd": "Grenada", "gp": "Guadeloupe", "gu": "Guam",
    "gt": "Guatemala", "gg": "Guernsey", "gy": "Guyana", "ht": "Haiti", "hn": "Honduras", "hk": "Hong Kong",
    "hu": "Hungary", "is": "Iceland", "in": "India", "id": "Indonesia", "ir": "Iran", "iq": "Iraq",
    "ie": "Ireland", "im": "Isle of Man", "il": "Israel", "it": "Italy", "jm": "Jamaica", "jp": "Japan",
    "je": "Jersey", "jo": "Jordan", "kz": "Kazakhstan", "ki": "Kiribati", "kw": "Kuwait", "lv": "Latvia",
    "lb": "Lebanon", "li": "Liechtenstein", "lt": "Lithuania", "lu": "Luxembourg", "mo": "Macau",
    "mk": "North Macedonia", "my": "Malaysia", "mt": "Malta", "mq": "Martinique", "md": "Moldova",
    "mx": "Mexico", "mc": "Monaco", "ms": "Montserrat", "nr": "Nauru", "np": "Nepal", "nl": "Netherlands",
    "nz": "New Zealand", "ni": "Nicaragua", "no": "Norway", "om": "Oman", "pk": "Pakistan", "pa": "Panama",
    "pg": "Papua New Guinea", "py": "Paraguay", "pe": "Peru", "ph": "Philippines", "pl": "Poland",
    "pt": "Portugal", "pr": "Puerto Rico", "ro": "Romania", "ru": "Russia", "kn": "Saint Kitts and Nevis",
    "lc": "Saint Lucia", "pm": "Saint Pierre and Miquelon", "sm": "San Marino", "sa": "Saudi Arabia",
    "sg": "Singapore", "sk": "Slovakia", "si": "Slovenia", "sb": "Solomon Islands", "za": "South Africa",
    "gs": "South Georgia", "sr": "Suriname", "se": "Sweden", "ch": "Switzerland", "tw": "Taiwan",
    "th": "Thailand", "to": "Tonga", "tt": "Trinidad and Tobago", "tr": "Turkey", "tm": "Turkmenistan",
    "tv": "Tuvalu", "ua": "Ukraine", "ae": "United Arab Emirates", "uy": "Uruguay", "uz": "Uzbekistan",
    "vu": "Vanuatu", "va": "Vatican City", "ve": "Venezuela", "vn": "Vietnam", "ye": "Yemen",
    "as": "American Samoa", "vc": "Saint Vincent and the Grenadines", "az": "Azerbaijan", "mn": "Mongolia",
    "sy": "Syria", "gb-eng": "England", "mh": "Marshall Islands", "gb-sct": "Scotland", "es": "Spain",
    "gb": "United Kingdom", "vi": "U.S. Virgin Islands", "gb-wls": "Wales", "kr": "South Korea",
    "kg": "Kyrgyzstan", "bd": "Bangladesh", "sd": "Sudan", "bj": "Benin", "bt": "Bhutan", "bw": "Botswana",
    "bn": "Brunei", "bi": "Burundi", "kh": "Cambodia", "cm": "Cameroon", "cv": "Cape Verde",
    "cf": "Central African Republic", "td": "Chad", "cg": "Republic of the Congo", "ci": "Ivory Coast",
    "dj": "Djibouti", "gq": "Equatorial Guinea", "ga": "Gabon", "gh": "Ghana", "ke": "Kenya", "la": "Laos",
    "lr": "Liberia", "mg": "Madagascar", "ma": "Morocco", "mz": "Mozambique", "mm": "Myanmar",
    "na": "Namibia", "ne": "Niger", "ng": "Nigeria", "qa": "Qatar", "rw": "Rwanda", "ws": "Samoa",
    "st": "Sao Tome and Principe", "sn": "Senegal", "sl": "Sierra Leone", "so": "Somalia", "lk": "Sri Lanka",
    "sz": "Eswatini", "tj": "Tajikistan", "tz": "Tanzania", "tl": "East Timor", "tg": "Togo", "tn": "Tunisia",
    "ug": "Uganda", "zm": "Zambia", "zw": "Zimbabwe", "dz": "Algeria", "mr": "Mauritania"
};
export const NAG_MAP = {
    '1': { symbol:'!', cls:'ind-1', color:'#5c8bb0', borderColor:'#28a2e7', type:'good', textColor:'#ffffff'},
    '!': { symbol:'!', cls:'ind-1', color:'#5c8bb0', borderColor:'#28a2e7', type:'good', textColor:'#ffffff'},
    '2': { symbol:'?', cls:'ind-2', color:'#ffa700', borderColor:'#af5205', type:'mistake', textColor:'#ffffff'},
    '?': { symbol:'?', cls:'ind-2', color:'#ffa700', borderColor:'#af5205', type:'mistake', textColor:'#ffffff'},
    '3': { symbol:'!!', cls:'ind-3', color:'#26c2a3', borderColor:'#09e9ed', type:'brilliant', textColor:'#ffffff'},
    '!!': { symbol:'!!', cls:'ind-3', color:'#26c2a3', borderColor:'#09e9ed', type:'brilliant', textColor:'#ffffff'},
    '4': { symbol:'??', cls:'ind-4', color:'#fa412d', borderColor:'#892c12', type:'blunder', textColor:'#ffffff'},
    '??': { symbol:'??', cls:'ind-4', color:'#fa412d', borderColor:'#892c12', type:'blunder', textColor:'#ffffff'},
    '5': { symbol:'!?', cls:'ind-5', color:'#b369f2', borderColor:'#bd09ed', type:'interesting', textColor:'#ffffff'},
    '!?': { symbol:'!?', cls:'ind-5', color:'#b369f2', borderColor:'#bd09ed', type:'interesting', textColor:'#ffffff'},
    '6': { symbol:'?!', cls:'ind-6', color:'#f7c045', borderColor:'#f5d91d', type:'inaccuracy', textColor:'#ffffff'},
    '?!': { symbol:'?!', cls:'ind-6', color:'#f7c045', borderColor:'#f5d91d', type:'inaccuracy', textColor:'#ffffff'},
    '7': { symbol:'!', cls:'ind-1', color:'#96bc4b', borderColor:'#6c8a32', type:'excellent', textColor:'#ffffff'},
    '8': { symbol:'!', cls:'ind-1', color:'#5c8bb0', borderColor:'#3a6280', type:'great', textColor:'#ffffff'},
    '9': { symbol:'X', cls:'ind-2', color:'#ff7769', borderColor:'#c75446', type:'miss', textColor:'#ffffff'},
    '10': { symbol:'=', color:'#e2e8f0', borderColor:'#cbd5e1', type:'eval_eq', textColor:'#000000'},
    '=': { symbol:'=', color:'#e2e8f0', borderColor:'#cbd5e1', type:'eval_eq', textColor:'#000000'},
    '13': { symbol:'∞', color:'#e2e8f0', borderColor:'#cbd5e1', type:'eval_eq', textColor:'#000000'},
    '∞': { symbol:'∞', color:'#e2e8f0', borderColor:'#cbd5e1', type:'eval_eq', textColor:'#000000'},
    '14': { symbol:'⩲', color:'#ffffff', borderColor:'#cbd5e1', type:'eval_w', textColor:'#000000'},
    '⩲': { symbol:'⩲', color:'#ffffff', borderColor:'#cbd5e1', type:'eval_w', textColor:'#000000'},
    '+=': { symbol:'⩲', color:'#ffffff', borderColor:'#cbd5e1', type:'eval_w', textColor:'#000000'},
    '15': { symbol:'⩱', color:'#1e293b', borderColor:'#0f172a', type:'eval_b', textColor:'#ffffff'},
    '⩱': { symbol:'⩱', color:'#1e293b', borderColor:'#0f172a', type:'eval_b', textColor:'#ffffff'},
    '=+': { symbol:'⩱', color:'#1e293b', borderColor:'#0f172a', type:'eval_b', textColor:'#ffffff'},
    '16': { symbol:'±', color:'#ffffff', borderColor:'#cbd5e1', type:'eval_w', textColor:'#000000'},
    '±': { symbol:'±', color:'#ffffff', borderColor:'#cbd5e1', type:'eval_w', textColor:'#000000'},
    '+/-': { symbol:'±', color:'#ffffff', borderColor:'#cbd5e1', type:'eval_w', textColor:'#000000'},
    '17': { symbol:'∓', color:'#1e293b', borderColor:'#0f172a', type:'eval_b', textColor:'#ffffff'},
    '∓': { symbol:'∓', color:'#1e293b', borderColor:'#0f172a', type:'eval_b', textColor:'#ffffff'},
    '-/+': { symbol:'∓', color:'#1e293b', borderColor:'#0f172a', type:'eval_b', textColor:'#ffffff'},
    '18': { symbol:'+-', color:'#ffffff', borderColor:'#cbd5e1', type:'eval_w', textColor:'#000000'},
    '+-': { symbol:'+-', color:'#ffffff', borderColor:'#cbd5e1', type:'eval_w', textColor:'#000000'},
    '19': { symbol:'-+', color:'#1e293b', borderColor:'#0f172a', type:'eval_b', textColor:'#ffffff'},
    '-+': { symbol:'-+', color:'#1e293b', borderColor:'#0f172a', type:'eval_b', textColor:'#ffffff'}
};