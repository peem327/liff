import { authHeader, clientAuthHeader } from '../_helpers';
import { IUser, IRegisterPayload } from '../_types';
import { handleResponse } from './response.middleware';

export default class UserService {
    private API_URL = process.env.VUE_APP_API_URL;
    private AUTH_USER = process.env.VUE_APP_API_USER;
    private AUTH_PASSWORD = process.env.VUE_APP_API_PASSWORD;

    public getAccessToken() {
        const header = new Headers({
            "Authorization": `Basic ${btoa(`${this.AUTH_USER}:${this.AUTH_PASSWORD}`)}`
        })
        return fetch(this.API_URL+'/token/client_credentials', {
            method: 'POST',
            headers: header
        }).then(handleResponse).then((result: any)=>{
            localStorage.setItem(process.env.VUE_APP_ACCESS_API_STORAGE_KEY, result.data.access_token);
            return result.data;
        })
    }
    public login(identity_id: string, phone_no: string): Promise<boolean> {
        const requestOptions: any = {
            method: 'POST',
            headers: clientAuthHeader({"Content-Type":"application/json"}),
            body: JSON.stringify({ identity_id, phone_no })
        };
        return fetch(this.API_URL+`/v1/login`, requestOptions)
        .then(handleResponse)
        .then(result => {
            if (result.error!.length){
                throw result.error;
            }
            return result.success;
        }, (err: any)=>{
            throw err;
        })
        .catch((e: any)=>{
            if(e.error[0].code == 'error_user_logged'){
                return true
            }
            return false;
        });
    }

    public lineLogin(token: string) {
      const requestOptions: any = {
          method: 'POST',
          headers: clientAuthHeader({"Content-Type":"application/json"}),
          body: JSON.stringify({ token })
      };
      return fetch(this.API_URL+`/v1/line-login`, requestOptions)
      .then(handleResponse)
      .then(result => {
        console.log('LINELOGIN: ', result);
          if (result.error!.length){
              throw result.error;
          }
          return result.success;
      }, (err: any)=>{
          throw err;
      })
      .catch((e: any)=>{
          if(e.error[0].code == 'error_user_logged'){
              return true
          }
          return false;
      });
    }

    public logout() {
        const requestOptions: any = {
            method: 'POST',
            headers: clientAuthHeader({"Content-Type":"application/json"})
        };
        return fetch(this.API_URL+`/v1/logout`, requestOptions)
        .then(handleResponse)
        .then(result => {
            localStorage.removeItem(process.env.VUE_APP_LOCAL_STORAGE_KEY);
            localStorage.removeItem(process.env.VUE_APP_ACCESS_API_STORAGE_KEY);
            localStorage.removeItem(process.env.VUE_APP_STORE_LOCAL_STORAGE_KEY);
            //this.getAccessToken();
            return result;
        }, (err: any)=>{
            throw err;
        })
        .catch((e: any)=>{
            return e;
        });
    }

    public register(user: IRegisterPayload) {
        const requestOptions: any = {
            method: 'POST',
            headers: clientAuthHeader({"Content-Type":"application/json"}),
            body: JSON.stringify(user)
        };

        return fetch(this.API_URL+`/v1/register`, requestOptions).then(handleResponse);
    }

    public getProfile(): Promise<void> {
        const timestamp = new Date().getTime();
        return fetch(this.API_URL+`/v1/account/profile?v=${timestamp}`, {
            method: 'GET',
            headers: clientAuthHeader()
        })
        .then(handleResponse)
        .then((result: any)=>{
            if(!result || !result.data) {
              return this.logout();
            }
            const user = result.data;
            //console.log('serviceGetProfile', user);
            return user;
        })
    }

    public getOrder(orderId: string) {
        return fetch(this.API_URL+`/v1/account/orders/${orderId}`, {
            method: 'GET',
            headers: clientAuthHeader()
        })
        .then(handleResponse)
        .then((result: any)=>{
            const order = result.data;
            return order;
        })
    }

    public updateProfile(user: IRegisterPayload) {
      const requestOptions: any = {
          method: 'POST',
          headers: clientAuthHeader({"Content-Type":"application/json"}),
          body: JSON.stringify(user)
      };

      return fetch(this.API_URL+`/v1/profile-update`, requestOptions).then(handleResponse);
    }
}

export const userService = new UserService();
