import {deepEach, genKey} from "./utils";
import {Element} from "../elements";
import {Node} from './node'
import {Text} from './text'

export interface Root {
    kind: 'root',
    nodes?: Node[]
}

export const Root = {
    new(){
        return {
            kind: 'root',
            nodes: [
                Element.paragraph()
            ]
        }
    },

    /**
     * scrutinize the whole data tree of nodes
     * Return `true` if every node is valid
     */
    scrutinize(root: Root): boolean{
        if (Array.isArray(root)) return false
        function recurse(value) {
            // return false , if neither node nor text
            if (Node.isNode(value)){
                value.key = genKey()
                if (Node.isBranchNode(value)){
                    const res = deepEach(value, recurse)
                    if (res !== undefined) return res
                }
            } else if (!Node.isNode(value) && !Text.isText(value)){
                return false
            }
        }
        return deepEach(root, recurse) != false
    },
}