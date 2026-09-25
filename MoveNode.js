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
export class MoveNode {
    static #idSeq = 0;

    constructor(fen, moveSan, parent = null, comment = null, timeSpent = 0, toSq = -1) {
        this.id = 'n_' + (++MoveNode.#idSeq).toString(36);
        
        this.fen = fen;
        this.moveSan = moveSan;
        this.parent = parent;
        this.children = [];
        this.selectedChildIndex = 0;
        this.comment = comment;
        this.timeSpent = timeSpent;
        this.toSq = toSq;
        this.lastMove = null;
        this.isPV = false;
        this.nag = null;
        this.evalScore = undefined;
        this.eval = undefined;
        this.localEvalScore = undefined;
        this.localEval = undefined;
        this.depth = undefined;
        this.pv = undefined;
        this.score = null;
        this.isBook = false;
        this.nps = null;
        this.latency = null;
        this.arrows = null;
        this.circles = null;
        this.clock = null;
        this.cccTimeLeft = null;
        this.isIllegal = false;
        this.reviewed = false;
        this.isCollapsed = false;
        this.graphX = 0;
        this.graphY = 0;

        if (fen) {
            const firstSpace = fen.indexOf(' ');
            if (firstSpace !== -1) {
                this.turnColor = fen.charAt(firstSpace + 1) || 'w';
                
                const lastSpace = fen.lastIndexOf(' ');
                this.moveNumber = lastSpace > firstSpace 
                    ? (parseInt(fen.substring(lastSpace + 1), 10) || 1) 
                    : 1;
            } else {
                this.turnColor = 'w';
                this.moveNumber = 1;
            }
            this.hasVariantModifier = fen.charCodeAt(0) === 126 || fen.indexOf('~') !== -1;
        } else {
            this.turnColor = 'w';
            this.moveNumber = 1;
            this.hasVariantModifier = false;
        }
    }
}