import {isPlainObject, mergeWith, isEmpty} from 'lodash'
import {Node} from './node'
import {Range} from './range'
import {Path} from "./path";
import {clone} from "./utils";
import {Root} from "./root";

export interface TextFormat {
    [key: string]: boolean | string | number
}

export interface Text {
    format?: TextFormat,
    text: string
}

export interface TextEntry {
    node: Text,
    path: Path
}

export const Text = {
    /**
     * create new text
     */
    create(text?: string, format?: TextFormat): Text {
        let obj: Text = {
            text: text || ''
        }
        if (format) obj.format = format
        return obj
    },

    /**
     * check if is text
     */
    isText(obj: any): obj is Text{
        return isPlainObject(obj) && 'text' in obj && typeof obj.text === 'string'
    },

    /**
     * check is obj is a text list
     */
    isTextList(obj: any): obj is Text[]{
        return Array.isArray(obj) && (obj.length == 0 || obj.every(i => this.isText(i)))
    },

    /**
     * return flattened text nodes (optional: within a range)
     */
    texts(root: Root, range?: Range): TextEntry[]{
        let textEntries = []
        for (let i of Node.flat(root, range)){
            if (this.isText(i.node)){
                textEntries.push(i)
            }
        }
        return textEntries
    },

    /**
     * get Text at certain path, guaranteed to be a Text
     */
    get(root: Root, path: Path): Text{
        const text = Node.get(root, path)
        if (this.isText(text)){
            return text as Text
        } else {
            throw Error(text + `is not a Text`)
        }
    },

    /**
     * text length
     */
    length(obj: Text): number{66
        if (this.isText(obj)){
            return obj.text.length
        }
        return 0
    },


    // formats

    hasFormat(obj: Text): boolean{
        return obj && !isEmpty(obj.format) && 'format' in obj
    },

    getFormat(nodes: Text|Text[]): TextFormat{
        if (!Array.isArray(nodes)) nodes = [nodes] as Text[]

        if (!this.hasFormat(nodes[0])){
            return {}
        }
        let active = clone(nodes[0].format)
        for (let i = 1; i < nodes.length; i++){
            const item = nodes[i],
                current = item.format
            if (!this.hasFormat(item)){
                return {}
            }
            let activeKeys = Object.keys(active),
                itemKeys = Object.keys(current)
            // compare activeKeys
            activeKeys.forEach(k => {
                if (itemKeys.includes(k)){
                    const v = current[k]
                    if (typeof v === 'string' || typeof v === 'number'){
                        if (v !== active[k]){
                            active[k] = null
                        }
                    }
                } else {
                    delete active[k]
                }
                // splice looped item
                if (itemKeys.indexOf(k) >= 0){
                    itemKeys.splice(itemKeys.indexOf(k), 1)
                }
            })
            // if itemKeys has any more string or number value
            if (itemKeys.length > 0){
                itemKeys.forEach(k => {
                    const v = current[k]
                    if (typeof v === 'string' || typeof v === 'number'){
                        active[k] = null
                    }
                })
            }
            // break if is Empty already
            if (isEmpty(active)){
                break
            }
        }
        return active
    },



}