<template>
  <div class="position-relative" style="margin-top: -1px;">
    <div v-if="!isLoading" class="profile-wrapper position-absolute" :style="{width: minWidth}">
      <a @click="showLogoutConfirm" class="text-white pt-2 pr-3 logout-wrapper position-absolute">
        <span class="small font-weight-light">ออกจากระบบ</span> <b-icon-box-arrow-right></b-icon-box-arrow-right>
      </a>
      <div class="vh-50 bg-primary container">
        <div class="d-flex h-100 align-items-center">
          <div v-if="profile" class="w-100 text-center text-white">
            <p class="font-weight-bold"><a-avatar size="large">{{firstCharName}}</a-avatar></p>
            <h4 class="text-white">{{profile.name}}</h4>
            <p class="small d-flex justify-content-center font-weight-light">
              <SvgIcons svg="phone" class="mr-1" />{{profile.telephone}}
            </p>
          </div>
        </div>
      </div>
      <div class="profile-info-wrapper w-100 bg-white pt-4 position-absolute">
        <b-container>
          <h5 class="mb-4">ประวัติการจอง</h5>
          <div v-if="!orders.length">
            <p class="text-center small text-grey">ยังไม่มีข้อมูล</p>
            <div class="form-group">
              <button class="btn btn-outline-primary w-100" @click="$router.push(menuURL.PRODUCTS)">
                เลือกสินค้าที่คุณต้องการ
              </button>
            </div>
            <div class="form-group">
              <button class="btn btn-outline-primary w-100" @click="$router.push(menuURL.STATIONS)">
                ค้นหาสาขาใกล้ตัวคุณ
              </button>
            </div>
          </div>
          <div class="orders-wrapper" v-if="orders.length">
            <div v-for="order in orders" :key="order.id" class="mb-4">
              <div class="d-flex align-items-start border border-light pt-3 py-2 rounded box-shadow position-relative">
                <div class="col-8 px-2 px-md-4">
                  <p class="font-weight-bold mb-0">หมายเลขสั่งจอง: {{order.order_no}}</p>
                  <p class="text-grey small font-weight-light">สถานที่บริการ {{order.store_name}}</p>
                  <div v-if="order.shipping_code !== 'store_delivery'" class="text-grey small">
                    <p class="mb-1">รับสินค้า:</p>
                    <p class="mb-0">{{order.receive_date}}</p>
                  </div>
                  <div v-if="order.shipping_code === 'store_delivery'" class="text-grey small">
                    <p class="mb-1">{{order.shipping_method}}</p>
                  </div>
                </div>
                <div class="col-4 pl-1 pr-2 pr-md-4 pl-md-4 text-right">
                  <div class="d-flex flex-column justify-content-between">
                    <div class="text-nowrap">
                      <b-button v-if="order.status === 'รอรับสินค้า'" variant="warning" disabled>รอรับสินค้า</b-button>
                      <b-button v-if="order.status === 'รับสินค้าแล้ว'" variant="outline-success" disabled>รับสินค้าแล้ว</b-button>
                      <b-button v-if="order.status.includes('ยกเลิก')" variant="outline-danger" disabled>ยกเลิกแล้ว</b-button>
                      <b-button v-if="order.status === 'เกินกำหนดรับสินค้า'" variant="outline-danger" disabled>เกินกำหนด</b-button>
                    </div>
                  </div>
                </div>
                <router-link class="position-absolute w-100 h-100" :to="`/order/${order.id}`"></router-link>
                <div class="payment-notify-wrapper position-absolute">
                  <b-button v-if="order && order.payment_method && !order.payment_notify" variant="link" @click="handleOpenUploadModal(order.id)">แจ้งชำระเงิน</b-button>
                  <b-button v-if="order && order.payment_notify && order.link_payment_notify" variant="link" @click="previewPaymentEvidence(order.id)">ข้อมูลชำระเงิน</b-button>
                </div>
              </div>
            </div>
            <hr />
          </div>
        </b-container>
        <p class="about-btn text-center font-weight-light position-absolute d-none">
          <router-link :to="menuURL.ABOUT">
            <b-button variant="outline-primary" style="border-radius:20px;">
              <b-icon-info-circle />&nbsp;<span class="small">เกี่ยวกับ</span>
            </b-button>
          </router-link>
        </p>
      </div>

    </div>

    <div v-if="isLoading" class="profile-wrapper position-absolute py-2 pl-3 pr-3" :style="{width: minWidth}">
      <vcl-twitch class="mb-5"></vcl-twitch>
      <vcl-list class="mb-5"></vcl-list>
      <vcl-code></vcl-code>
    </div>
    <PaymentUploadEvidenceModal :orderId="currentOrderId" />
    <b-modal id="PaymentEvidenceModal" centered hide-footer>
      <template v-slot:modal-header>
        <div class="d-block pt-3">
          <h4>หลักฐานการโอนเงิน</h4>
          <span>หมายเลขสั่งจอง: {{orderPayment.order_no}}</span>
        </div>
      </template>
      <div v-if="orderPayment">
        <h5>วันและเวลาที่โอน</h5>
        <p class="text-grey">
          {{`${orderPayment.date} ${orderPayment.time}`}}
        </p>
        <p>
          <img class="img-fluid" :src="'data:image/*;base64, '+orderPayment.slip" />
        </p>
        <h5 v-if="orderPayment.comment">เพิ่มเติม</h5>
        <p v-if="orderPayment.comment">
          {{orderPayment.comment}}
        </p>
        <p>
          <a-button type="primary" @click="handleClosePreview">
            ปิด
          </a-button>
        </p>
      </div>
    </b-modal>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { bahtFormatted } from '../../_helpers/index';
