import {Editor, Path, Point, Node, Text} from "../..";

export const PointStep = {
    move(
        editor: Editor,
        point: Point,
        options?:{
            backward?: boolean,
            length?: number
        }
    ): Point{
        let { backward = false, length = 0} = options
        const paths = editor.domOfPath.keys(),
            value = editor.value(),
            index = paths.indexOf(Path.str(point.path))
        if (!backward){
            if (length <= point.offset){
                return {
                    path: point.path,
                    offset: point.offset - length
                }
            }
            for (let i = index; i > 0; i--){
                let path = paths[i],
                    node = Node.get(value, paths[i])
                if (Text.isText(node)){
                    const nodeLen = Text.length(node)
                    if (length > nodeLen){
                        length -= nodeLen
                    } else {
                        return {
                            path: Path.normalize(path),
                            offset: nodeLen - length
                        }
                    }
                }
            }
        }
    }

}