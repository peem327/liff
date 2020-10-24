<template>
  <div class="position-relative">
    <div v-if="!isLoading && product" class="product-image-wrapper position-absolute" :style="{width: minWidth}">
      <!-- <img :src="product.image" class="img-fluid"> -->
      <div class="position-relative">
        <a-carousel :after-change="onChangeSlider" dots-class="slick-dots" class="" ref="imageSlick">
          <div v-for="(url, idx) in imageList" :key="`${idx}-item`">
            <img :src="url" class="img-fluid"  @click="index = idx">
          </div>
        </a-carousel>
        <button
          class="btn btn-link position-absolute full-screen-btn-wrapper"
           v-for="(url, idx) in imageList" :key="`${idx}-item`"
           @click="index = idx"
        >
          <b-icon-arrows-fullscreen></b-icon-arrows-fullscreen>
        </button>
        <CoolLightBox
        :items="this.imageList" 
        :index="index"
        :fullScreen="true"
        :useZoomBar="true"
        v-on:close="index = null"
        style="z-index: 9999; background-color: rgba(30, 30, 30, 1);"
      >
      </CoolLightBox>
      </div>
      <div class="product-info-wrapper bg-white pt-3 position-relative">
        <b-container class="pb-1">
          <ProductCategoryTag :categoryId="product.category_id" :categoryName="product.category_name" />
          <h5 class="mt-1">{{product.title}}</h5>
          <span class="text-primary">{{price}}</span>
          <hr />
          <p v-html="product.description"></p>
          <div v-if="store">
            <hr />
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex">
                <div class="mr-2">
                  <a-avatar v-if="store.logo" :src="store.logo" shape="square" size="large"></a-avatar>
                  <a-avatar v-if="!store.logo" shape="square" size="large">{{getShortName(store.name)}}</a-avatar>
                </div>
                <div class="d-flex flex-column small">
                  <span class="font-weight-bold">
                    {{store.name}}
                  </span>
                  <span class="text-primary">
                    <span style="vertical-align: 1px;">
                      <SvgIcons svg="placePin" display="d-inline" />
                    </span>
                    {{store.address}}
                  </span>
                </div>
              </div>
              <router-link :to="menuURL.STATION+`/${store.id}`">
                <b-button variant="outline-primary">
                  <span class="text-nowrap small">ดูร้านค้า</span>
                </b-button>
              </router-link>
            </div>
            <hr/>
          </div>
        </b-container>
      </div>

      <div class="add-to-cart-wrapper px-2 pt-3 pb-2 bg-white border-top w-100 position-fixed" style="bottom: 0">
        <div class="container position-relative">
          <div class="variants-wrapper position-absolute w-100 px-4" :style="{top: variantTop}">
            <div class="row">
              <div class="offset-lg-3 col-lg-6 px-2 py-3 border-top">
                <p v-if="showVaraintError" class="small text-danger">กรุณาระบุตัวเลือกสินค้า</p>
                <div v-for="(ele, idx) in variants" :key="ele.name" class="mb-2">
                  <h6>{{ele.name}}</h6>
                  <a-radio-group :name="ele.name" @change="onClickVariant($event, idx)">
                    <a-radio-button v-for="option in ele.options" :key="option.value" class="mr-2 rounded-0" 
                      :value="option.value" :disabled="!option.quantity">
                      {{option.label}}
                    </a-radio-button>
                  </a-radio-group>
                </div>
                <!-- <span v-if="selectedVariationQty" class="small text-grey current-stock">คลัง: {{selectedVariationQty}}</span> -->
                <div v-if="selectedVariationQty" class="pt-1 d-flex text-grey justify-content-between">
                  <div class="d-flex">
                    <SvgIcons svg="busket" class="mr-1" />
                    <div v-if="product.limit_qty">
                      <span class="small font-weight-light">ออนไลน์ x</span>
                      <span v-if="selectedModel.quantity_online && selectedModel.quantity_online > 0">
                        {{renderNumber(selectedModel.quantity_online)}}
                      </span>
                      <span v-if="!selectedModel.quantity_online || selectedModel.quantity_online <= 0" class="text-danger">
                        หมด
                      </span>
                    </div>
                    <div v-if="product.limit_qty == 0">
                      <span class="small font-weight-light">คงเหลือ x</span>
                      <span> {{renderNumber(selectedModel.quantity_online + selectedModel.quantity_offline)}}</span>
                    </div>
                  </div>
                  <div class="d-flex" v-if="product.limit_qty > 0">
                    <SvgIcons svg="store" class="ptt mr-1" />
                    <div>
                      <span class="small font-weight-light">หน้าร้าน x</span>
                      {{renderNumber(selectedModel.quantity_offline)}}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="offset-lg-3 col-lg-6 px-2">
              <div class="d-flex justify-content-between">
                <span class="text-grey">จำนวน</span>
                <div class="mr-1">
                  <div class="d-flex align-items-center justify-content-between">
                    <NumberInput :disabled="purchaseLimitation === 0" 
                      :limit="purchaseLimitation" 
                      v-on:change="onNumberChange" class="mr-2" />
                    <span class="text-primary">{{totalPrice}}</span>
                  </div>
                  <span class="small text-danger" v-if="product.limit_qty > 0 && purchaseLimitation == product.limit_qty">{{`สามารถสั่งซื้อได้ไม่เกิน ${product.limit_qty} ชิ้น`}}</span>
                  <span class="small text-danger" v-if="product.limit_qty > 0 && purchaseLimitation < product.limit_qty && purchaseLimitation != 0">{{`สามารถสั่งซื้อได้ ${purchaseLimitation} ชิ้น`}}</span>
                  <span class="small text-danger" v-if="product.limit_qty > 0 && purchaseLimitation == 0">{{`จองสินค้าครบตามโควต้าแล้ว`}}</span>
                  <!-- <span class="small text-danger" v-if="product.limit_qty <= 0">{{`สินค้าหมด`}}</span> -->
                </div>
                <b-button class="mt-1" variant="primary" @click="onUpdateCart" :disabled="!ableToPurchase">
                  <div class="d-flex align-items-center">
                    <span class="busket-wrapper"><SvgIcons svg="busket" class="mr-2" /></span>
                    <span class="text-nowrap">ใส่ตะกร้า</span>
                  </div>
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="product-image-wrapper position-absolute py-2 pl-2 pr-1" :style="{width: minWidth}">
      <vcl-twitch class="mb-5"></vcl-twitch>
      <vcl-list class="mb-5"></vcl-list>
      <vcl-code></vcl-code>
    </div>

    <div v-if="!isLoading && !product" class="product-image-wrapper position-absolute pt-5 mt-5" :style="{width: minWidth}">
      <a-empty></a-empty>
    </div>

    <b-container class="px-0">
      <b-row align-v="center" class="mb-3">
        <b-col>
          <b-button variant="link" @click="$router.go(-1)" class="text-dark-grey">
            <SvgIcons svg="leftArrow" />
          </b-button>
        </b-col>
        <b-col cols="4" class="text-right">
          <b-button variant="link" class="px-0 pb-0" @click="$router.push({path: menuURL.CART})">
            <a-badge :count="totalCartAmount" 
              :numberStyle="{backgroundColor: 'rgb(54, 180, 1)', boxShadow: 'unset', top: '10px', right: '10px'}" 
              title="total product in cart">
              <SvgIcons svg="cart" />
            </a-badge>
          </b-button>
        </b-col>
      </b-row>
    </b-container>
    <div>
      <a-modal v-model="showGallary" :centered="true" title="" 
        :footer="null" class="position-relative" 
        :bodyStyle="{padding: 0}" 
        :width="'100%'">
        <a-carousel arrows dots-class="slick-dots slick-thumb" ref="slick">
          <a slot="customPaging" slot-scope="props">
            <img :src="getImgUrl(props.i)" />
          </a>
          <div v-for="(url, idx) in imageList" :key="`${idx}-gal-item`">
            <img :src="url" class="img-fluid">
          </div>
        </a-carousel>
      </a-modal>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { bahtFormatted, getShortName, renderNumber } from '../../_helpers/index';
