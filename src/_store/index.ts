import Vue from 'vue';
import Vuex from 'vuex';

//import { alert } from './alert.module';
//import { account } from './account.module';
// import { users } from './users.module';

// Vue.use(Vuex);

// export const store = new Vuex.Store({
//     modules: {
//         //alert,
//         //account,
//         users
//     }
// });

import User from '@/_store/user.module'
import Store from '@/_store/store.module'

Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    User,
    Store
  }
})
export default store