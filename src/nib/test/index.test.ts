import {toArray} from "lodash";


it('_', ()=>{
    const x = toArray("🌷🎁💩😜👍")
    console.log(toArray(x.pop()))
    expect(x.pop().length).toBe(2)
})