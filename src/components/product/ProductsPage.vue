<template>
  <div>
    <b-container class="pr-0">
      <b-row align-v="center" class="mb-3">
        <b-col class="pl-0">
          <img v-if="store.logo" class="" :src="store.logo" width="100" />
          <h1 v-if="!store.logo">LOGO</h1>
        </b-col>
        <b-col cols="4" class="text-right">
          <b-button variant="link" class="px-0" @click="$router.push({path: menuURL.CART})">
            <a-badge :count="totalCartAmount" :numberStyle="{backgroundColor: 'rgb(54, 180, 1)', top: '10px', right: '10px'}" >
              <SvgIcons svg="cart" />
            </a-badge>
          </b-button>
        </b-col>
      </b-row>
    </b-container>
    <b-container v-if="serviceList && serviceList.length" class="mb-3">
      <b-row><h2 class="pl-1 mb-3">หมวดหมู่</h2></b-row>
      <b-row class="flex-nowrap" style="overflow-x: scroll">
        <div v-for="service in serviceList" :key="`service-${service.id}`" 
          class="service-grid mr-3 pb-2 position-relative" :class="`service-${service.id}`">
          <div class="d-flex flex-column box-shadow">
            <div class="bg-service" :style="{backgroundImage: `url(${service.image})`}"></div>
            <div class="text-center text-truncate p-1 small">{{ service.name }}</div>
          </div>
          <a class="position-absolute" style="top: 0; bottom: 0; left: 0; right: 0" @click="handleClickService(service)"></a>
          <div class="circle position-absolute d-none">
            <b-icon-check-circle-fill class="text-primary bg-white rounded-circle" ></b-icon-check-circle-fill>
          </div>
        </div>
      </b-row>
    </b-container>
    <b-container>
      <b-row><h2 class="pl-1 mb-3">รายการสินค้า</h2></b-row>
      <div class="row mb-3" v-if="categoryList">
        <div class="pl-1 categories-wrapper py-1 d-flex flex-nowrap w-100" style="overflow-x: scroll;">
          <!-- <div class="pl-1 categories-wrapper py-1 d-flex w-100" > -->
          <b-button v-for="category in categoryOptions"
            :key="category.value"
            :pressed="category.value == categorySelected"
            :active="category.value == categorySelected"
            class="mr-2" variant="outline-primary" @click="handleFilter(category.value)" pill>
            <span class="text-nowrap">{{category.text}}</span>
          </b-button>
        </div>
      </div>
      <b-row v-if="loading">
        <b-col cols="12" v-for="n in [1, 2, 3, 4, 5]" :key="n" class="mb-5">
          <vcl-facebook></vcl-facebook>
        </b-col>
      </b-row>
      <b-row v-if="!loading && (productList && !productList.length)">
        <b-col cols="12" class="mt-5">
          <a-empty />
        </b-col>
      </b-row>
      <b-row v-if="!loading && productList && productList.length">
        <b-col cols="12" v-for="product in productList" :key="product.id" class="mb-4">
          <div class="row align-items-start border border-light py-2 rounded box-shadow">
            <div class="col-4 px-2">
              <img class="img-fluid rounded-lg" :src="product.image" />
            </div>
            <div class="col-8 px-1 align-self-stretch">
              <div class="d-flex flex-column h-100">
                <p class="font-weight-medium mt-1 mb-0 text-truncated">{{product.title}}</p>
                <span class="text-primary" v-html="renderPrice(product.price)"></span>
                <span class="align-self-end mt-auto mb-md-1">
                  <ProductCategoryTag :categoryId="product.category_id" :categoryName="product.category_name" />
                </span>
              </div>
            </div>
            <router-link :to="menuURL.PRODUCT+`/${product.id}`" class="position-absolute w-100 h-100"></router-link>
          </div>
        </b-col>
        <infinite-loading @infinite="infiniteHandler">
          <div slot="no-results"></div>
          <div slot="no-more"></div>
        </infinite-loading>
      </b-row>
    </b-container>
  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { productService } from '../../_services/product.service';
import { masterService } from '../../_services/master.service';
import { bahtFormatted } from '../../_helpers/index';
import { EMenuURL, IUser } from '../../_types';
import InfiniteLoading from 'vue-infinite-loading';
import SvgIcons from '../icon/SVGIcons.vue';
import ProductCategoryTag from '../ProductCategoryTag.vue';
// @ts-ignore
import { VclFacebook } from 'vue-content-loading';
import { namespace } from 'vuex-class'
const userModule = namespace('User')
const storeModule = namespace('Store')

@Component({
  components: {
    SvgIcons,
    VclFacebook,
    ProductCategoryTag,
    InfiniteLoading
  },
})
export default class ProductsPage extends Vue {
  @userModule.State
  public clientAccessToken!: string;

  @userModule.Action
  public getClientAccessToken!: () => void

  @userModule.State
  public status!: {loggedIn: boolean};

  @userModule.State
  public user!: IUser

  @userModule.Action
  public setProfile!: (redirect?: any)=>void;

