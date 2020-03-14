import {Node} from "../../..";
import {dataExample} from "../../data/example";
import {NodeStep} from "../../../model/step/node";

describe('step/node', ()=>{


   it('set', ()=>{
      let value = dataExample.a
      NodeStep.set(value, [0,0,0,0], {text:"a"})
      console.log(value)
      expect(Node.get(value, [0,0,0,0])).toEqual({text:"a"})
   })

})
