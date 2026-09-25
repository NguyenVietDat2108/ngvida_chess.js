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
import { MoveNode } from './MoveNode.js';

function resolveEngine(customEngine) {
    if (customEngine) return customEngine;
    if (typeof Chess === 'function') return Chess;
    if (typeof window !== 'undefined' && typeof window.Chess === 'function') return window.Chess;
    if (typeof globalThis !== 'undefined' && typeof globalThis.Chess === 'function') return globalThis.Chess;
    return null;
}

function resolveStartingFen(gameMode) {
    let fens = (typeof window !== 'undefined' && window.VARIANT_STARTING_FENS) 
        ? window.VARIANT_STARTING_FENS 
        : (typeof globalThis !== 'undefined' ? globalThis.VARIANT_STARTING_FENS : null);
    if (fens && fens[gameMode]) return fens[gameMode];
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
}

function getVariantSafePosKey(fen) {
    if (!fen) return "";
    let p1 = fen.indexOf(' '); if (p1 === -1) return fen;
    let p2 = fen.indexOf(' ', p1 + 1); if (p2 === -1) return fen;
    let p3 = fen.indexOf(' ', p2 + 1); if (p3 === -1) return fen;
    let p4 = fen.indexOf(' ', p3 + 1); if (p4 === -1) return fen;
    let p6 = fen.indexOf(' ', (fen.indexOf(' ', p4 + 1) !== -1 ? fen.indexOf(' ', p4 + 1) + 1 : -1));
    let base = fen.substring(0, p4) + " 0 1";
    return p6 !== -1 ? base + fen.substring(p6) : base;
}