import { productService } from '../../_services/product.service'
import SvgIcons from '../icon/SVGIcons.vue';
import NumberInput from '../NumberInput.vue';
import ProductCategoryTag from '../ProductCategoryTag.vue';
// @ts-ignore
import { VclTwitch, VclList, VclCode } from 'vue-content-loading';
import { Modal } from 'ant-design-vue';
import { IUser, ICart, IProduct, EMenuURL } from '../../_types';
import { namespace } from 'vuex-class'
const userModule = namespace('User')

// @ts-ignore
import CoolLightBox from 'vue-cool-lightbox';
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css';

@Component({
  components: {
    SvgIcons,
    VclTwitch,
    VclList,
    VclCode,
    NumberInput,
    ProductCategoryTag,
    CoolLightBox
  },
})
export default class ProductPage extends Vue {
  @userModule.State
  public user!: IUser;

  @userModule.Action
  public updateCart!: (productWithAmount: string) => void;

  private menuURL = EMenuURL;
  private productId: string = '';
  private product: IProduct|null = null;
  private variants: any[] = [];
  private models: any[] = [];
  private store: any|null = null;
  private minWidth: string = '107%';
  private isLoading: boolean = true;
  private amount: number = 1;
  private ableToPurchase: boolean = true;
  private purchaseHistory: any|null = null;
  private timeOut: any = null;

