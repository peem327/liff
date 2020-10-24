<template>
    <div>
        <b-container class="px-0">
            <b-row align-v="center" class="my-3">
                <b-col>
                    <b-button variant="link" @click="$router.go(-1)" class="text-dark-grey">
                        <SvgIcons svg="leftArrow" />
                    </b-button>
                </b-col>
            </b-row>
        </b-container>
        <b-container>
            <div class="d-flex align-items-center justify-content-between mb-4">
                <h2 class="mb-0">ตะกร้าสินค้า</h2>
                <a-popconfirm v-if="products && products.length"
                        title="ยืนยันลบสินค้าทั้งหมด ?"
                        @confirm="clearCart()"
                        @cancel="cancelDelete"
                        okText="ตกลง"
                        cancelText="ยกเลิก"
                        placement="left">
                        <span class="cursor-pointer text-danger" style="line-height: 1;">ลบทั้งหมด</span>
                </a-popconfirm>
            </div>
            <b-row v-if="!products && !isEmpty">
                <b-col cols="12" v-for="n in [1, 2, 3, 4, 5]" :key="n" class="mb-5">
                    <vcl-facebook></vcl-facebook>
                </b-col>
            </b-row>
            <b-row v-if="products && isEmpty">
                <b-col cols="12" class="mb-5">
                    <a-empty description="ไม่พบข้อมูล" />
                </b-col>
            </b-row>
            <b-row v-if="products">
                <b-col cols="12" v-for="product in products" 
                    :key="`${product.productId}${product.model? '-'+product.model.id: ''}`" class="mb-4">
                    <!-- <pre>{{product|json}}</pre> -->
                    <div class="row align-items-start border border-light py-2 rounded box-shadow">
                        <div class="col-3 px-2">
                            <img class="img-fluid rounded-lg" 
                                :src="product.model? product.model.image||product.image: product.image" />    
                        </div>
                        <div class="col-9 pl-1">
                            <div class="d-flex justify-content-between mb-2">
                                <p class="font-weight-medium mt-0 mb-0 text-truncated" style="line-height: 1.3;">
                                    {{product.title}}
                                </p>
                                <a-popconfirm
                                        title="ยืนยันลบสินค้า ?"
                                        @confirm="confirmDelete(product.productId, product.model)"
                                        @cancel="cancelDelete"
                                        okText="ตกลง"
                                        cancelText="ยกเลิก"
                                        placement="left">
                                        <span class="cursor-pointer text-danger" style="line-height: 1;"><SvgIcons svg="bin" /></span>
                                </a-popconfirm>
                            </div>
                            <p class="small text-grey text-nowrap mb-1" v-if="product.model">{{product.model.name}}</p>
                            <p class="text-primary text-nowrap" v-html="renderPrice(product.price)"></p>
                            <div class="d-flex justify-content-between align-items-center">
                                <NumberInput 
                                    :id="`${product.productId}${product.model? '-'+product.model.id: ''}`" 
                                    :current="product.amount" 
                                    :limit="product.limit" 
                                    v-on:change="onNumberChange" class="" /> 
                                <span class="text-primary text-nowrap" v-html="renderPrice(product.price, product.amount)"></span>
                            </div>
                        </div>
                        <!-- <router-link :to="menuURL.PRODUCT+`/${product.id}`" class="position-absolute w-100 h-100"></router-link> -->
                    </div>
                </b-col>
            </b-row>
        </b-container>
        <div class="choose-station-wrapper px-2 pt-2 pb-3 bg-white border-top w-100 position-fixed">
            <div class="container">
                <div class="row">
                    <div class="offset-lg-3 col-lg-6 px-2">
                        <div class="d-flex justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="text-grey mr-2">รวม</span>
                                <span class="text-primary total-price">{{totalPrice}}</span>
                            </div>
                            <b-button class="mt-1" variant="primary" @click="handleClickPrimary">
                                <div class="d-flex align-items-center">
                                    <!-- <span style="font-size: 1.2rem;"><SvgIcons svg="placePin" class="mr-2" /></span> -->
                                    <span v-if="selectedStationState.stationId || store.id" class="">สั่งจอง</span>
                                    <span v-if="!selectedStationState.stationId && !store.id" class="d-flex">
                                        <SvgIcons svg="placePin" class="mr-2" />เลือกสถานที่
                                    </span>
                                </div>
                            </b-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { productService } from '../../_services/product.service';
import { EMenuURL, IUser } from '../../_types';
import { bahtFormatted } from '../../_helpers/index';
import SvgIcons from '../icon/SVGIcons.vue';
import NumberInput from '../NumberInput.vue';
// @ts-ignore
import { VclFacebook } from 'vue-content-loading';
import { namespace } from 'vuex-class';
const userModule = namespace('User');
const storeModule = namespace('Store');

@Component({
  components: {
    SvgIcons,
    VclFacebook,
    NumberInput
  },
})
export default class CartPage extends Vue {
    @userModule.State
    public user!: IUser;

    @userModule.State
    public selectedStationState!: {stationId: string, provinceId: string, districtId: string};

    @userModule.Action
    public updateCart!: (productWithAmount: string) => void;
    @userModule.Action
    public clearCart!: () => void;

    @storeModule.State
    public store!: {id: string; logo: string};

    private isEmpty: boolean = false;
    private productList: null|any[] = null;

    private menuURL = EMenuURL;
    
    get products() {
        const cart = this.user.cart;
        if(!cart || !cart.length){
            this.isEmpty = true;
        }
        return this.user.cart;
    }

    get totalCartAmount() {
        return this.user.totalCartAmount
    }

    get totalPrice() {
        return bahtFormatted(this.user.cart.reduce((a, b)=>{
            return a + (b['amount'] * b['price']);
        }, 0));
    }

    renderPrice(price: string, amount: number = 1) {
        return bahtFormatted(+price * amount);
    }

    onNumberChange(newVal: {id: string; amount: number}) {
        let {id, amount} = newVal;
        let modelId = '';
        if(id.includes('-')){
            const tmp = id.split('-');
            id = tmp[0];
            modelId = tmp[1];
        }
        const product = this.user.cart.find((ele)=>{
            if(modelId) return ele.model.id == modelId;
            return ele.productId == id
        })
        this.updateCart(
            JSON.stringify(
                {
                    productId: id, 
                    amount, 
                    limit: product!.limit, 
                    title: product!.title, 
                    image: product!.image, 
                    price: product!.price,
                    model: product!.model
                }
            )
        );
    }

    confirmDelete(productId: string, model: any) {
        this.updateCart(
            JSON.stringify(
                {productId, amount: 0, model}
            )
        );   
    }

    cancelDelete(e: any) {
        //this.$message.error('Click on No');
    }

    handleClickPrimary() {
        if(this.selectedStationState.stationId || this.store.id){
            this.$router.push({name:'confirmationPage', params: {stationId: this.store.id || this.selectedStationState.stationId}})
        }else{
            this.$router.push(this.menuURL.STATIONS_RESERVATION)
        }
    }

    created() {
        // console.log('CSRR',this.user.cart);
    }

}
</script>
<style scoped>
.choose-station-wrapper{
    bottom: 0;
    left: 0;
    z-index: 999;
}
.total-price{
    font-size: 1.2rem;
}
</style>

