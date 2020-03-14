import {Editor, Range, Node, Text, Point, RawRange, clone, Path, NodeEntry} from "../..";
import {updateValue} from "./action";
import {PointStep} from "../step/point";
import {NodeStep} from "../step/node";

export interface InputEvent extends UIEvent{
    data: string,
    dataTransfer: DataTransfer,
    inputType: string,
    isComposing: boolean,
    getTargetRanges: ()=>StaticRange[]
}

let softLineLength = 0

export const Transaction = {

    /**
     * insert text input `string` while range `isCollapsed`
     */
    insertText(
        editor: Editor,
        event: InputEvent
    ){
        const {range, store} = editor,
            value = editor.value(),
            point = range.anchor
        let newRange: RawRange

        if (!range.isCollapsed) return

        // update node
        let node = Text.get(value, point.path)
        node.text = node.text.slice(0, point.offset) + event.data + node.text.slice(point.offset)

        // selection
        Point.move(point, event.data.length)
        newRange = {anchor: point, focus:point}

        store.dispatch(updateValue(value))
        editor.setSelection(newRange)
    },

    /**
     * insert a new node
     */
    insertNode(
        editor: Editor,
        path: Path,
        node: Node
    ){
        const { store } = editor,
            value = editor.value()
        NodeStep.insert(value, path, node)

        store.dispatch(updateValue(value))
    },

    /**
     * remove a node at a `Path`
     */
    removeNode(
        editor: Editor,
        path: Path
    ){
        const { store } = editor,
            value = editor.value()
        NodeStep.remove(value, path)

        store.dispatch(updateValue(value))
    },

    updateNode(
        editor: Editor,
        path: Path,
        properties: object
    ){
        const { store, range } = editor,
            value = editor.value()
        NodeStep.set(value, path, properties)

        store.dispatch(updateValue(value))
        editor.setSelection(range)
    },

    /**
     * delete text on different scale
     */
    deleteBackward(
        editor: Editor,
        event: InputEvent,
        options: {
            forward?: boolean
        } = {}
    ): void {

        const { forward = false } = options,
            {range, store} = editor,
            value = editor.value(),
            point = range.anchor
        let newRange: RawRange,
            newPoint: Point

        if (!range.isCollapsed) return

        // if current caret is at the start of the node, look for potential merge or move point
        let staticRange = event.getTargetRanges()[0],
            diff = staticRange.endOffset - staticRange.startOffset
        if (event.inputType == 'deleteSoftLineBackward'){
            if (diff < 0){
                diff = staticRange.endOffset
            }
        }
        newPoint = PointStep.move(editor, point, {length: diff})
        console.log(diff, newPoint)

        let newNode = Text.get(value, newPoint.path)
        newNode.text = newNode.text.slice(0, newPoint.offset) + newNode.text.slice(point.offset)
        Node.set(value, newPoint.path, newNode)

        if (point.offset == 0){

        }
        // selection
        console.log(newNode, newPoint, point)
        newRange = {anchor:newPoint, focus:newPoint}

        store.dispatch(updateValue(value))
        editor.setSelection(newRange)
    }
}