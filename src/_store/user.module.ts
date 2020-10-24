import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators'
import { userService } from '../_services';
import { router } from '../_router';
import { IUser, IRegisterPayload, ICart } from '../_types';

@Module({
  namespaced: true
})
class User extends VuexModule {
  private userStored = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_KEY) as string;
  public clientAccessToken: string = localStorage.getItem(process.env.VUE_APP_ACCESS_API_STORAGE_KEY)|| '';
  public user: IUser = this.userStored? JSON.parse(localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_KEY) as string) : {cart: [], totalCartAmount: 0};
  public status: any = { loggedIn: 'profile' in this.user };
  public selectedStationState: any = {stationId: '', provinceId: '', districtId: ''};


  @Mutation
  requestClientAccessTokenSuccess(token: string): void {
    this.clientAccessToken = token;
    location.reload(true);
  }
  @Mutation
  requestClientAccessTokenFailure(): void {
    this.clientAccessToken = '';
  }
  @Mutation
  setLatestShipping(shipping: IUser['shipping']) {
    this.user!.shipping = shipping;
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_KEY, JSON.stringify(this.user));
  }
  @Mutation
  setOrder(newOrder: IUser['order']) {
    this.user!.order = newOrder;
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_KEY, JSON.stringify(this.user));
  }
  @Mutation
  setOrderProductHistory(newOrderProductHistory: IUser['orderProductHistory']) {
    this.user!.orderProductHistory = newOrderProductHistory;
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_KEY, JSON.stringify(this.user));
  }
  @Mutation
  setCart(product: ICart) {
    let isExisted = false;
    let currentCart = this.user.cart;
    let newCart = [...currentCart];
    if(!currentCart.length){
      newCart = [product];
    }else{
      if(!product.amount) {
        //delete
        if(product.model){
          currentCart = currentCart.filter((ele: ICart)=>{
            return ele.model.id !== product.model.id
          });  
        }else{
          currentCart = currentCart.filter((ele: ICart)=>{
            return ele.productId !== product.productId
          });  
        }
        newCart = [...currentCart];
      }else{
        currentCart = currentCart.map((ele)=>{
          if(ele.productId == product.productId) {
            if(!product.model || product.model.id == ele.model.id){
              isExisted = true;
              ele.amount = product.amount;
              ele.limit = product.limit;
            }
          }
          return ele
        });
        if(!isExisted) newCart = [...currentCart, product]
      }
    }
    this.user!.cart = newCart;
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_KEY, JSON.stringify(this.user));
  }
  @Mutation
  setTotalCartAmount() {
    this.user.totalCartAmount = this.user.cart.reduce((a, b)=>{
      return a + b['amount'];
    }, 0);
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_KEY, JSON.stringify(this.user));
  }
  @Mutation
  requestClearCart() {
    let newCart: any[] = [];
    this.user!.cart = newCart;
    this.user!.totalCartAmount = 0;
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_KEY, JSON.stringify(this.user));
  }
  @Mutation
  loginRequest(user: IUser) {
    this.status = { loggingIn: true };
    this.user = user;
  }
  @Mutation
  loginSuccess( user: IUser|any ) {

    this.status = { loggedIn: true };
    let tmp = {...this.user, ...user};
    if(user && user.product){
      tmp['orderProductHistory'] = user.product;
    }
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_KEY, JSON.stringify(tmp));
    this.user = tmp;
  }
  @Mutation
  loginSuccessRedirect( redirect: any ) {
    const name = redirect.redirect,
    stationId = redirect.stationId;
    // @ts-ignore
    router.replace({name, params: {stationId}});
  }
  @Mutation
  loginFailure() {
    this.status = {};
    this.user = {cart: [], totalCartAmount: 0};
  }
  @Mutation
  public logoutRequest() {
    this.status = {};
    this.user = {cart: [], totalCartAmount: 0};
    this.clientAccessToken = '';
    localStorage.removeItem(process.env.VUE_APP_LOCAL_STORAGE_KEY);
    localStorage.removeItem(process.env.VUE_APP_ACCESS_API_STORAGE_KEY);
  }
  @Mutation
  registerRequest(user: IRegisterPayload) {
    this.status = { registering: true };
  }
  @Mutation
  registerSuccess(user: IUser) {
    this.status = {};
  }
  @Mutation
  registerFailure(error: any) {
    this.status = {};
  }
  @Mutation
  requestSetSelectedStation(val: any) {
    this.selectedStationState = val || {stationId: '', provinceId: '', districtId: ''};
  }

  @Action
  getClientAccessToken() {
    userService.getAccessToken()
    .then((res: any)=>{
      this.context.commit('requestClientAccessTokenSuccess', res.access_token);
    }, err=>{
      this.context.commit('requestClientAccessTokenFailure');
    })
  }

  @Action
  setProfile(redirect?: any) {
    delete this.user.profile;
    userService.getProfile()
    .then((result: any)=>{
      this.context.commit('loginSuccess', result);
      if(redirect){
        this.context.commit('loginSuccessRedirect', redirect);
      }
    })
  }

  @Action
  setStation(obj?: string) {
    const value = obj? JSON.parse(obj): null;
    this.context.commit('requestSetSelectedStation', value);
  }


  @Action
  public logout(): void {
    userService.logout()
    .then((result: any)=>{
      if(result.success){
        this.context.commit('logoutRequest');
      }
    }, (err: any)=>{
      throw err;
    })
    .catch((e:any)=>{
      localStorage.removeItem(process.env.VUE_APP_LOCAL_STORAGE_KEY);
      localStorage.removeItem(process.env.VUE_APP_ACCESS_API_STORAGE_KEY);
      this.context.commit('logoutRequest');
    });
  }

  @Action
  register(user: IRegisterPayload) {
    this.context.commit('registerRequest', user);

    userService.register(user)
    .then(
      user => {
        this.context.commit('registerSuccess', user);
        router.push('/login');
        setTimeout(() => {
          // display success message after route change completes
          //dispatch('alert/success', 'Registration successful', { root: true });
        })
      },
      error => {
        this.context.commit('registerFailure', error);
        //dispatch('alert/error', error, { root: true });
      }
    );
  }
  @Action
  public updateName(newName: string): void {
    this.context.commit('setName', newName)
  }

  @Action
  public updateCart(productWithAmount: string): void {
    let {productId, amount, image, title, price, limit, model} = JSON.parse(productWithAmount);
    this.context.commit('setCart', {productId, amount, image, title, price, limit, model})
    this.context.commit('setTotalCartAmount');
  }

  @Action
  public updateOrder(newOrderList: any): void {
    this.context.commit('setOrder', newOrderList);
  }

  @Action
  public clearCart(): void {
    this.context.commit('requestClearCart');
  }

  @Action
  public updateOrderProductHistory(newOrderProductHistoryList: any): void {
    this.context.commit('setOrderProductHistory', newOrderProductHistoryList);
  }

  @Action
  public updateShipping(shipping: any): void {
    this.context.commit('setLatestShipping', JSON.parse(shipping));
  }

}
export default User;