  private getShortName = getShortName;
  private renderNumber = renderNumber;

  private showGallary: boolean = false;
  private showVaraintError: boolean = false;
  private imageList: string[] = [];
  private currentImageIdx: number = 0;

  private variantTop: string = '150px';
  private currentSelectedVariant: string = '';
  private selectedFirstVariant: string = '';
  private selectedVariationQty: string = '';
  private selectedVariationPrice: string = '';
  private selectedModel: any = null;

  private selectedVariation = {
    primary: '',
    secondary: ''
  }

  data() {
  return {
  index: null
  }
  }
  

  created() {
    window.addEventListener("resize", this.onResize);
    this.productId = this.$route.params.productId;
    if(!this.product){
      this.fetchProduct();
    }

  }

  mounted() {
    //const app = document.getElementById('app');
    //app!.style.marginBottom = '0';
  }

  validateModelVariation(){
    //const currentSelected = [...Object.values(this.selectedVariation)].join(',');
    //return this.models.some(ele=>ele.name==currentSelected && ele.quantity);
    const currentSelectedList = [...Object.values(this.selectedVariation)];
    return this.models.some(ele=>ele.option_list.every((val: string) => currentSelectedList.includes(val)));
  }

  setSelectedVariationQtyAndPrice(){
    const currentSelectedList = [...Object.values(this.selectedVariation)];
    this.selectedModel = {
      ...this.selectedModel, 
      ...this.models.find(ele=>ele.option_list.every((val: string) => currentSelectedList.includes(val)))
    }
    if(!this.selectedModel) {
      this.selectedVariationQty = '';
      this.selectedVariationPrice = '';
    }else{
      this.selectedVariationQty = this.selectedModel.quantity;
      this.selectedVariationPrice = `${this.selectedModel.price || ''}`;
      //console.log('selectedModel', this.selectedModel, this.product);
    }
  }

  setCurrentImageSlidePosition() {

    const imageUrl = this.variants.map((variant: any) => {
      const selectedOption = variant.options.find((option: any) => option.value == this.currentSelectedVariant);
      return selectedOption? selectedOption.image: null;
    }).find((result: any)=>!!result)
    if(imageUrl){
      this.currentImageIdx = this.imageList.findIndex(ele=>ele===imageUrl);
      // @ts-ignore
      this.$refs.imageSlick.goTo(this.currentImageIdx, true);
      if(this.selectedModel){
        this.selectedModel = {...this.selectedModel, image: imageUrl};
      }
    }
  }

  onClickVariant(e: any, idx: number){
    // @ts-ignore
    const value = e.target.value;
    this.currentSelectedVariant = value;
    if(!idx){ //primary
      this.selectedFirstVariant = value;
      this.selectedVariation.primary = value;
      this.setStock();
    }else{
      this.selectedVariation.secondary = value;
    }
    if(this.validateModelVariation()){
      this.toggleVariantError(false);
    }
    this.setSelectedVariationQtyAndPrice();
    this.setCurrentImageSlidePosition();
    //console.log('onClickVariant', this.selectedVariation, this.selectedModel);
  }

