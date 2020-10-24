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
                <h3 class="mb-4">เข้าสู่ระบบ</h3>
                <form v-on:submit.prevent="handleSubmit" class="mb-4" autocomplete="off">
                    <div class="form-group position-relative">
                        <label class="sr-only" for="identityId">หมายเลขบัตรประชาชน</label>
                        <input type="number" v-model="identityId" name="identityId" class="pl-3 form-control font-weight-light" :class="{ 'is-invalid': (submitted && !identityId) || (submitted && identityId.length < 13) }" placeholder="หมายเลขบัตรประชาชน" />
                        <div v-show="submitted && !identityId" class="invalid-feedback">กรุณาระบุ</div><!-- หมายเลขบัตรประชาชน -->
                        <div v-show="submitted && identityId && identityId.length != 13" class="invalid-feedback">ตรวจสอบ</div>
                    </div>
                    <div class="form-group position-relative">
                        <label class="sr-only" for="mobile">เบอร์โทรศัพท์</label>
                        <input type="number" v-model="mobile" name="mobile" class="pl-3 form-control font-weight-light" :class="{ 'is-invalid': (submitted && !mobile) || submitted && mobile.length < 10 }" placeholder="เบอร์โทรศัพท์" />
                        <div v-show="submitted && !mobile" class="invalid-feedback">กรุณาระบุ</div> <!-- เบอร์โทรศัพท์ -->
                        <div v-show="submitted && mobile && mobile.length != 10" class="invalid-feedback">ตรวจสอบ</div>
                    </div>
                    <div class="form-group mb-4">
                        <button type="submit" class="w-100 btn btn-primary" :disabled="loggingIn">
                            <span v-show="loggingIn" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ล็อกอิน
                        </button>
                    </div>
                    <div class="form-group d-none">
                        <button type="button" class="btn btn-outline-primary w-100" @click="$router.push({path: menuURL.REGISTER, query:{...$route.query}})">
                            ยังไม่ได้เป็นสมาชิก? คลิกเพื่อลงทะเบียน
                        </button>
                    </div>
                    <hr/>
                    <p class="text-center text-grey">ยังไม่ได้เป็นสมาชิก? <a class="text-primary" @click="$router.push({path: menuURL.REGISTER, query:{...$route.query}})" >คลิกเพื่อลงทะเบียน</a></p>
                </form>
                <p class="mt-5 text-center font-weight-light d-none">
                    <router-link :to="menuURL.ABOUT">
                        <b-button variant="outline-primary" style="border-radius:20px;">
                            <b-icon-info-circle />&nbsp;<span class="small">เกี่ยวกับ</span>
                        </b-button>
                    </router-link>
                </p>
            </div>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { IUser, EMenuURL } from '../../_types';
import SvgIcons from '../icon/SVGIcons.vue';
import { userService } from '../../_services';
import { namespace } from 'vuex-class';
const userModule = namespace('User');
const storeModule = namespace('Store');

@Component({
    components: {
        SvgIcons
    }
})
export default class LoginPage extends Vue {
    @userModule.State
    public status!: {loggedIn: boolean;}

    @storeModule.State
    public store!: {id:string;logo: string};

    @userModule.Action
    public setProfile!: (redirect?: any)=>void;
    @userModule.Action
    public clearCart!: () => void;

    identityId: string = '';
    mobile: string = '';
    submitted: boolean = false;
    loggingIn: boolean = false;

    private menuURL = EMenuURL;

    @Watch('status')
    onStatusChanged(){
        if(this.status.loggedIn) {
            this.$router.push(this.menuURL.PROFILE);
        }
    }

    mounted() {
        if(this.status.loggedIn){
            if(!this.$route.query.redirect) {
                this.$router.push(this.menuURL.PROFILE)
            }else{
                this.setProfile({
                    redirect: this.$route.query.redirect,
                    stationId: this.$route.query.stationId
                });
            }
        }
        const body = document.getElementsByTagName('body')[0];
        // @ts-ignore
        body.classList.add('login');
    }

    created() {
        const body = document.getElementsByTagName('body')[0];
        // @ts-ignore
        body.classList.add('login');
    }

    destroyed() {
        const body = document.getElementsByTagName('body')[0];
        // @ts-ignore
        body.classList.remove('login');
    }

    public handleSubmit(e: any): void {
        //e.preventDefault();
        this.submitted = true;
        if(!this.identityId || !this.mobile || this.identityId.length < 13 || this.mobile.length < 10){
            return;
        }
        this.loggingIn = true;
        userService.login(this.identityId, this.mobile)
        .then(async(res: any)=>{
            if(!res) {
                this.$message.error('ล็อกอินไม่สำเร็จ');
                return;
            }
            if(this.$route.query.redirect){
                await this.setProfile({
                    redirect: this.$route.query.redirect,
                    stationId: this.$route.query.stationId
                });

            }else{
                this.clearCart();
                this.setProfile();
            }
        })
        .finally(()=>{
            this.submitted = false;
            this.loggingIn = false;
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
.spinner-border{
    vertical-align: -2px;
}
a, a:hover{
    text-decoration: none;
}

</style>
