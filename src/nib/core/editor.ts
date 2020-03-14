import {Store, Unsubscribe} from "redux";
import {reduxStore} from "../model/state/store";
import {Node} from './node'
import {defaultConfig} from "./config";
import {PathMap, Path} from "./path";
import {DOM} from "./dom";
import {Point} from "./point";
import {Range, RawRange} from "./range";
import {Transaction, InputEvent} from "../model/state/transaction";
import {Root} from "./root";

export interface EditorOption {
    target?: string | HTMLElement,
    initValue?: Root
}


export class Editor {

    domElement: HTMLElement
    store: Store
    pathOfDOM: WeakMap<HTMLElement, Path> = new WeakMap()
    domOfPath: PathMap = new PathMap()
    nodeOfPath: PathMap = new PathMap()
    range: Range | null
    eventPool: object = {}

    constructor (option: EditorOption) {
        if (option.target) this.bindDOMNode(option.target)
        this.store = reduxStore(option.initValue)
    }

    /**
     * bind editor DOM node
     */
    bindDOMNode(target: string | HTMLElement){
        if (typeof target == 'string'){
            this.domElement = document.querySelector(target)
        } else if (target && target instanceof Element){
            this.domElement = target
        } else {
            throw Error(target + ' is not a DOM object')
        }
    }

    // state
    /**
     * get store value (root)
     */
    value(): Root{
        return this.store.getState().value
    }
    paths(): Path[]{
        return this.store.getState().paths
    }


    // events
    /**
     * util func for dispatching any editor events
     */
    private dispatchEvent(event: string, data:any): void{
        this.eventPool[event].forEach(cb => cb(data))
    }

    /**
     * util func for bind any editor events
     */
    private bindEvent(event: string, cb: (data:any)=>any): ()=>void{
        if (!this.eventPool[event]){
            this.eventPool[event] = []
        }
        this.eventPool[event].push(cb)
        return ()=>{
            const i = this.eventPool[event].length - 1
            this.eventPool[event].splice(i, 1)
        }
    }

    // selection
    /**
     * bind path and domNode pair to WeakMap
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
     */
    bindPath(domNode: HTMLElement, path: Path, node: Node){
        if (domNode){
            this.pathOfDOM.set(domNode, path)
            this.domOfPath.set(path, domNode)
            this.nodeOfPath.set(path, node)
        }
    }

    /**
     * bind on selection change event
     */
    onSelect(cb: (data:any)=>any): ()=>void{
        return this.bindEvent('onSelect', cb)
    }

    /**
     * get selection from window, parse to Nib `Range`, and dispatch the change
     */
    getSelection(): void{
        const sel = window.getSelection(),
            fromEditor = this.domElement.contains(sel.anchorNode) ||
                this.domElement == document.activeElement

        if (fromEditor &&
            sel.anchorNode.nodeType == 3 ||
            sel.anchorNode.nodeName == 'INPUT'
        ){
            this.range = Range.fromDOMSelection(this, sel)
        } else {
            this.range = null
        }
        this.dispatchEvent('onSelect', {
            range: this.range,
            updateDOMSelect: false
        })
    }

    /**
     * set selection from `RawRange`, and dispatch the change
     * !!! DOM selection is not yet updated at this stage
     */
    setSelection(range: RawRange): void{
        this.range = Range.normalize(this, range)
        this.dispatchEvent('onSelect', {
            range: this.range,
            updateDOMSelect: true
        })
    }

    // transactions
    insertText(event: InputEvent){
        Transaction.insertText(this, event)
    }
    deleteBackward(event: InputEvent){
        Transaction.deleteBackward(this, event)
    }
    insertNode(path: Path, node: Node){
        Transaction.insertNode(this, path, node)
    }
    removeNode(path: Path){
        Transaction.removeNode(this, path)
    }
    updateNode(path: Path, node: Node){
        Transaction.updateNode(this, path, node)
    }

}