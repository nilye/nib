import {DOMNode, Text} from '../'

export interface Formatter {
    tag?: string,
    class?: string,
    style?: object,
}

export const Formats = {
    bold: {
        tag: 'strong'
    },

    italic: {
        tag: 'em'
    },

    underline: {
        tag: 'ins'
    },

    strike: {
        tag: 'del'
    },

    render(value: Text): DOMNode{
        let spanLeaf = document.createTextNode(value.text) as DOMNode
        // spanLeaf.innerText = value.text
        for (let i in value.format){
            if (Formats.hasOwnProperty(i)){
                const format: Formatter = Formats[i]
                // element tag
                let el = document.createElement(format.tag || 'span')
                // class
                if (format.class){
                    el.classList.add(format.class)
                }
                // style
                if (format.style){
                    Object.entries(format.style).forEach(([k,v])=>{
                        el.style[k] = v
                    })
                }
                // append previous child to el
                if ((spanLeaf as any) instanceof Node){
                    el.appendChild(spanLeaf)
                }
                spanLeaf = el
            }
        }
        return spanLeaf
    },
}