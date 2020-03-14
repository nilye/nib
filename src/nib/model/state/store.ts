import {Node, Root, Path, History} from "../..";
import {createStore, Dispatch, Reducer, Store, Unsubscribe} from "redux";
import {reducer} from "./reducer";
import {StoreAction} from "./action";

export interface StoreState {
    value: Root,
    paths: Path[],
    history: History
}

export function reduxStore(initValue: Root): Store{
    if (initValue && !Root.scrutinize(initValue)){
        throw Error('invalid initValue data type')
    }
    let state = {
        value: initValue || Root.new(),
        paths: [],
        history: {}
    } as StoreState
    return createStore(reducer as Reducer<StoreState, StoreAction>, state)
}