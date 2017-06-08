import Vue from 'vue/dist/vue.common.js'
// import Vue from 'vue'
import { mapResources } from '../../dist/vuex-jsdata-plugin.js'
import { mapGetters } from 'vuex'

// Init JsDataStore
import Comment from 'jsdata/models/comment'
import User from 'jsdata/models/user'

// Setup some mocks
Comment.inject([
  {
    id: 0,
    comment: 'Hello',
  },
  {
    id: 1,
    comment: 'World',
  },
])
User.inject([
  {
    id: 0,
    name: 'Alex',
  },
])

// Init VuexStore
import VuexStore from 'vuex/index.js'

// Kickstart App


const vm = new Vue({
  store: VuexStore,
  data: {
    msg: 'Simple Example',
    user_id: 0,
  },
  template: `
  <div>
    <h1>{{msg}}</h1>
    <b>Comments:</b>
    <pre>{{comments}}</pre>

    <b>Users:</b>
    <pre>{{users}}</pre>

    <b>Specific User:</b>
    <pre>{{user}}</pre>

    <p>Please, open your DevTool</p>
  </div>
  `,
  computed: Object.assign({},
    {
      comments() { return this.$store.getters.DSComment},
      users() { return this.$store.getters.DSUser},
    },
    // mapGetters([
    //   'DSUser',
    // ]),
    mapResources([
      { user: ['User', 'user_id'] },
    ])
  ),
}).$mount('#app')
