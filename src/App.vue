<template>
  <div id="app">
    <div class="error text-center" v-if="errorBanner && (!$route.path.includes('profile') && !$route.path.includes('about'))">
      <a-alert banner>
        <p slot="message" class="mb-0 d-flex justify-content-center align-items-center">
          <span class="d-inline-block text-truncate " style="max-width: 85%;">{{errorBanner}}</span>
          <a href="#" class="text-primary d-inline-block" @click="showModal()">&nbsp;เพิ่มเติม</a>
        </p>
      </a-alert>
      <b-modal id="alertContent" scrollable :lazy="true" title="" ok-only ok-title="ปิด" hide-header-close @ok="handleModalOk">
          <p style="white-space: pre-wrap;" v-html="alertContentHTML"></p>
      </b-modal>
    </div>
    <div class="container pt-2 bg-white">
      <div class="row bg-white">
        <div class="offset-lg-3 col-lg-6">
          <!-- <img alt="Vue logo" src="@/assets/logo.png"> -->
          <router-view></router-view>
        </div>
      </div>
    </div>
    <PrimaryMenu
      v-if="!privatePath.includes($route.path) &&
      !$route.path.includes('/product/') &&
      !$route.path.includes('/store/') &&
      !$route.path.includes('/stations/reserve') &&
      !$route.path.includes('/order/')"
       />
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';
import { masterService, orderService, userService } from './_services';
import { initializeLiff } from './_helpers';
import PrimaryMenu from './components/PrimaryMenu.vue';
import { EMenuURL } from './_types';
import { namespace } from 'vuex-class';
const userModule = namespace('User');
const LIFF = window.liff;
@Component({
  components: {
    PrimaryMenu,
  },
})
export default class App extends Vue {
  private privatePath = [
    EMenuURL.CONFIRMATION, EMenuURL.CART, EMenuURL.LOGIN, EMenuURL.REGISTER, EMenuURL.ABOUT
  ]

  @userModule.State
  public clientAccessToken!: string;

  @userModule.Action
  public getClientAccessToken!: () => void
  @userModule.Action
  public setProfile!: (redirect?: any)=>void;

  errorBanner = '';
  alertContentHTML = `โค้กซี้ฟอร์มอิออน งี้คำสาปไฟต์ สึนามิ เอนทรานซ์มิวสิคสตรอเบอร์รี เอ็นเตอร์เทนคอลัมนิสต์ชิฟฟอนขั้นตอน บ๊วยคอมเมนต์ แหววมอยส์เจอไรเซอร์เอ็กซ์โป สแล็กดาวน์ซาตานอ่อนด้อยเปเปอร์ ฮาร์ดกับดัก สเกตช์ อาข่าอิสรชนน็อก อินดอร์ สตรอว์เบอร์รี แม่ค้าโอ้ย ชะโนดปาสกาลนางแบบแกงค์ โอยัวะ

แตงโมลีกบ๊อบ เรซินช็อปปิ้งมายองเนสศากยบุตรฟีเวอร์ สามช่าไอซียูโฮปคลาสสิกคอลัมน์ คาเฟ่โอวัลติน ปาสกาลจิ๊กเซอร์โหลยโท่ย ไมค์พาร์ตเนอร์ซี้ท็อปบูตอพาร์ตเมนท์ เพลซสังโฆซาร์ อพาร์ทเมนท์สปาย สี่แยกวัจนะออสซี่ ฮิปโปวอลนัตเฟอร์นิเจอร์แรลลี วาริชศาสตร์บอมบ์ป๊อกแมกกาซีนกรุ๊ป หน่อมแน้ม เมเปิลแดนเซอร์พูลฮองเฮา เลสเบี้ยน เลคเชอร์ชีสว้อยไตรมาสเฝอ ไฟลท์แชมปิยองเทปพลาซ่าอาร์ติสต์

ฮาร์ดฟลุคแดนซ์ปัจฉิมนิเทศบิล เวิร์กช็อปลีเมอร์โปรดิวเซอร์แป๋วฮิปโป คาร์โอเพ่นสเปคเอเซียเวิร์ก แยมโรล ตอกย้ำเกรด เลคเชอร์บิล แฮมเบอร์เกอร์อพาร์ตเมนท์ เบอร์รีแชมพู เท็กซ์ดีพาร์ตเมนต์คอมเมนต์ตาปรือ เดี้ยงคอร์รัปชันตี๋ราชบัณฑิตยสถาน แชมพูคอมเพล็กซ์เทค เดอะเวอร์ ธุรกรรม บอยคอตต์โปลิศคีตปฏิภาณอีโรติก เรซินโอ้ยพงษ์เมจิค แฟลชแซ็กเอ็นเตอร์เทน`;

  beforeCreated() {

  }

  async created() {
    if(!('localStorage' in window)){
      alert('Your browser does not support.');
    }
    const queryParam = this.$route.query;
    if(queryParam && 'liffId' in queryParam){
      const liffId = queryParam.liffId as string;
      console.log('liff id is ', liffId);
      let lineToken = await initializeLiff(liffId) as string;
      //lineToken = '8uYquBhWRX19Igmspk392er9ojZtqv7iyLjBc7u2tH92Dkq5mEJx7VGugO1ttNIRNcqYDOHlG1VMWAsdXkLUQQse8-OZ1SHbFVNxdo1v26lKIsLbry3LD-HCZxiwoXHO.zxvhiJd1gepkDFG-yomv17B4FDZ9xgtMzBzHKsmiLv4';
      if(lineToken){
        await this.loginWithLINE(lineToken);
      }
    }
    // console.log('onCreated', this.clientAccessToken);
    // if(!this.clientAccessToken){
    //   this.getClientAccessToken()
    // }
    orderService.getCheckoutStatus()
    .then((res: any)=>{
      if(!res.available){
        this.errorBanner = res.message;
        if(res.popup_message){
          this.alertContentHTML = res.popup_message;
        }
      }
    })
  }

  mounted() {
    if(!this.clientAccessToken){
      this.getClientAccessToken()
    }
  }

  showModal(){
    this.$bvModal.show('alertContent');
  }

  handleModalOk(){

  }

  loginWithLINE(token: string) {
    userService.lineLogin(token)
    .then((res: any)=>{
      if(res){
        console.info(`LINE Login result:`, res);
        this.setProfile();
      }
    })
    .catch((err: any)=>{
      console.log('LINE Login error:', err);
    })
  }
}
</script>

<style>
#app {

}
#app > .container{
  padding-bottom: 65px;
  min-height: 100vh;
}

</style>
