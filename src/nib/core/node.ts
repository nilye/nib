import {clone, deepEach, equal, genKey} from "./utils";
import {Text} from "./text";
import {Path} from "./path";
import {Range} from "./range";
import {isPlainObject} from "lodash";
import {Root} from "./root";

export type NodeKind = 'blk' | 'inl' | 'cel'
// block | inline | table cell

export interface Node {
    key?: string,
    kind: NodeKind,
    type?: string,
    data?: {
        [key: string]: any
    },
    nodes?: Node[] | Text[]
}

export type AnyNode = Root | Node | Text

export interface NodeEntry {
    path: Path,
    node: Node
}

export const Node = {
    /**
     * create a new node obj
     */
    create(
        kind: NodeKind,
        type: string,
        nodes?: Node[]|Text[],
        data?: any
    ): Node {
        let obj: Node = {
            key: genKey(),
            kind: kind || 'inl',
            type: type || 'text'
        }
        if (nodes) obj.nodes = nodes
        if (data) obj.data = data
        return obj
    },

    /**
     * create a block node obj
     */
    block(type: string, nodes?: Node[], data?: object): Node {
        return this.create('blk', type, nodes, data)
    },

    /**
     * create a text node obj
     */
    text(nodes?: Text[]): Node {
        return this.create('inl', 'text', nodes)
    },

    /**
     * check if is a node schema
     */
    isNode(obj: any): obj is Node{
        return isPlainObject(obj) && (obj.kind == 'blk' || obj.kind == 'inl')
    },

    /**
     * check is array is a node list
     */
    isNodeList(obj: any): obj is Node[]{
        return Array.isArray(obj) && (obj.length == 0 || obj.every(i => this.isNode(i)))
    },

    /**
     * check if the obj is a node schema with at least one child
     */
    isBranchNode(obj: any): obj is Node{
        return 'nodes' in obj && Array.isArray(obj.nodes) && obj.nodes.length > 0
    },

    /**
     * check if the obj is a node schema with node child
     */
    isLeafNode(obj: any): obj is Node{
        return this.isNode(obj) && (!('nodes' in obj) || obj.nodes.length === 0)
    },

    /**
     * check if is text node schema
     */
    isTextNode(obj: any): obj is Node {
        return this.isNode(obj) && obj.kind == 'inl' && 'nodes' in obj && Text.isTextList(obj.nodes)
    },

    /**
     * check if a node has any text node
     */
    hasTextContent(obj: Node): boolean {
        return Text.isTextList(obj.nodes) &&
            obj.nodes.some(i => Text.isText(i) && i.text.length > 0)
    },

    // data(model) manipulative level functions

    /**
     * get Node or Text of certain path
     */
    get(root: Root | Node, path:Path): AnyNode{
        path = Path.normalize(path)
        if (path.length == 0) return root
        else {
            let node = root as Node | Root
            for (let i of path){
                if (!this.isBranchNode(node) || !node.nodes[i]){
                    return node
                }
                node = node.nodes[i] as Node
            }
            return node
        }
    },

    set(root: Root, path: Path, obj: AnyNode): void{
        path = Path.normalize(path)
        if (path.length == 0) root = obj as Root
        // let node = root
        // if (path.length > 1){
        //     let i = path.shift()
        //     if (!this.isBranchNode(node)){
        //         node.nodes = []
        //     }
        //     this.set(node.nodes[i], path, obj)
        // } else {
        //     node.nodes[path[0]] = obj as Node
        // }
        let index = path.pop(),
            parent = Node.get(root, path) as Node
        parent.nodes[index] = obj as Node|Text
    },


    /**
     * return flattened child nodes (optional: within a range)
     */
    flat(root: Root, range?: Range): NodeEntry[] {
        let nodeEntries = [],
            inBound = false
        if (!range) inBound = true
        function recurse(value, i, path) {
            if (!inBound && equal(path, range.anchor.path)){
                inBound = true
            }
            // inBound - if enters range
            if (inBound){
                nodeEntries.push({node: value, path})
                // if path is focus path, ends there
                if (range && equal(path, range.focus.path)) {
                    inBound = false
                    return false
                }
            }
            // deeply recurse
            if (Node.isBranchNode(value)){
                const res = deepEach(value.nodes, recurse, path)
                if (res !== undefined) return res
            }
        }
        deepEach(root, recurse)
        return nodeEntries
    },


}