import { productService, orderService } from '../../_services'
import SvgIcons from '../icon/SVGIcons.vue';
import NumberInput from '../NumberInput.vue';
import PaymentUploadEvidenceModal from '../PaymentUploadEvidenceModal.vue';
// @ts-ignore
import { VclTwitch, VclList, VclCode } from 'vue-content-loading';
import { IUser, ICart, IProduct, EMenuURL } from '../../_types';
import { namespace } from 'vuex-class'
const userModule = namespace('User')
@Component({
  components: {
    SvgIcons,
    VclTwitch,
    VclList,
    VclCode,
    NumberInput,
    PaymentUploadEvidenceModal
  },
})
export default class ProfilePage extends Vue {
  @userModule.State
  public status!: {loggedIn: boolean};

  @userModule.State
  public user!: IUser;

  @userModule.Action
  public setProfile!: (redirect?: any)=>void;

  @userModule.Action
  public logout!: () => void;

  //private profile: any;
  private orders: any[] = [];
  private menuURL = EMenuURL;
  private minWidth: string = '107%';
  private isLoading: boolean = true;

  currentOrderId: number = 0;
  orderPayment: any = null;

  @Watch('status')
  onStatusChanged(){
    if(this.status && !this.status.loggedIn){
      this.$router.push(this.menuURL.PRODUCTS);
    }
  }

  get profile(){
    return this.user.profile;
  }

  /*get order() {
    return this.orders.find((order: any)=>order.)
  }*/

  created() {
    // @ts-ignore
    window.addEventListener("resize", this.onResize);
    this.setProfile();

    setTimeout(()=>{
      //this.profile = this.user.profile;
      this.orders = [...this.user.order || []];
      window.dispatchEvent(new Event('resize'));
      this.isLoading = false;
    }, 500)
  }

  mounted() {
    //const app = document.getElementById('app');
    //app!.style.marginBottom = '0';
    //console.log('USER:', this.user);
  }

  updated(){
    console.log('USER:', this.user);
  }

  get firstCharName() {
    if(!this.profile) return '';
    const name = this.profile.name.split(" ");
    let first = name[0].charAt(0);
    let last = name[name.length-1]? name[name.length-1].charAt(0): "";
    return first+last;
  }

  handleOpenUploadModal(orderId: string) {
    this.currentOrderId = +orderId;
    const _self = this;
    setTimeout(()=>{
      _self.$bvModal.show('PaymentUploadEvidenceModal');
    }, 0);
  }

  showLogoutConfirm(){
    const _self = this;
    this.$confirm({
      centered: true,
      title: 'ต้องการออกจากระบบใช่หรือไม่ ?',
      okText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      onOk() {
        _self.logout();
      },
      onCancel() {
      },
      class: 'confirm-logout-wrapper',
    });
  }

  onResize(e: any) {
    this.minWidth = e.target.outerWidth + 'px';
  }

  previewPaymentEvidence(orderId: any) {
    orderService.getPaymentEvidence(orderId)
    .then((result: any)=>{
      this.orderPayment = result;
      setTimeout(()=>{
        this.$bvModal.show('PaymentEvidenceModal');
      }, 0);
    })
  }

  handleClosePreview() {
    this.$bvModal.hide('PaymentEvidenceModal');
  }

  get totalCartAmount() {
    return this.user.totalCartAmount;
  }

  destroyed() {
    window.removeEventListener("resize", this.onResize);
  }
}

</script>

<style scoped>
.logout-wrapper{
  right: 0;
  font-size: 1.5rem;
}
.logout-wrapper > span{
  font-size: 50%;
  vertical-align: 5px;
}
.profile-wrapper{
  top: -0.45rem;
  left: -15px;
}
.profile-info-wrapper{
  margin-top: -15px;
  border-top: 1px solid white;
  border-top-right-radius: 20px;
  border-top-left-radius: 20px;
  /*margin-bottom: 80px;*/
  height: 52vh;

}
.vh-50{
  height: 40vh;
}
.ant-avatar-lg{
  width: 80px;
  height: 80px;
  border: 3px solid;
}
.ant-avatar .ant-avatar-string{
  transform: scale(1), translateX(-50%), translateY(40%) !important;
  font-size: 2rem !important;
}
.btn.w-100{
  border-radius: 2rem;
}
.orders-wrapper{
  height: 32vh;
  margin-bottom: 2rem;
  overflow-y: scroll;
  overflow-x: hidden;
}
.orders-wrapper .btn{
  opacity: 1;
  font-size: 80%;
}
.orders-wrapper .btn-warning{
  border-radius: 2rem;
  background-color: rgba(255, 185, 23, 0.2);
  border-color: transparent;
  color: #FFB917;
  padding-right: 1.5em;
  padding-left: 1.5em;
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
}
.orders-wrapper .btn-outline-success{
  border: none;
  padding-right: 1em;
  padding-left: 1em;
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
  color: #1FA729;
}
.orders-wrapper .btn-outline-danger{
  border: none;
}
.about-btn{
  bottom: 0;
  width: 100%;
  left: 0;
}
.payment-notify-wrapper {
  bottom: 10px;
  right: 15px;
  z-index: 9;
}
@media(min-width: 576px){
  .profile-wrapper{
    width: calc(100% + 30px) !important;
  }
}

</style>
