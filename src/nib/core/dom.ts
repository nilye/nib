export type DOMNode = Node | Element

export interface DOMAncestor {
    text: HTMLElement,
    node: HTMLElement
}

export const DOM = {
    /**
     * find Nib `Text` or `Node` ancestors of a domNode
     */
    ancestor(domNode: DOMNode): DOMAncestor{
        if (domNode.nodeType != 3){
            // sometime it will select the parent Element of a `Node`, so it have to search down the tree to find the first `span data-nib-text=true` Element and get its text descendant.
            let span = (domNode as Element).querySelector(`span[data-nib-text="true"]`)
            domNode = DOM.textDescendant(span)
        }
        let text, node
        let parent = domNode.parentNode as HTMLElement
        while (parent){
            if (parent.dataset.nibText) {
                text = parent
            } else if (parent.dataset.nibNode) {
                node = parent
                break
            }
            if (parent.dataset.nibEditor) break
            parent = parent.parentNode as HTMLElement
        }
        return {text, node}
    },

    /**
     * find first DOM Text Element child
     */
    textDescendant(domNode: DOMNode): Text{
        while (domNode.firstChild){
            domNode = domNode.firstChild
            if (domNode.nodeType == 3) return domNode as Text
        }
        return null
    },

    /**
     * if user clicks a element outside of target element
     */
    clickOutside(target: DOMNode, callback: ()=>void): void{
        window.addEventListener('click', event =>{
            if (!target.contains(event.target as DOMNode)) callback()
        })
    }
}