// ============================================================================
// 1.PARSE PGN (FULL TELEMETRY)
// ============================================================================
export function parsePGN(pgnStr, defaultVariant = 'classical', customEngineClass = null) {
    if (!pgnStr || typeof pgnStr !== 'string') return null;

    const EngineClass = resolveEngine(customEngineClass);
    if (!EngineClass) throw new Error("ngvida_chess engine not found!");

    const headers = {};
    const headerRegex = /\[([A-Za-z0-9_]+)\s+"([^"]*)"\]/g;
    let match;
    while ((match = headerRegex.exec(pgnStr)) !== null) headers[match[1]] = match[2];

    let gameMode = defaultVariant;
    let rawVar = headers['Variant'] || headers['RuleVariants'];
    if (rawVar) {
        let v = rawVar.toLowerCase().replace(/[-_ ]/g, '');
        const modeMap = {
            'standard': 'classical', 'classical': 'classical', 'chess960': 'chess960',
            '3check': '3check', 'antichess': 'antichess', 'atomic': 'atomic',
            'crazyhouse': 'crazyhouse', 'bughouse': 'bughouse', 'duck': 'duck',
            'spell': 'spell', 'horde': 'horde', 'racingkings': 'racingkings'
        };
        if (modeMap[v]) gameMode = modeMap[v];
    }

    const engine = new EngineClass(undefined, gameMode);
    let startFen = headers['FEN'] || resolveStartingFen(gameMode);
    engine.load(startFen);

    const rootNode = new MoveNode(startFen, null);
    let currentNode = rootNode;

    const fenCache = new Map([[startFen, startFen]]);
    const pvTransMap = new Map();

    const tlRegex = /tl\s*=\s*(-?\d+(\.\d+)?)/i;
    const lichessEvalRegex = /\[\%eval\s+([#]?[+-]?[\d\.]+)\]/i; 
    const lichessClkRegex = /\[\%clk\s+([0-9:\.]+)\]/i; 
    const lichessCalRegex = /\[\%cal\s+([^\]]+)\]/i;
    const lichessCslRegex = /\[\%csl\s+([^\]]+)\]/i;
    const decodeLichessColor = (c) => {
        if (c === 'R') return 'red'; if (c === 'B') return 'blue'; if (c === 'Y') return 'yellow'; return 'green'; 
    };

    let moveTextRaw = pgnStr.replace(/\[(?!\s*\%)\s*[A-Za-z0-9_]+\s+"[^"]*"\s*\]/g, '').trim();
    let tokenIndices = new Int32Array(Math.max(10000, moveTextRaw.length));
    let tokenCount = 0;
    const pushToken = (s, e) => {
        if (tokenCount >= tokenIndices.length) {
            let nA = new Int32Array(tokenIndices.length * 2);
            nA.set(tokenIndices); tokenIndices = nA;
        }
        tokenIndices[tokenCount++] = s; tokenIndices[tokenCount++] = e;
    };

    let len = moveTextRaw.length, i = 0;
    while (i < len) {
        let code = moveTextRaw.charCodeAt(i);
        if (code <= 32) { i++; continue; }
        if (code === 123) {
            let st = i; while (i < len && moveTextRaw.charCodeAt(i) !== 125) i++;
            pushToken(st, i + 1); i++; continue;
        }
        if (code === 40 || code === 41) { pushToken(i, i + 1); i++; continue; }
        if (code === 36) {
            let st = i; while (i < len && moveTextRaw.charCodeAt(i) > 32 && ![125,41,40,123].includes(moveTextRaw.charCodeAt(i))) i++;
            pushToken(st, i); continue;
        }
        let st = i, hasDot = false, lastDot = -1;
        while (i < len) {
            let c = moveTextRaw.charCodeAt(i);
            if (c <= 32 || [125, 41, 40, 123, 36].includes(c)) break;
            if (c === 46) { hasDot = true; lastDot = i; }
            i++;
        }
        if (i > st) {
            if (!hasDot || moveTextRaw.charCodeAt(i - 1) === 46) pushToken(st, i);
            else { pushToken(st, lastDot + 1); if (lastDot + 1 < i) pushToken(lastDot + 1, i); }
        } else i++;
    }

    let idx = 0;
    const nodeStack = [];
    
    while (idx < tokenCount) {
        let tStart = tokenIndices[idx], tEnd = tokenIndices[idx + 1];
        idx += 2;
        if (tEnd - tStart <= 0) continue;
        let firstChar = moveTextRaw.charCodeAt(tStart);

        if (firstChar === 40) {
            nodeStack.push({ node: currentNode, fen: engine.fen() });
            if (currentNode?.parent) {
                currentNode = currentNode.parent;
                try { engine.load(currentNode.fen); } catch(e) {}
            }
            continue;
        }
        if (firstChar === 41) {
            if (nodeStack.length > 0) {
                let frame = nodeStack.pop();
                currentNode = frame.node;
                try { engine.load(frame.fen); } catch(e) {}
            }
            continue;
        }

        if (firstChar === 123) {
            let rawComment = moveTextRaw.substring(tStart + 1, tEnd - 1).trim();
            if (!currentNode) continue;

            currentNode.rawComment = rawComment;
            currentNode.comment = rawComment.replace(/\[\%[^\]]+\]/g, '').trim(); // Lọc tag hiển thị

            let evMatch = rawComment.match(lichessEvalRegex);
            if (evMatch) {
                const val = parseFloat(evMatch[1].replace(/[#+]/g, ''));
                if (!isNaN(val)) currentNode.eval = evMatch[1].includes('#') ? (val > 0 ? "+M" : "-M") + Math.abs(val) : (val > 0 ? "+" : "") + val.toFixed(2);
            }

            let clkMatch = rawComment.match(lichessClkRegex);
            if (clkMatch) currentNode.clk = clkMatch[1];

            let tlMatch = rawComment.match(tlRegex);
            if (tlMatch) currentNode.cccTimeLeft = tlMatch[1];

            let npsMatch = rawComment.match(/nps=(\d+)/i);
            if (npsMatch) currentNode.nps = npsMatch[1];

            let calMatch = rawComment.match(lichessCalRegex);
            if (calMatch) {
                currentNode.arrows = [];
                calMatch[1].split(',').forEach(s => currentNode.arrows.push({ from: s.substring(1,3), to: s.substring(3,5), color: decodeLichessColor(s[0]) }));
            }

            let cslMatch = rawComment.match(lichessCslRegex);
            if (cslMatch) {
                currentNode.circles = [];
                cslMatch[1].split(',').forEach(s => currentNode.circles.push({ square: s.substring(1,3), color: decodeLichessColor(s[0]) }));
            }
            continue;
        }

        if (moveTextRaw.charCodeAt(tEnd - 1) === 46) continue;
        let token = moveTextRaw.substring(tStart, tEnd);
        if (['1-0', '0-1', '1/2-1/2', '*'].includes(token)) continue;

        let moveObj = null;
        try { moveObj = engine.move(token, { sloppy: true }); } catch(e) {}
        if (!moveObj) continue;

        let preFen = currentNode.fen;
        let cacheKey = preFen + "|" + moveObj.san;
        let nextFen = fenCache.get(cacheKey) || engine.fen();
        fenCache.set(cacheKey, nextFen);

        const newNode = new MoveNode(nextFen, moveObj.san);
        newNode.lastMove = { from: moveObj.from, to: moveObj.to, flags: moveObj.flags, piece: moveObj.piece, color: moveObj.color };
        newNode.parent = currentNode;
        currentNode.children.push(newNode);

        if (currentNode.children.length > 1) {
            currentNode.children.sort((a, b) => (a.isPV === b.isPV ? 0 : a.isPV ? 1 : -1));
        }
        currentNode.selectedChildIndex = 0;
        currentNode = newNode;
    }

    return { rootNode, headers, gameMode };
}

// ============================================================================
// 2. RENDER PGN
// ============================================================================
function evalPGNGenerate(node) {
    let parts = [];
    
    if (node.eval !== undefined && node.eval !== null) {
        let eStr = node.eval.toString().replace('+M', '#').replace('-M', '#-').replace('M', '#');
        parts.push(`[%eval ${eStr}]`);
    }

    if (node.clk) parts.push(`[%clk ${node.clk}]`);

    const getLichessColor = (c) => {
        let col = c.toLowerCase();
        if (col.includes('red') || col === 'r') return 'R';
        if (col.includes('blue') || col === 'b') return 'B';
        if (col.includes('yellow') || col.includes('orange') || col === 'y') return 'Y';
        return 'G'; 
    };

    if (node.arrows && node.arrows.length > 0) {
        let calTags = node.arrows.map(a => `${getLichessColor(a.color)}${a.from}${a.to}`);
        parts.push(`[%cal ${calTags.join(',')}]`);
    }
    if (node.circles && node.circles.length > 0) {
        let cslTags = node.circles.map(c => `${getLichessColor(c.color)}${c.square}`);
        parts.push(`[%csl ${cslTags.join(',')}]`);
    }

    let humanComment = node.comment || "";
    if (humanComment) parts.push(humanComment);

    return parts.length > 0 ? `{ ${parts.join(' ').trim()} }` : "";
}

function generatePGNRecursive(node, moveNum, forceNumber = false, lastColor = null) {
    if (!node || !node.children || node.children.length === 0) return "";
    
    let pgn = "";
    let activeIdx = 0; 
    let mainChild = node.children[activeIdx];

    let moveColor = node.fen.split(' ')[1] || 'w'; 
    let mNum = parseInt(node.fen.split(' ')[5] || 1, 10);

    let prefix = "";
    let isFirstNode = (node.parent === null);
    if (moveColor !== lastColor || isFirstNode) {
        if (moveColor === 'w') prefix = `${mNum}. `;
        else if (forceNumber || isFirstNode) prefix = `${mNum}... `;
    }

    pgn += `${prefix}${mainChild.moveSan}`;

    if (mainChild.nag) {
        mainChild.nag.toString().split(',').forEach(n => {
            let cleanN = n.trim().replace('$', '');
            let nagMap = { "1":"!", "2":"?", "3":"!!", "4":"??", "5":"!?", "6":"?!", "10":"=" };
            if (nagMap[cleanN]) pgn += nagMap[cleanN];
            else if (cleanN.match(/^[!?]+$/)) pgn += cleanN; 
            else pgn += ` $${cleanN}`; 
        });
    }

    let mainComment = evalPGNGenerate(mainChild);
    if (mainComment) pgn += ` ${mainComment}`;

    let hadVariations = false;
    if (node.children.length > 1) {
        for (let i = 1; i < node.children.length; i++) {
            let varChild = node.children[i];
            if (varChild.isPV) continue; 
            hadVariations = true;
            
            let varPrefix = moveColor === 'w' ? `${mNum}. ` : `${mNum}... `;
            varPrefix += varChild.moveSan;
            
            let varComment = evalPGNGenerate(varChild);
            let subVarText = generatePGNRecursive(varChild, mNum, (varComment !== ""), moveColor);
            pgn += ` (${varPrefix}${varComment ? " " + varComment : ""}${subVarText ? " " + subVarText : ""})`;
        }
    }

    let nextPgn = generatePGNRecursive(mainChild, mNum, hadVariations, moveColor);
    if (nextPgn) pgn += " " + nextPgn;

    return pgn;
}

export function generatePGN(rootNode, headers = {}) {
    let pgn = "";
    for (let k in headers) {
        if (k.toLowerCase() !== 'from') pgn += `[${k} "${headers[k]}"]\n`;
    }
    pgn += "\n";

    let movesText = generatePGNRecursive(rootNode, 1, false, null);
    pgn += movesText.trim().replace(/[ \t]+/g, ' ');

    let result = headers['Result'] || '*';
    if (!pgn.trim().endsWith(result)) pgn += " " + result;

    return pgn;
}

// ==========================================
// EXPORT
// ==========================================
const NgvidaPGN = { parsePGN, generatePGN };
if (typeof window !== 'undefined') window.NgvidaPGN = NgvidaPGN;
if (typeof globalThis !== 'undefined') globalThis.NgvidaPGN = NgvidaPGN;
if (typeof module !== 'undefined' && module.exports) module.exports = NgvidaPGN;

export { NgvidaPGN };
export default NgvidaPGN;