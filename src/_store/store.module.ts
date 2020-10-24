import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators'
import { userService } from '../_services';
import { router } from '../_router';
import { IUser, IRegisterPayload, ICart } from '../_types';

interface IStore {
    id?: string;
    logo?: string;
}

@Module({ 
    namespaced: true
})
class Store extends VuexModule {

    public store: any = localStorage[process.env.VUE_APP_STORE_LOCAL_STORAGE_KEY]? JSON.parse(localStorage.getItem(process.env.VUE_APP_STORE_LOCAL_STORAGE_KEY) as string): {id: '', logo: ''};

    @Mutation
    setStore(store: IStore) {
        this.store = store;
        localStorage.setItem(process.env.VUE_APP_STORE_LOCAL_STORAGE_KEY, JSON.stringify(store));
    }

    @Mutation
    setStoreId(storeId: string) {
        this.store.id = storeId;
        localStorage.setItem(process.env.VUE_APP_STORE_LOCAL_STORAGE_KEY, JSON.stringify(this.store));
    }
    @Mutation
    setStoreLogo(logoURL: string) {
        this.store.logo = logoURL;
        localStorage.setItem(process.env.VUE_APP_STORE_LOCAL_STORAGE_KEY, JSON.stringify(this.store));
    }

    @Action
    public updateStoreId(newStoreId: string): void {
        this.context.commit('setStoreId', newStoreId);
    }
    @Action
    public updateStoreLogo(newStoreLogo: string): void {
        this.context.commit('setStoreLogo', newStoreLogo);
    }


}
export default Store;

