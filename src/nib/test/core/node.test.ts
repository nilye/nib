import {Node} from "../../core/node";
import {dataExample} from "../data/example";

describe('core/node', ()=>{
   it('isNode', ()=>{
      expect(Node.isNode(dataExample.a.nodes[0])).toBeTruthy()
   })

   it('isNodeList', ()=>{
      expect(Node.isNodeList(dataExample.a.nodes)).toBeTruthy()
   })

   it('flat', ()=>{
      let result = Node.flat(dataExample.c)
      expect(result.length).toBe(5)
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

   it('flat - w/ range', ()=>{
      let result = Node.flat(dataExample.c, {
         anchor: {
            path: [0,0,0]
         },
         focus: {
            path: [0,0,2]
         }
      })
      console.log(result)
      expect(result.length).toBe(3)
   })


   it('get', ()=>{
      expect(Node.get(dataExample.c, [0,0,2])).toEqual({
      "format": {
         "color": "red",
         },
      "text": "Nullam nisi velit, cursus id enim sit amet, mattis vulputate libero. Vivamus hendrerit, quam sit amet dictum dapibus, lorem enim laoreet mauris, quis blandit elit risus quis elit.",
      })
   })

   it('set', ()=>{
      let value = dataExample.a
      Node.set(value, [0,0,0,0], {text:"a"})
      console.log(value)
      expect(Node.get(value, [0,0,0,0])).toEqual({text:"a"})
   })

})