  @storeModule.State
  public store!: {id: string; logo: string};

  @storeModule.Action
  public updateStoreId!: (storeId: string) => void

  @storeModule.Action
  public updateStoreLogo!: (storeLogo: string) => void

  private serviceList: any[] = [];
  private categoryList: null|any = null;
  private productList: any[] = [];

  private categorySelected: null|any = 'all';
  private categoryOptions: any[] = [{text: 'ทั้งหมด', value: 'all', active: true}];

  private menuURL = EMenuURL;

  private loading = false;

  private currentPage: number = 1;

  private selectedServiceId: string = '';

  get products() {
    return this.productList;
  }

  get totalCartAmount() {
    return this.user.totalCartAmount
  }

  renderPrice(price: string) {
    return bahtFormatted(+price);
  }

  fetchServices() {
    this.serviceList = [
      // {name: "Cafe Amazon", image: "https://picsum.photos/id/12/400/200", id: 12},
      // {name: "จองร้าน", image: "https://picsum.photos/id/15/400/200", id: 15},
      // {name: "FIT AUTO", image: "https://picsum.photos/id/16/400/200", id: 16},
      // {name: "Test", image: "https://picsum.photos/id/18/400/200", id: 18}
    ];
    masterService.getServices()
    .then((result: any)=>{
      this.serviceList = [...this.serviceList, ...result]
    })
  }

  fetchStoreLogo() {
    masterService.getLogo(this.store.id)
    .then((result: any)=>{
      this.updateStoreLogo(result);
    })
  }

  fetchProductCategory() {
    return masterService.getProductCategoryList({
      ...(+this.store.id && {store_id: +this.store.id}), 
      ...(this.selectedServiceId && {service_id: +this.selectedServiceId})})
    .then((result: any)=>{
      this.categoryList = result;
      
      this.categoryOptions = this.selectedServiceId? []: [{text: 'ทั้งหมด', value: 'all', active: true}];
      
      this.categoryOptions = [...this.categoryOptions, ...this.categoryList.map((ele: any)=>{
        return { text: ele.name, value: ele.category_id };
      })];
    });
  }

  fetchProducts($state?: any) {
    let promise;
    if(!Number.isNaN(+this.categorySelected)){
      promise = productService.getList(this.categorySelected, +this.store.id, this.currentPage);
    }else{
      promise = productService.getList(undefined, Number(this.store['id']), this.currentPage);
    }
    promise.then((result: any)=>{
      if($state && (!result || (result && !result.length))){
        $state.complete();
        return;
      }
      this.productList = [...this.productList, ...result];
      if($state){
        $state.loaded();
      }
    }).finally(()=>{
      this.loading = false;
    })
  }
  infiniteHandler($state: any){
    this.currentPage++;
    this.fetchProducts($state);
  }

  created() {
    if(!this.clientAccessToken){
      return this.getClientAccessToken();
    }
    if(this.status.loggedIn){
      this.setProfile();
    }
    if(this.$route.query && this.$route.query.storeId){
      this.updateStoreId(this.$route.query.storeId as string);
      //this.storeId = this.$route.query.storeId;
    }else{
      this.updateStoreId('');
    }
    this.fetchServices();
    this.fetchStoreLogo();
    this.fetchProductCategory();
    if(!this.productList.length){
      this.loading = true;
      this.fetchProducts();
    }
  }

  mounted() {
  }

  handleFilter(categoryId: any) {
    this.loading = true;
    this.categorySelected = categoryId;
    this.productList = [];
    this.currentPage = 1;
    this.fetchProducts();
  }

  async handleClickService(service: any){
    const selector = `.service-grid.service-${service.id}`;
    // @ts-ignore
    let isSelected = document.querySelector(selector).classList.contains("selected");
    // @ts-ignore
    document.querySelectorAll('.service-grid').forEach((ele: any)=>{
      ele.classList.remove('selected');
    });
    // @ts-ignore
    document.querySelectorAll('.service-grid .circle').forEach((ele: any)=>{
      ele.classList.add('d-none');
    });
    this.selectedServiceId = '';
    if(!isSelected){
      // @ts-ignore
      document.querySelector(selector).classList.add("selected");
      // @ts-ignore
      document.querySelector(`${selector} .circle`).classList.remove("d-none");
      this.selectedServiceId = service.id;
    }
    await this.fetchProductCategory();
    const firstCategory = this.categoryOptions[0].value;
    this.categorySelected = Number.isNaN(+firstCategory)? null: firstCategory;
    this.productList = [];
    this.currentPage = 1;
    this.fetchProducts();
    // console.log('handleClickService', this.selectedServiceId);
  }

}
</script>
<style scoped>
.service-grid .circle{
  top: 5px;
  right: 5px;
}
.price-tag{
  color: #00AEEF;
}
.bg-service{
  height: 120px;
  background-position: center bottom;
  background-repeat: no-repeat;
  background-size: cover;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}
.service-grid{
  min-width: 100px;
}
.service-grid .d-flex{
  border-radius: 0.5rem;
}
.service-grid.selected{

}
</style>
