import {Editor, Path, Node, Root} from "../..";

export const NodeStep = {
    insert(
        root: Root | Node,
        path: Path,
        node: Node
    ){
        let index = path.pop(),
            parent = Node.get(root, path) as Node
        parent.nodes.splice(index, 0, node)
    },

    remove(
        root: Root | Node,
        path: Path
    ){
        let index = path.pop(),
            parent = Node.get(root, path) as Node
        parent.nodes.splice(index, 1)
    },

    set(
        root: Root | Node,
        path: Path,
        properties: object
    ){
        let node = Node.get(root, path) as Node
        for (let [k,v] of Object.entries(properties)){
            if (v == null || !properties.hasOwnProperty(k)){
                delete node[k]
            } else {
                node[k] = v
            }
        }
    },

    split(
        root: Root | Node,
        index: number
    ){

    }
}