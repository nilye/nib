import '../nib/style/index.styl'
import Nib from './nib-vue/components/Nib.vue'
import Vue from "vue";

const initValue = [{
  kind:'blk',
  type:'p',
  nodes: [{
    kind: 'inl',
    type: 'text',
    nodes: [{
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    },{
      text: 'Maecenas in ultricies sapien. Proin quis sapien velit.'
    },{
      text:  'Nullam nisi velit, cursus id enim sit amet, mattis vulputate libero. Vivamus hendrerit, quam sit amet dictum dapibus, lorem enim laoreet mauris, quis blandit elit risus quis elit.'
    }]
  }]
}]

Vue.prototype.$editor = 'sdfafdsa'

new Vue({
  render: h => h(Nib, {
    props: {
      initValue: initValue
    }
  }),
}).$mount('#cont')