  setStock(){
    if(!this.variants || !this.variants.length) return;
    const tmp = [...this.variants];
    tmp.forEach(ele => {
      const options = ele.options;
      // @ts-ignore
      options.forEach((option, idx, arr) => {
        //const label = option.label;
        const value = option.value;
        const mod = !this.selectedFirstVariant ? 
          this.models.find(model=>model.option_list.includes(value) && model.quantity):
          this.models.find(model=>model.option_list.includes(value) && model.option_list.includes(this.selectedFirstVariant))
        //console.log('mod', mod, value, option.label);
        if(mod) arr[idx] = {...option, quantity: +mod.quantity}
      });
    });
    this.variants = [...tmp];
  }

  fetchProduct() {
    this.isLoading = true;
    if(this.timeOut) {
      clearTimeout(this.timeOut);
    }

    productService.get(this.productId)
    .then((result: any)=>{
      console.log('product: ', result);
      this.product = result;
      this.store = {
        name: 'Shop Name',
        logo: '',
        address: 'Lorem address',
        id: 1
      };
      if(result && result.store) {
        this.store = {...this.store, ...result.store};
      }
      if(this.product){
        if(this.product.image){
          this.imageList.push(this.product.image);
        }
        if(this.product.images){
          this.imageList = [...this.imageList, ...this.product.images];
        }
        // for(let i = 1; i <=2; i++) {
        //   const _id = new Date().getMinutes() * i;
        //   this.imageList.push(`https://picsum.photos/id/${_id}/600`);
        // }
      }
      this.variants = result? result.variants: null;/*[
        {
          name: 'สี',
          options: [
            {label: 'แดง', value: '0', image: `https://picsum.photos/600`},
            {label: 'เหลือง', value: '1', image: `https://picsum.photos/600`}
          ]
        },
        {
          name: 'ขนาด',
          options: [
            {label: 'S', value: 's'},
            {label: 'M', value: 'm'},
            {label: 'L', value: 'l'}
          ]
        }
      ],*/
      if(this.variants){
        this.variants = this.variants.map((ele: any)=>{
            // @ts-ignore
            ele.options = ele.options.sort((a,b) => (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0))
            return ele;
          });
      }
      this.models = result ? result.models: null;

      this.timeOut = setTimeout(()=>{
        window.dispatchEvent(new Event('resize'));
        this.isLoading = false;
        this.setStock();
      }, 200);
    })
  }

  onChangeSlider(a: any, b: any, c: any) {
    //console.log(a, b, c);
    this.currentImageIdx = Number(a);
  }

  onResize(e: any) {
    this.minWidth = e.target.outerWidth + 'px';
  }

  onNumberChange(num: number) {
    if(!this.getIsSelectedVariation()) {
      this.toggleVariantError(true);
      return;
    }
    this.amount = num;
  }

  getVariantWrapperHeight(){
    // @ts-ignore
    const addToCartWrapper = document.querySelector('.add-to-cart-wrapper').offsetHeight;
    // @ts-ignore
    return document.querySelector('.variants-wrapper').clientHeight + 20//+ addToCartWrapper;
  }

  toggleVariantError(val: boolean) {
    this.showVaraintError = val;
    if(this.timeOut) clearTimeout(this.timeOut);
    this.timeOut = setTimeout(()=>{
      this.variantTop = `-${this.getVariantWrapperHeight()}px`;
    }, 10);
  }

  getIsSelectedVariation(){
    if(this.variants && this.variants.length && !(this.variantTop).includes('-')){
      this.variantTop = `-${this.getVariantWrapperHeight()}px`;
      return false;
    }
    return true;
  }

