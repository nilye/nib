import {Point} from "./point";
import {Editor} from "./editor";
import {Text, TextFormat} from "./text";
import {DOM} from "./dom";

export interface RawRange {
    anchor: Point,
    focus: Point,
}

export interface Range {
    anchor: Point,
    focus: Point,
    isCollapsed?: boolean,
    formats?: TextFormat
}

export const Range = {

    /**
     * create new range
     */
    normalize(
        editor: Editor,
        rawRange: RawRange
    ): Range{
        let {anchor, focus} = rawRange,
            direction = Point.compare(anchor, focus)

        // direction & collapsed
        if (direction === 1){
            anchor = [focus, focus=anchor][0]
        }
        const isCollapsed = direction == 0

        // get formats
        const texts = Text.texts(editor.value(), {anchor, focus})
        if (texts.length > 0){
            if (Text.length(texts[0].node) == anchor.offset){
                texts.shift()
            }
            if (focus.offset == 0){
                texts.pop()
            }
        }
        const formats = Text.getFormat(texts.map(i=>i.node))
        return {anchor,focus, isCollapsed, formats}
    },

    fromDOMSelection(
        editor: Editor,
        sel: Selection
    ): Range{
        let anchor = Point.fromDOMNode(editor, sel.anchorNode, sel.anchorOffset),
            focus = Point.fromDOMNode(editor, sel.focusNode, sel.focusOffset)
        return this.normalize(editor, {anchor, focus})
    },

    setDOMSelection(
        editor: Editor,
        range: Range
    ){
        const {anchor, focus} = range,
            anchorElem = editor.domOfPath.get(anchor.path),
            focusElem = editor.domOfPath.get(focus.path),
            anchorTextNode = DOM.textDescendant(anchorElem),
            focusTextNode = DOM.textDescendant(focusElem),
            domRange = document.createRange(),
            domSelection = window.getSelection()

        domRange.setStart(anchorTextNode, anchor.offset)
        domRange.setEnd(focusTextNode, focus.offset)
        domSelection.removeAllRanges()
        domSelection.addRange(domRange)
    },

    getBound(editor: Editor): {x:number, y:number}{
        let domRange = window.getSelection().getRangeAt(0)
        let rangeRect = domRange.getBoundingClientRect(),
            contRect = editor.domElement.getBoundingClientRect(),
            x = rangeRect.x - contRect.x + rangeRect.width / 2,
            y = rangeRect.y - contRect.y
        return {x,y}
    }


}