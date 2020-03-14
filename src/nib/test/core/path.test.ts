import {dataExample} from "../data/example";
import {Path, PathMap} from "../../core/path";

describe('core/path', ()=>{
    it('normalize', ()=>{
        expect(Path.normalize("1.1.1")).toEqual([1,1,1])
        expect(Path.normalize(1)).toEqual([1])
        expect(Path.normalize(["1","0"])).toEqual([1,0])
    })

    it('next', ()=>{
        expect(Path.next([1,2,3])).toEqual([1,2,4])
    })

    it('flatMap', ()=>{
        let a = Path.flatMap(dataExample.a)
        expect(a).toEqual([[0],[0,0],[0,0,0]])
        let b = Path.flatMap(dataExample.b)
        expect(b).toContainEqual([1,0,0,1])
        expect(b).toContainEqual([0])
    })

    it('compare', ()=>{
        expect(Path.compare([0,1], [0,1,1])).toBe(-1)
        expect(Path.compare([0,1,0], [0,1,1])).toBe(-1)
        expect(Path.compare([0,1,2], [0,1,1])).toBe(1)
        expect(Path.compare([0,1,1], [0,1,1])).toBe(0)
    })

    it('compare - path string', ()=>{
        expect('1.2.3.1' < '1.2.3').toBeFalsy
        expect('1.2.2' < '1.2.3').toBeTruthy
        expect('1.0' < '1.0.1').toBeTruthy
        expect('1.0.1.2.1' < '1.0.1').toBeFalsy
    })


    const pathMap = new PathMap()
    for (let i of Array.from(Array(1000).keys()).reverse()){
        pathMap.set([0,0,i], i)
    }
    it('path map', ()=>{
        expect(pathMap.keys()).toContain('0.0.1')
    })


})
