import {dataExample} from "../data/example";
import {Root} from '../../core/root'

describe('core/root', ()=>{
    it('scrutinize - ok', ()=>{
        expect(Root.scrutinize(dataExample.a)).toBeTruthy()
    })

    it('scrutinize - fail', ()=>{
        expect(Root.scrutinize({
            key: 2,
            type: 'p',
            nodes:[
                {
                    range: ''
                }
            ]
        })).toBeFalsy()
    })
})