  onUpdateCart() {

    if(!this.getIsSelectedVariation()) return;
    if(this.variants && this.variants.length && !this.validateModelVariation()){
      this.toggleVariantError(true);
      return;
    }

    this.updateCart(
      JSON.stringify({
        productId: this.productId,
        amount: this.amount,
        limit: this.product!.limit_qty,
        title: this.product!.title,
        image: this.product!.image,
        price: this.selectedModel? this.selectedModel.price: this.product!.price,
        model: this.selectedModel
      })
    );
    // คุณได้ทำการเพิ่มสินค้าไปยังตะกร้าเรียบร้อยแล้ว
    this.$message.success(`อัพเดทตะกร้าสินค้าเรียบร้อยแล้ว`);
    //window.scrollTo(0, 0);
  }

  get price(){
    return bahtFormatted(this.product!.price);
  }

  get totalPrice() {
    const price = this.selectedVariationPrice? +this.selectedVariationPrice: this.product!.price;
    return bahtFormatted(price * this.amount, true);
  }

  get totalCartAmount() {
    return this.user.totalCartAmount;
  }

  get purchaseLimitation() {
    if(!this.product || this.product.limit_qty == 0) return -1;
    if(this.user && this.user.orderProductHistory && this.user.orderProductHistory.length){
      if(!this.purchaseHistory){
        this.purchaseHistory = this.user.orderProductHistory.find((ele: any)=>{
          return ele.id === this.productId
        });
      }
    }
    if(this.purchaseHistory && this.purchaseHistory.quantity_buy){
      this.ableToPurchase = this.purchaseHistory.quantity_buy < this.product.limit_qty;
      const result = this.product.limit_qty - this.purchaseHistory.quantity_buy;
      return result < 0 ? 0: result;
    }
    return this.product.limit_qty;
  }

  getImgUrl(idx: number) {
    return this.imageList[idx];
  }

  destroyed() {
    window.removeEventListener("resize", this.onResize);
  }
}

</script>

<style scoped>
.product-image-wrapper{
  top: -0.49rem;
  left: -15px;
}
.product-info-wrapper{
  margin-top: -15px;
  -moz-margin-top:    -15px;   /* Firefox 1, probably can drop this */
  -webkit-margin-top: -15px;
  border-top: 1px solid white;
  border-top-right-radius: 20px;
  border-top-left-radius: 20px;
  margin-bottom: 80px;
  -moz-margin-bottom:    80px;   /* Firefox 1, probably can drop this */
  -webkit-margin-bottom: 80px;
}
.add-to-cart-wrapper{
  bottom: 0;
  left: 0;
}
.add-to-cart-wrapper .btn.btn-primary{
  height: fit-content;
  padding-top: 0.2rem;
  padding-bottom: 0.3rem;
}
.add-to-cart-wrapper .btn.btn-primary .busket-wrapper{
  font-size: 1.5rem;
}
.ant-carousel .slick-dots-bottom{
  bottom: 6px;
}
.ant-carousel .slick-dots li{
  vertical-align: middle;
}
.full-screen-btn-wrapper{
  background-color: rgba(0, 0, 0, 0.2);
  color: #fff;
  bottom: 33px;
  right: 0;
}
.ant-carousel >>> .slick-slide img {
  /*border: 5px solid #fff;*/
  display: block;
  margin: auto;
  max-width: 100%;
}
.ant-carousel >>> .slick-thumb {
  bottom: -45px;
}
.ant-carousel >>> .slick-thumb li {
  width: 60px;
  height: 45px;
}
.ant-carousel >>> .slick-thumb li img {
  width: 100%;
  height: 100%;
  filter: grayscale(100%);
}
.ant-carousel >>> .slick-thumb li.slick-active img {
  filter: grayscale(0%);
}
.variants-wrapper{
  background-color: white;
  left: 0;
  transition: all .25s ease-in;
}
.ant-radio-button-wrapper:not(:first-child)::before{
  /*width: 0;*/
}
@media(min-width: 576px){
  .product-image-wrapper{
    width: calc(100% + 30px) !important;
  }
}
@media screen and (max-width: 320px){
  .add-to-cart-wrapper{
    font-size: 80%;
  }
  .add-to-cart-wrapper .btn.btn-primary{
    font-size: 100%;
    padding-top: 0.3rem;
  }
  .add-to-cart-wrapper .btn.btn-primary .busket-wrapper{
    font-size: 95%;
  }
}

</style>
