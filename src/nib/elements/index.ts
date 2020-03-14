import {Node, Text} from "..";

export * from './formats'

export const Element = {
    paragraph(
        type:string = 'p',
        text:string = ''
    ){
        return Node.create('blk', type, [
            Node.text([
                Text.create(text)
            ])
        ])
    }
}