import {Text} from '../../core/text'
import {dataExample} from "../data/example";

describe('core/text', ()=>{
    it('texts', ()=>{
        const result = Text.texts(dataExample.c)
        expect(result).toContainEqual({
            node:{
                format: {
                    bold:true
                },
                text: 'Maecenas in ultricies sapien. Proin quis sapien velit.'
            },
            path: [0,0,1]
        })
    })

    it('texts w/range', ()=>{
        const result = Text.texts(dataExample.c, {
            anchor: {
                path: [0,0,1]
            },
            focus: {
                path: [0,0,2]
            }
        })
        console.log(result)
        expect(result.length).toBe(2)
    })

    it('texts equal range', ()=>{
        let anchor =  {path: [0,0,0]}
        const result = Text.texts(dataExample.c, {
            anchor,
            focus: {
                path: [0,0,2]
            }
        })
        console.log(result)
        expect(result[0].path).toEqual(anchor.path)
    })

    it('getFormat - empty', ()=>{
        const texts = Text.texts(dataExample.c).map(i=>i.node),
            formats = Text.getFormat(texts)
        console.log(formats)
        expect(formats).toEqual({color:null})
    })

    it('getFormat - bold', ()=>{
        const texts = Text.texts(dataExample.c, {
            anchor: {
                path: [0,0,0]
            },
            focus: {
                path: [0,0,1]
            }
        }).map(i=>i.node)
        const formats = Text.getFormat(texts)
        console.log(formats)
        expect(formats).toEqual({bold: true})
    })

    it('getFormat - color', ()=>{
        const texts = Text.texts(dataExample.c, {
            anchor: {
                path: [0,0,1]
            },
            focus: {
                path: [0,0,2]
            }
        }).map(i=>i.node)
        const formats = Text.getFormat(texts)
        console.log(formats)
        expect(formats).toEqual({color: null})
    })

    it('getFormat - single Text', ()=>{
        const formats = Text.getFormat(dataExample.c.nodes[0].nodes[0].nodes[1])
        console.log(formats)
        expect(formats).toEqual({bold: true})
    })
})