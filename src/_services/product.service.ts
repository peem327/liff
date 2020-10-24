import { authHeader, clientAuthHeader, getQueryString } from '../_helpers';
import { IUser, IRegisterPayload } from '../_types';
import { handleResponse } from './response.middleware';

export default class ProductService {
    private API_URL = process.env.VUE_APP_API_URL+'/v1/products';

    public getList(categoryId?: number, storeId?: number, page?: number) {
        let params = {}, url = this.API_URL;
        if(categoryId){
            //url += '?category_id='+categoryId
            params = {...params, category_id: categoryId};
        }
        if(storeId) params = {...params, store_id: storeId};
        if(page) params = {...params, page: page};
        let q = getQueryString(params);
        if(q) url += '?'+q;
        return fetch(url, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })
    }

    public get(productId: string) {
        return fetch(this.API_URL+`/${productId}`, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })
    }

}

export const productService = new ProductService();
