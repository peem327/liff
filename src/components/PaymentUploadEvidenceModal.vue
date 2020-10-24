<template>
  <b-modal id="PaymentUploadEvidenceModal" centered hide-header-close hide-footer>
    <template v-slot:modal-header>
      <div class="d-block pt-3">
        <h4>แนบหลักฐานการโอนเงิน</h4>
        <span>หมายเลขสั่งจอง: {{orderId}}</span>
      </div>
    </template>
    <validation-observer ref="observer" v-slot="{ handleSubmit }">
      <a-spin :spinning="spinning" :delay="null">
        <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
          <validation-provider name="SlipFile" :rules="{ required: true }" v-slot="validationContext">
            <b-form-group label="เลือกไฟล์สลิป" label-for="slip-file" label-cols-sm="12">
              <b-form-file
                placeholder="ยังไม่ได้เลือกไฟล์"
                v-model="form.file"
                :state="getValidationState(validationContext)"
                aria-describedby="input-file-live-feedback"
                id="slip-file" class="text-primary"
                name="slip-file"></b-form-file>

              <b-form-invalid-feedback id="input-file-live-feedback">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <!-- <validation-provider name="TransferDate" :rules="{ required: true }" v-slot="validationContext"> -->
            <b-form-group label="วันที่โอน" label-for="input-transfer-date">
              <a-date-picker
                id="input-transfer-date"
                name="input-transfer-date"
                format="DD MMM YYYY"
                v-model="form.transferDate" size="large" />
              <!-- <b-form-input
                id="input-transfer-date"
                name="input-transfer-date"
                v-model="form.transferDate"
                :state="getValidationState(validationContext)"
                aria-describedby="input-transfer-date-live-feedback"></b-form-input> -->

              <!-- <b-form-invalid-feedback id="input-transfer-date-live-feedback">{{ validationContext.errors[0] }}</b-form-invalid-feedback> -->
            </b-form-group>
          <!-- </validation-provider> -->

          <!-- <validation-provider name="TransferTime" :rules="{ required: true }" v-slot="validationContext"> -->
            <b-form-group label="เวลาที่โอน" label-for="input-transfer-time">
              <a-time-picker
                id="input-transfer-time"
                name="input-transfer-time"
                format="HH:mm"
                size="large"
                v-model="form.transferTime"
                aria-describedby="input-transfer-time-live-feedback" />
              <!-- <b-form-input
                id="input-transfer-time"
                name="input-transfer-time"
                v-model="form.transferTime"
                :state="getValidationState(validationContext)"
                aria-describedby="input-transfer-time-live-feedback"></b-form-input> -->

              <!-- <b-form-invalid-feedback id="input-transfer-time-live-feedback">{{ validationContext.errors[0] }}</b-form-invalid-feedback> -->
            </b-form-group>
          <!-- </validation-provider> -->
          <div class="mb-5">
            <b-form-group label="เพิ่มเติม (ถ้ามี)" label-for="input-remark" >
              <b-form-input
                id="input-remark"
                name="input-remark"
                v-model="form.remark"></b-form-input>
            </b-form-group>
          </div>
          <div class="pt-5 mb-4 w-100 d-flex justify-content-between">
            <b-button variant="secondary" size="md" @click="$bvModal.hide('PaymentUploadEvidenceModal')" class="w-100 mr-2">ยกเลิก</b-button>
            <b-button variant="primary" size="md" type="submit" class="w-100 ml-2">ส่งหลักฐาน</b-button>
          </div>
        </b-form>
      </a-spin>
    </validation-observer>
  </b-modal>
</template>

<script lang="ts">
import moment from 'moment';
import 'moment/locale/th';
import { Component, Vue, Emit, Watch, Prop } from 'vue-property-decorator';
import { uploadService, orderService } from '../_services/index';
moment.locale('th');

@Component
export default class PaymentUploadEvidenceModal extends Vue {
  // @ts-ignore
  @Prop({required: true, type: Number}) orderId: number;
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
    //const app = document.getElementById('app');
    //app!.style.marginBottom = '0';
    this.$root.$on('bv::modal::shown', (bvEvent: any, modalId: string) => {
      //console.log('Modal is about to be shown', bvEvent, modalId)
      if("PaymentUploadEvidenceModal" === modalId){
        // @ts-ignore
        const fileBtnlabel = document.querySelector(".custom-file-input:lang(en) ~ .custom-file-label");
        if(fileBtnlabel){
          fileBtnlabel.setAttribute('data-browse', "เลือกไฟล์");
        }
      }
    })
  }

  handleModalCancel(){

  }
  // @ts-ignore
  getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
  }

  @Watch('orderId')
  orderIdChanged(newVal: number) {
      console.log('orderIdChanged', newVal);
  }

  onSubmit() {
    this.spinning = true;
    uploadService.attatchSlip(this.form.file)
    .then((result: any)=>{
      if(result && result.image_id){
        const payload = {
          slip_id: result.image_id as string,
          comment: this.form.remark as any,
          transfer_date: this.form.transferDate.format('YYYY-MM-DD'),
          transfer_time: this.form.transferTime.format('HH:mm:ss')
        }
        return orderService.attatchEvidence(`${this.orderId}`, payload);
      }
    }).then((result: any)=> {
      console.log('notify: ', result);
      if(result && result.user_message){
        return this.$message.success(`${result.user_message}`, 3, ()=>{
          this.$bvModal.hide('PaymentUploadEvidenceModal');
        });
      }
      this.$message.error('Something went wrong!');
      console.log(result);
    }).finally(()=>{
      this.spinning = false;
    })
  }

}

</script>

<style scoped>

</style>
