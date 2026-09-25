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
import { Chess } from './ngvida_chess.js';
import { MoveNode } from './MoveNode.js';
import { VARIANT_STARTING_FENS } from './constants.js';

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

function addPVToNode(engine, node, pvString, fenCache, pvTransMap) {
    if (!pvString || !node) return;
    let pvMoves = pvString.split(/\s+/).filter(Boolean);
    if (pvMoves.length === 0) return;

    let savedFen = engine.fen();
    let firstMoveText = pvMoves[0].replace(/[?!+#]+$/, '');
    let isRootMove = (node.moveSan === firstMoveText);

    let startNode = node.parent || node;
    let loadFen = (node.parent && node.parent.fen) ? node.parent.fen : node.fen;
    let current = startNode;
    let startIndex = 0;

    if (isRootMove && node.parent) {
        let existingPV0 = current.children.find(c => c.moveSan === node.moveSan && c.isPV);
        if (!existingPV0) {
            let pv0 = new MoveNode(node.fen, node.moveSan, current, "", 0, node.toSq);
            pv0.lastMove = node.lastMove;
            pv0.isPV = true;
            current.children.push(pv0);
            current = pv0;
        } else {
            current = existingPV0;
        }
        try { engine.load(node.fen); } catch(e) { return; }
        startIndex = 1;
    } else {
        try { engine.load(loadFen); } catch(e) { return; }
    }

    for (let i = startIndex; i < pvMoves.length; i++) {
        let mText = pvMoves[i].replace(/[?!+#]+$/, '');
        let moveObj = null;
        try { moveObj = engine.move(mText, { sloppy: true }); } catch(e) {}
        if (!moveObj) break;

        let fullFen = engine.fen();
        let posKey = getVariantSafePosKey(fullFen);

        if (pvTransMap.has(posKey)) {
            let reused = pvTransMap.get(posKey);
            if (reused !== current && !current.children.includes(reused)) {
                current.children.push(reused);
                break;
            }
        }

        let existing = current.children.find(c => c.moveSan === moveObj.san && c.isPV);
        if (existing) {
            current = existing;
        } else {
            let newNode = new MoveNode(fullFen, moveObj.san, current, "", 0, moveObj.to);
            newNode.isPV = true;
            newNode.lastMove = { from: moveObj.from, to: moveObj.to, flags: moveObj.flags, piece: moveObj.piece, color: moveObj.color };
            current.children.push(newNode);
            pvTransMap.set(posKey, newNode);
            current = newNode;
        }
    }
    try { engine.load(savedFen); } catch(e) {}
}

export function parsePGN(pgnStr, defaultVariant = 'classical') {
    if (!pgnStr || typeof pgnStr !== 'string') return null;

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

    const EngineConstructor = (typeof Chess === 'function') ? Chess : (window.Chess || globalThis.Chess);
    const engine = new EngineConstructor(undefined, gameMode);
    let startFen = headers['FEN'] || VARIANT_STARTING_FENS[gameMode] || VARIANT_STARTING_FENS.classical;
    engine.load(startFen);

    const rootNode = new MoveNode(startFen, null);
    let currentNode = rootNode;

    const fenCache = new Map([[startFen, startFen]]);
    const pvTransMap = new Map();

    let moveTextRaw = pgnStr.replace(/\[(?!\s*\%)\s*[A-Za-z0-9_]+\s+"[^"]*"\s*\]/g, '').trim();
    let tokenIndices = new Int32Array(Math.max(10000, moveTextRaw.length));
    let tokenCount = 0;
    const pushToken = (s, e) => {
        if (tokenCount >= tokenIndices.length) {
            let nA = new Int32Array(tokenIndices.length * 2);
            nA.set(tokenIndices);
            tokenIndices = nA;
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
            let st = i; while (i < len && moveTextRaw.charCodeAt(i) > 32 && ![125, 41, 40, 123].includes(moveTextRaw.charCodeAt(i))) i++;
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
            let pvMatch = rawComment.match(/pv\s*=\s*\\*["']?([^"}\\]+)/i);
            if (pvMatch && pvMatch[1]) {
                addPVToNode(engine, currentNode, pvMatch[1].trim(), fenCache, pvTransMap);
            }
            if (currentNode) currentNode.comment = rawComment;
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

export function generatePGN(rootNode, headers = {}) {
    let pgn = "";
    for (let k in headers) pgn += `[${k} "${headers[k]}"]\n`;
    pgn += "\n";

    function printNode(node, moveNum, isWhite) {
        if (!node || !node.children || node.children.length === 0) return "";
        let child = node.children[node.selectedChildIndex || 0];
        if (!child || child.isPV) return "";

        let prefix = isWhite ? `${moveNum}. ` : "";
        let out = `${prefix}${child.moveSan} `;
        if (child.comment) out += `{ ${child.comment} } `;
        out += printNode(child, isWhite ? moveNum : moveNum + 1, !isWhite);
        return out;
    }

    pgn += printNode(rootNode, 1, true).trim();
    let res = headers['Result'] || '*';
    if (!pgn.endsWith(res)) pgn += " " + res;
    return pgn;
}

if (typeof window !== 'undefined') {
    window.NgvidaPGN = { parsePGN, generatePGN };
}