<template>
    <!-- <div id="login" :style="{ backgroundImage: 'url(' + require('@/assets/login-bg.png') + ')' }" class="mt-n2 mx-n3" > -->
    <div id="login" class="mt-n2 mx-n3" >
        <b-container class="pt-3">
            <b-row align-v="center" class="mb-3">
                <b-col>
                    <b-button variant="link" @click="$router.go(-1)" class="text-dark-grey">
                        <SvgIcons svg="leftArrow" />
                    </b-button>
                </b-col>
            </b-row>
        </b-container>
        <b-container class="content-100vh">
            <div class="d-flex flex-column align-items-center justify-content-center">
                <p class="mb-4 text-center">
                    <img v-if="store.logo" :src="store.logo" style="max-width: 50%;" />
                </p>
                <h3 class="mb-4">{{title}}</h3>
                <form v-on:submit.prevent="handleSubmit" autocomplete="off">
                    <div class="form-group position-relative">
                        <label class="sr-only" for="firstName">ชื่อ</label>
                        <input type="text" v-model="firstName" name="firstName" class="pl-3 form-control font-weight-light" :class="{ 'is-invalid': submitted && !firstName }" placeholder="ชื่อ*" />
                        <div v-show="submitted && !firstName" class="invalid-feedback">กรุณาระบุ</div>
                    </div>
                    <div class="form-group position-relative">
                        <label class="sr-only" for="lastName">นามสกุล</label>
                        <input type="text" v-model="lastName" name="lastName" class="pl-3 form-control font-weight-light" placeholder="นามสกุล" />
                    </div>
                    <!-- <div class="form-group position-relative">
                        <label class="sr-only" for="company">เลือกบริษัท</label>
                        <b-form-select class="form-control pl-3 font-weight-light"
                            v-model="company" :options="companyOptions"></b-form-select>
                    </div> -->
                    <div class="form-group position-relative">
                        <label class="sr-only" for="identityId">หมายเลขบัตรประชาชน</label>
                        <input type="number" v-model="identityId" name="identityId" class="pl-3 form-control font-weight-light" :class="{ 'is-invalid': submitted && !identityId || submitted && identityId.length != 13 }" placeholder="หมายเลขบัตรประชาชน*" />
                        <div v-show="submitted && !identityId" class="invalid-feedback">กรุณาระบุ</div>
                        <div v-show="submitted && identityId && identityId.length != 13" class="invalid-feedback">ตรวจสอบ</div>
                    </div>
                    <div class="form-group position-relative">
                        <label class="sr-only" for="mobile">เบอร์โทรศัพท์</label>
                        <input type="number" v-model="mobile" name="mobile" class="pl-3 form-control font-weight-light" :class="{ 'is-invalid': submitted && !mobile || submitted && mobile.length != 10 }" placeholder="เบอร์โทรศัพท์*" />
                        <div v-show="submitted && !mobile" class="invalid-feedback">กรุณาระบุ</div> <!-- เบอร์โทรศัพท์ -->
                        <div v-show="submitted && mobile && mobile.length != 10" class="invalid-feedback">ตรวจสอบ</div>
                    </div>
                    <div class="form-group">
                        <b-form-checkbox
                          id="agree"
                          v-model="agree"
                          name="agree"
                          :value="true"
                          :unchecked-value="false" :state="submitted ? agree: null"
                        >
                          <span class="text-nowrap small">ฉันยอมรับข้อตกลงใน<a href="#" class="text-primary" @click="showModal()">นโยบายความเป็นส่วนตัว</a></span>
                        </b-form-checkbox>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="w-100 btn btn-primary" :disabled="submitting">
                            <span v-show="submitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            {{title}}
                        </button>
                    </div>
                    <hr/>
                    <p v-if="!status.loggedIn" class="text-center text-grey">เป็นสมาชิกอยู่แล้ว? <a class="text-primary" @click="$router.push({path: menuURL.LOGIN, query:{...$route.query}})" >คลิกเพื่อเข้าสู่ระบบ</a></p>
                </form>
            </div>
        </b-container>
        <b-modal id="termsOfUse" scrollable :lazy="true" title="นโยบายความเป็นส่วนตัว" ok-only ok-title="ปิด" hide-header-close @ok="handleModalOk">
            <p style="white-space: pre-wrap;" v-html="termsOfUseHTML"></p>
        </b-modal>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { IRegisterPayload, EMenuURL } from '../../_types';
import { userService, masterService } from '../../_services';
import SvgIcons from '../icon/SVGIcons.vue';
import { namespace } from 'vuex-class';
const userModule = namespace('User');
const storeModule = namespace('Store');

@Component({
    components: {
        SvgIcons
    }
})
export default class RegisterPage extends Vue {
    @userModule.State
    public user!: any;
    @userModule.State
    public status!: {loggedIn: boolean; registering: boolean}

    @storeModule.State
    public store!: {id:string;logo: string};

    //@userModule.State public name!: string
    firstName: string = '';
    lastName: string = '';
    company: string|null = null;
    identityId: string = '';
    mobile: string = '';
    termId: string = '';
    termsOfUse: string = '';
    agree: boolean = false;
    submitted: boolean = false;
    submitting: boolean = false;
    private menuURL = EMenuURL;
    companyOptions: any[] = [
        { value: null, text: 'เลือกบริษัท' }
    ];
    mounted() {

        const body = document.getElementsByTagName('body')[0];
        // @ts-ignore
        body.classList.add('register');
    }

