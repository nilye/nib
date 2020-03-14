import {Path} from "./path";
import * as _ from "lodash";
import {DOM, DOMAncestor, DOMNode} from "./dom";
import {Editor} from "./editor";

export interface Point {
    path: Path
    offset: number,
    mark?: number
}

export const Point = {

    /**
     * check if is valid `Point` type
     */
    isPoint(point: Point): point is Point{
        return _.isPlainObject(point) &&
            Path.isPath(point.path) &&
            typeof point.offset === 'number' &&
            typeof point.mark === 'number'
    },

    /**
     * compare two Point, return an integer whether a is
     * before (-1),
     * equal (0),
     * or after (1)b
     */
    compare(a: Point, b: Point): number{
        const result = Path.compare(a.path, b.path)
        if (result === 0){
            if (a.offset < b.offset) return -1
            if (a.offset > b.offset) return 1
        }
        return result
    },

    /**
     * get mark of a Point
     * terminology: `mark` is the number of character to its `Node` parent's start, while offset is to its `Text's start
     */
    mark(
        node: Node | Text,
        offset: number
    ): number{
        const ancestors = DOM.ancestor(node)
        const range = document.createRange()
        range.selectNodeContents(ancestors.node)
        range.setEnd(node, offset)
        return range.toString().length
    },

    /**
     * get point from DOM
     */
    fromDOMNode(
        editor: Editor,
        domNode: DOMNode,
        offset: number
    ): Point{
        let ancestor = DOM.ancestor(domNode),
            path = editor.pathOfDOM.get(ancestor.text)
        if (ancestor.text.dataset.pristine){
            offset = 0
        }
        // let mark = this.mark(node, offset)
        return {path, offset}
    },

    /**
     *
     */
    move(point: Point, value: number): Point{
        point.offset += value
        point.mark += value
        return point
    }


}