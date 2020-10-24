import Vue from 'vue';
import Router from 'vue-router';

import { EMenuURL } from '../_types';
import LoginPage from '../components/login/LoginPage.vue';
import RegisterPage from '../components/register/RegisterPage.vue';
import AboutPage from '../components/AboutPage.vue';
import ProductsPage from '../components/product/ProductsPage.vue';
import ProductPage from '../components/product/ProductPage.vue';
import StationsPage from '../components/station/StationsPage.vue';
import StationPage from '../components/station/StationPage.vue';
import ConfirmationPage from '../components/station/ConfirmationPage.vue';
import ProfilePage from '../components/user/ProfilePage.vue';
import OrderPage from '../components/user/OrderPage.vue';
import OrderSlipPage from '../components/user/OrderSlipPage.vue';
import CartPage from '../components/cart/CartPage.vue';
import { namespace } from 'vuex-class'
const userModule = namespace('User')

Vue.use(Router);

export const router = new Router({
  base: process.env.BASE_URL,
  mode: 'history',
  routes: [
    { path: EMenuURL.LOGIN, component: LoginPage },
    { path: EMenuURL.CART, component: CartPage },
    { path: EMenuURL.REGISTER, component: RegisterPage },
    { path: EMenuURL.PROFILE, component: ProfilePage },
    { path: EMenuURL.ABOUT, component: AboutPage },
    { path: EMenuURL.PRODUCT+'/:productId', component: ProductPage },
    { path: '/order/:orderId/slip', component: OrderSlipPage, name: 'slipPage' },
    { path: '/order/:orderId', component: OrderPage },
    /*{ path: '/store', component: StationsPage, children: [
      { path: ':stationId', component: StationPage, name: 'singleStation', children: [
        { path: 'confirmation', component: ConfirmationPage, name: 'confirmationPage' }
      ] }
    ]},*/
    { path: '/store/:stationId/confirmation', component: ConfirmationPage, name: 'confirmationPage'},
    { path: '/store/:stationId', component: StationPage, name: 'singleStation' },
    { path: EMenuURL.PRODUCTS, component: ProductsPage },
    { path: EMenuURL.STATIONS, component: StationsPage },
    { path: EMenuURL.STATIONS_RESERVATION, component: StationsPage },
    // otherwise redirect to home
    //{ path: '*', redirect: process.env.BASE_URL }
  ],
  scrollBehavior() {
      //document.getElementById('app').scrollIntoView();
      window.scrollTo(0,0);
  }
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const privatePage = [
    //EMenuURL.CART,
    //EMenuURL.CONFIRMATION,
    EMenuURL.PROFILE
  ];

  const toPath: any = to.path;
  const toQuery: any = from.query;
  const authRequired = privatePage.includes(toPath) /*|| toPath.includes(EMenuURL.CONFIRMATION)*/ || toPath.includes('/order');
  const user = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_KEY);
  const loggedIn = user? 'profile' in JSON.parse(user) : false;
  if (authRequired && !loggedIn && !toPath.includes('/login')) {
    return next(EMenuURL.LOGIN);
  }
  return next();
})
