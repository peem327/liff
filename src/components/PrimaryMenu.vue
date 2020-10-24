<template>
  <div class="primary-menu-wrapper fixed-bottom w-100 bg-white">
    <div class="container-fluid px-0 px-md-5">
      <div class="row">
        <div class="offset-lg-3 col-lg-6">
          <div class="container">
            <div class="row">
              <div class="col" v-for="menu in menuList" :key="menu.title">
                <div class="pt-1 pb-2 text-center">
                  <router-link :to="menu.to" >
                    <span class="">
                      <SvgIcons :svg="menu.icon" :style="{fontSize: '1.3em'}" />
                      <span class="small">{{menu.title}}</span>
                    </span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, /*Prop,*/ Vue } from 'vue-property-decorator';
import { EMenuURL } from '../_types';
import SvgIcons from './icon/SVGIcons.vue';
import { namespace } from 'vuex-class'
const userModule = namespace('User');
const storeModule = namespace('Store');

@Component({
  components: {
    SvgIcons
  },
})
export default class PrimaryMenu extends Vue {
  //@Prop() private msg!: string;
  @userModule.State
  public status!: {loggedIn: boolean;}

  @storeModule.State
  public store!: {id:string;logo: string};

  menuList: any[] = [
    { title: 'สินค้า', to: EMenuURL.PRODUCTS, icon: 'product' },
    { title: 'ร้านค้า', to: EMenuURL.STATIONS, icon: 'store' },
    // { title: 'ร้านค้า', to: '/store', icon: 'store', query: {} },
    { title: 'ฉัน', to: EMenuURL.PROFILE, icon: 'account' },
    { title: 'เกี่ยวกับ', to: EMenuURL.ABOUT, icon: 'info' }
  ];

  created() {
    if((this.$route.query && this.$route.query.storeId)|| this.store.id){
        //this.store = this.$route.query.storeId;
        this.menuList.map(ele=>{
          if(ele.icon=='product'){ 
            ele.to = {path: EMenuURL.PRODUCTS, query: {storeId: this.store.id}}
          }
          if(ele.icon=='store'){
            ele.to = {name: 'singleStation', params: {stationId: this.store.id}}
          }
        })
    }else{
      this.menuList.map(ele=>{
        if(ele.icon=='store'){
          ele.to = EMenuURL.STATIONS
        }
      })
    }
  }

  mounted() {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.primary-menu-wrapper{
  -webkit-box-shadow: 0px -1px 6px 1px rgba(0,0,0,0.1);
  -moz-box-shadow: 0px -1px 6px 1px rgba(0,0,0,0.1);
  box-shadow: 0px -1px 6px 1px rgba(0,0,0,0.1);
  z-index: 999;
}
a {
  color: #7B7B7B;
}
a:hover, a.router-link-active{
  color: rgb(54, 180, 1);
  text-decoration: none;
}
.small{
  font-size: 70%;
}

</style>
