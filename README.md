# herculeX
Simple, predictable, lightweight, high performance, developer friendly state management for alipay mini-program

![setData (1).png](https://cdn.nlark.com/lark/0/2018/png/82549/1537904366328-49a7e2e5-5aeb-4326-be5f-8cf0eb603181.png) 

## Feature

- [x] Component, Page, global wrapper
- [x] vuex-like apis and concept: actions, mutations, getters, plugins
- [x] strengthen mutation, getters: add immutable helper, global power to getters.and improve mutation usecase, add some common innerMutation
- [x] plugins support, add logger as inner plugin
- [x] cross page communication: message channel, auto router dispatcher(manage router ), get ready-only State by namespace
- [x] cross components communication: support centralized ref management
- [x] connect: connect Page to Component, add mapStateToProps, mapGettersToProps, use more developer friendly way.
- [x] mapHelpers: connect actions and mutations to Page, Componnet methods
- [x] global store support: manage all store, component instance and global state, global message bus ,event bus
- [x] event bus support
- [x] router: improve router usecase, auto router dispatcher, add resume lifecycle
- [x] utils: immutable heplers, common functional tools, urlParser, promiseWrapper... 
- [x] use immer and immutable helper to promise immutable
- [x] magic memoization: add special memoization feature to mapHelpersToProps

## Installation

* Installation: `npm install herculex --save`.
* basic usage:
  * index.js
  ``` 
  import store from './store';
  const app = getApp();
  Page(store.register({
    mapActionsToMethod: ['getUserInfo'],
    mapMutationsToMethod: ['helperWay'],
    onLoad() {
     const message = this.$message.pop('card-home');
     // get message from last page as you like
    },
    onReady() {
      const componentInstance = this.$getRef('card-input');
      // get component ref, then get data when you need ,specially in form condition
    },
    onResume(ctx) {
     // get ctx here, 
    },
    ...
    onTap() {
    }
  })
  ```
  * store.js
  ```
   export default new Store({
   connectGlobal: true,
   state: {
       userInfo: {},
       bannerList: [],
       UI,
    },
   getters: {
    // functional promgraming, add some helpers
    cardCount: (state, getters, global) => global.getIn(['entity', 'cardList', 'length'], 0),
    avatar: state => state.getIn(['userInfo', 'iconUrl'], ASSETS.DEFAULT_AVATAR),
    nickName: state => state.getIn(['userInfo', 'nick']),
    cardList: (state, getters, global) => global.getIn(['entity', 'cardList'], []).map(mapCardItemToData),
   },
   mutations: {
     mutableWay(state, payload) {
     // use immer promise immutable
      state.a = payload.a
     },
     helperWay(state, payload) {
       // use inner helper: setIn, deleteIn, update
      return state.setIn(['userInfo', 'name'], payload.name)
     }
   },
   plugins: [ 'logger' ], // inner plugin logger
   actions: {
     async getUserInfo({ commit, state, dispatch, global, getters, }, payload) {
       // get router and context in global store, all state are binded immutable helper
       const routerCtx = global.getIn(['router', 'currentRouter']);
       const avatar = getters.getIn('avatar');
       const userInfo = await cardListService.getUserInfo();
       commit('getUserInfo', { userInfo });
     },
   },
  });
  ```
  * index.axml
  ```
  <view a:if="{{!!$global.entity.cardList}}">
    {{userInfo.name}}
     <navigator a:if="{{$getters.cardCount > 0}}" class="link" url="/pages/card-create/index">
        <button type="primary">{{UI.TEST}}</button>
     </navigator>
  </view>
  ```

## Examples
* appx (alipay mini program)
  * quick start
    * [Counter](https://github.com/herculesJS/herculex-appx-examples/tree/master/quick-start/pages/counter) : show basic usage as commit & dispatch
    * [TODOS](https://github.com/herculesJS/herculex-appx-examples/tree/master/quick-start/pages/todos): show how components and modules work

## Turtoral
  
## TODO
- [ ] add pageBeforeRender Action to do something before instance created
- [ ] add travis ci
- [ ] add middleware support, take over api middleware
- [ ] doc & gitbook,github.io
- [ ] examples & boilerplate
- [ ] cli for static code check, and generate snipets
- [ ] ide plugin
- [ ] model based api middleware
- [ ] test-utils & mock helper
- [ ] dev-tools for ide & standalone
- [ ] modules (need deeply design)
- [ ] error catcher plugin
- [ ] refactory and tests, separate appx data setter as independent repo
