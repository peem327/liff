<template>
  <b-modal id="PaymentMethodsModal" centered hide-header-close hide-footer>
    <template v-slot:modal-header>
      <div class="d-block pt-3">
        <h4>เลือกช่องทางการชำระเงิน</h4>
      </div>
    </template>
    <a-spin :spinning="spinning" :delay="null">
      <div class="pt-5 mb-4 w-100 d-flex justify-content-between">
        <b-button variant="secondary" size="md" @click="$bvModal.hide('PaymentMethodsModal')" class="w-100 mr-2">ยกเลิก</b-button>
        <b-button variant="primary" size="md" type="submit" class="w-100 ml-2">ยืนยัน</b-button>
      </div>
    </a-spin>
  </b-modal>
</template>

<script lang="ts">
import moment from 'moment';
import 'moment/locale/th';
import { Component, Vue, Emit, Watch, Prop } from 'vue-property-decorator';
import { uploadService, orderService } from '../_services/index';
moment.locale('th');

@Component
export default class PaymentMethodsModal extends Vue {
  // @ts-ignore
  @Prop({required: true, type: Number}) storeId: number;
  private spinning: boolean = false;
  private now = new Date();
  private form = {
    file: null,
    transferDate: moment(this.now, 'DD MMM YYYY'),
    transferTime: moment(this.now, 'HH:mm'),
    remark: null,
  }


  get moment() {
    return moment;
  }

  created() {
    // @ts-ignore
    //document.querySelector(".custom-file-input:lang(en) ~ .custom-file-label").setAttribute('data-browse', "เลือกไฟล์");
  }

  mounted() {
    this.$root.$on('bv::modal::shown', (bvEvent: any, modalId: string) => {
      //console.log('Modal is about to be shown', bvEvent, modalId)
    })
  }

  handleModalCancel(){

  }
  // @ts-ignore
  getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
  }

  @Watch('storeId')
  storeIdChanged(newVal: number) {
    console.log('storeIdChanged', newVal);
  }

  onSubmit() {
    this.spinning = true;

    return this.$message.success(`done`, 3, ()=>{
      this.$bvModal.hide('PaymentMethodsModal');
    });
    //this.$message.error('Something went wrong!');
    //this.spinning = false;
  }

}

</script>

<style scoped>

</style>
