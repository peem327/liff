import Vue from 'vue'
import { router } from './_router';
import store from './_store';
import {
  ValidationObserver,
  ValidationProvider,
  extend,
  localize
} from "vee-validate";
import { required } from 'vee-validate/dist/rules';

import { BootstrapVue, BIconBoxArrowRight, BIconImage, BIconInfoCircle, BIconChevronLeft, BIconChevronRight, BIconArrowsFullscreen, BIconCheckCircleFill } from 'bootstrap-vue'
import { Badge, Empty, Popconfirm, Modal, Icon, Popover, Tooltip, Alert, message, Avatar, Button, Calendar, Tag, Radio, TimePicker, DatePicker, Carousel } from 'ant-design-vue'
import App from './App.vue'
import 'ant-design-vue/dist/antd.less';
import './assets/style.scss';
declare global {
    interface Window {
        liff: any;
    }
}
Vue.component(Alert.name, Alert);
Vue.component(Popconfirm.name, Popconfirm);
Vue.component(Badge.name, Badge);
Vue.component(Empty.name, Empty);
Vue.component(Modal.name, Modal);
Vue.component(Tooltip.name, Tooltip);
Vue.component(Popover.name, Popover);
Vue.component(Avatar.name, Avatar);
Vue.component(Button.name, Button);
Vue.component(Modal.name, Modal);
Vue.component(Calendar.name, Calendar);
Vue.component(Tag.name, Tag);
Vue.component(TimePicker.name, TimePicker);
Vue.component(DatePicker.name, DatePicker);
Vue.component(Carousel.name, Carousel);
Vue.use(Radio);

Vue.component('BIconBoxArrowRight', BIconBoxArrowRight);
Vue.component('BIconImage', BIconImage);
Vue.component('BIconInfoCircle', BIconInfoCircle);
Vue.component('BIconChevronLeft', BIconChevronLeft);
Vue.component('BIconChevronRight', BIconChevronRight);
Vue.component('BIconArrowsFullscreen', BIconArrowsFullscreen);
Vue.component('BIconCheckCircleFill', BIconCheckCircleFill);

Vue.component("ValidationObserver", ValidationObserver);
Vue.component("ValidationProvider", ValidationProvider);

Vue.config.productionTip = false;

Vue.use(BootstrapVue);

Vue.prototype.$message = message;
Vue.prototype.$confirm = Modal.confirm;


// Add the required rule
extend('required', {
	...required,
	message: 'This field is required'
});

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')