    created() {
        const body = document.getElementsByTagName('body')[0];
        // @ts-ignore
        body.classList.add('register');
        Promise.all([this.getTermsOfUse(), this.getCompanyList()])
    }

    destroyed() {
        const body = document.getElementsByTagName('body')[0];
        // @ts-ignore
        body.classList.remove('register');
    }
    handleModalOk(){

    }

    getTermsOfUse() {
        masterService.getTermCondition()
        .then((result: any)=>{
            this.termId = result.term_id;
            this.termsOfUse = result.description;
        })
    }

    getCompanyList() {
        masterService.getCompanies()
        .then((result: any)=>{
            const tmp = result.map((ele: string)=>{
                return {value: ele, text: ele};
            })
            this.companyOptions = [...this.companyOptions, ...tmp];
            //console.log('companies', this.companyOptions);
        })
    }

    get title(){
      return this.user && this.user.profile && this.user.profile.required_update? 'อัพเดทข้อมูล': 'ลงทะเบียน';
    }

    get termsOfUseHTML() {
        return this.termsOfUse;
    }

    showModal() {
        this.$bvModal.show('termsOfUse');
    }

    public handleSubmit(e: any): void {
        e.preventDefault();
        this.submitted = true;
        if(!this.identityId || !this.mobile || this.identityId.length < 13 || this.mobile.length < 10 || !this.firstName){
            return;
        }
        if(!this.agree){
            this.$message.error('กรุณายอมรับข้อตกลง')
            return;
        }
        this.submitting = true;
        let payload: IRegisterPayload = {
            identity_id: this.identityId,
            phone_no: this.mobile,
            firstname: this.firstName,
            lastname: this.lastName,
            term_id: Number(this.termId),
        }
        if(this.company){
          payload['company'] = this.company;
        }
        let promise = this.status.loggedIn? userService.updateProfile(payload): userService.register(payload);
        promise
        .then((result: any)=>{
            if(result.success) {
                this.$message.info(result.data.user_message);
                setTimeout(()=>{
                    //this.$router.push({name: this.$route.query.redirect, params: {stationId: this.$route.query.stationId}})
                    if(this.$route.query.redirect){
                        this.$router.push({path: this.menuURL.LOGIN, query: {redirect: this.$route.query.redirect, stationId: this.$route.query.stationId}})
                    }else{
                        this.$router.push(this.menuURL.LOGIN);
                    }

                }, 1000)
            }
        })
        .catch((e)=>{
            console.log('e', e);
            const errors = e.error[0];
            const errorFields = errors.fields;
            if(errorFields){
                this.$message.error(errorFields[0].user_message);
            }else{
                this.$message.error(errors.user_message || errors.message);
            }
        })
        .finally(()=>{
            this.submitting = false;
            this.submitted = false;
        })
    }
}
</script>

<style scoped>
#login{
    background-size: 100% 100%;
    background-position: top center;
    background-repeat: no-repeat;
    min-height: 100vh;
}
.content-100vh .d-flex{
    height: calc(100vh - 62px);
}
form{
    width: 90%;
}
.form-control{
    background-color: #F5F5F5;
    border-radius: 2rem;
    border-color: #E3E3E3;
}
.was-validated .form-control:invalid, .form-control.is-invalid{
    border-color: #ED1D24;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAcCAYAAADvANYcAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAIaADAAQAAAABAAAAHAAAAABsOd4NAAACMElEQVRIDcWWUU4CMRBAZ5b1D5M14cMEEhflX7jBHkFPgJ5AbiA3wBvoEbyB8QTiv0QS9Q8Cxk9l67QsS5e22y0rcZOF7kw7fW1nOgNQ4pkdhuG0ftwrYUIM9coYWPiVAXh4zWHK2NkaYtZoRYh4BoBBvFfp/wtEDDBYT4xdDrX+dmtttROT+skFILTlqbJQssbedoaYBWGAnrwLySQEJeDscyo9nCHiKj9/DBRLJOBwHFKny5M5QYgoQLwyGyQnrfo9s16vcYJY+P6t3owkRXAO2cIQy5CESJrO2CwEK40uDBEjs+9CYhgRIpeQ9SUgY3PaaPVJGdIrPeyTMRxyAQIE9HMqKSGBbsoyU9u6E8LbkSnOyAFq7y8Rf8mIxhmxcF6xQsT7lRtTSJpWlsp5XikQsrkQs3rYJoBuatS5QSErFpE/MBdigb6UH/INmbWUV8RizD2MEPwK5l5uHlpcY1sMObb68HOkbXyiowhVbSJhMKQVCIeMIW7TnU2+Y34YsPPa2+he10MLIUKSbj7dgO1lbOx9LToH8/F804ZyHMv8oIbk5kD3bwxNeUWBECWbIUtmJ+aXFTzyFxg8Z3WGL7pvdKVgBmJdshmMSGL7ZSV1Tpv6UjADUaY6SuexNtRSMM0dupItzx4iOyIHFs5LeSKkSMrrntEli+2shGJkEpKvZChYKXb9z2J2WfsY3fF5xHHklWy7gpFLQc9esu0MIy0FcdJoPfzV9bwNrvf90/wFeM6au3Fd/dcAAAAASUVORK5CYII=);
    background-size: 1rem;
}
.invalid-feedback{
    position: absolute;
    top: 5px;
    right: 32px;
    width: fit-content;
    color: #ED1D24;
}
.btn.w-100{
    border-radius: 2rem;
}

</style>
