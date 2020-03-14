import {Node} from "./node";
import {deepEach} from "./utils";

export type Path = number[]
export type RawPath = string | number | any[]

export const Path = {
    /**
     * normalize `RawPath` data into standard `Path` type,
     * and create a new array
     */
    normalize(path: RawPath): Path{
        if (typeof path == 'string') {
            path = path.split('.')
        }
        if (typeof path == 'number') {
            path = [path]
        } else if (Array.isArray(path)) {
            path = path.map(Number)
        }
        return path
    },

    /**
     * check if it's a standard `Path` data type
     */
    isPath(path: any[]): path is Path{
        return path.every(i => Number.isInteger(i))
    },

    /**
     * if two paths are equal
     */
    equal(a: Path, b: Path): boolean {
        return this.compare(a, b) === 0
    },

    /**
     * compare two Path, return an integer whether a is
     * before (-1),
     * equal (0),
     * or after (1)b
     */
    compare(a: Path, b: Path): number{
        const len = Math.min(a.length, b.length)
        for (let i = 0; i < len; i++){
            if (a[i] < b[i]) return -1
            if (a[i] > b[i]) return 1
        }
        if (a.length !== b.length){
            if (a.length > b.length) return 1
            if (a.length < b.length) return -1
        }
        return 0
    },

    /**
     * stringify path
     */
    str(path: Path): string{
        if (!Array.isArray(path)) return String(parseInt(path))
        return path.slice().join('.')
    },

    /**
     * get the next sibling path (! NOT guaranteed if it is existed)
     */
    next(path: Path|RawPath): Path{
        path = this.normalize(path) as Path
        if (path.length == 0) return [0]
        const last = path.pop()
        path.push(last+1)
        return path
    },

    /**
     * get the previous sibling path. If this is the first child of its parent, get the parent instead.
     */
    prev(path: Path): Path{
        path = this.normalize(path) as Path
        const last = path.pop()
        if (last == 0) return path
        path.push(last-1)
        return path
    },

    /**
     * return a new path by appending an index to a existing path
     * will not mutant the existing path
     */
    push(path: Path, index: number): Path{
        path = this.normalize(path) as Path
        path.push(index)
        return path
    },

    /**
     * deeply create a flattened `Path` array of a node list's node
     */
    flatMap(nodes: Node[]): Path[]{
        let paths = []
        function recurse(value, i, path) {
            if (Node.isNode(value)){
                paths.push(path)
            }
            if (Node.isBranchNode(value as Node)){
                deepEach(value.nodes, recurse, path)
            }
        }
        deepEach(nodes, recurse)
        return paths
    }
}

export class PathMap extends Map<string, any>{
    set(key, value): this{
        key = Path.str(key)
        super.set(key, value)
        return this
    }

    get(key): any{
        key = Path.str(key)
        return super.get(key)
    }

    keys(): any{
        let keys = [...super.keys()]
        keys.sort((a,b)=>{
            if (a < b) return -1
            else if  (a > b) return 1
            return 0
        })
        return keys
    }
}