<template>
  <div class="w-100">
    <a-calendar :defaultValue="defaultValue" :fullscreen="false" :header-render="headerRender" @panelChange="onPanelChange" @select="onSelectedDateChange" :disabledDate="setDisableDate"></a-calendar>
  </div>
</template>
<script>
import moment from 'moment';
export default {
	/* eslint-disable no-mixed-spaces-and-tabs */
  props: {
    limitReservationDays: {
      type: Number,
      default: 10,
      required: false,
      validator: function (value) {
        return value >= 0
      }
    },
    defaultValue: {
      type: moment.Moment,
      require: false,
      default: moment()
    }
  },
  data: function () {
    return {
    }
  },
  created: function () {
    // `this` points to the vm instance
  },
  methods: {
    onPanelChange(value, mode) {
      // eslint-disable-next-line no-console
      //console.log(value, mode);
    },
    headerRender({ value, type, onChange, onTypeChange }) {
      const start = 0;
      const end = 12;
      const monthOptions = [];

      const current = value.clone();
      const localeData = value.localeData();
      const months = [];
      for (let i = 0; i < 12; i++) {
        current.month(i);
        //months.push(localeData.monthsShort(current));
        months.push(localeData.months(current));
      }

      for (let index = start; index < end; index++) {
        monthOptions.push(
          // <a-select-option class="month-item" key={`${index}`}>
          //   {months[index]}
          // </a-select-option>,
        );
      }
      const month = value.month();
      const currentMonth = months[month];
      const now = moment();
      //if(now.month() < month){this.setDisableDate(current);}

      const year = value.year();
      const currentYear = year + 543;

      let isPrevDisabled = true;
      if(year > now.year() || now.month() < month){
      	isPrevDisabled = false;
      }
      return (
      	<div class="d-flex px-2 justify-content-between text-primary align-items-center">
      		<b-button disabled={isPrevDisabled} variant="link"
      			onClick={()=>{const prevMonth = value.clone().month(value.month()-1); onChange(prevMonth)}}>
      				<b-icon-chevron-left v-show={!isPrevDisabled} />
              <span class="d-block" style="width: 20px;" v-show={isPrevDisabled}></span>
    				</b-button>
  				<span class="h5 font-weight mb-0">{currentMonth} {currentYear}</span>
  				<b-button variant="link" animation="fade"
  					onClick={()=>{const nextMonth = value.clone().month(value.month()+1); onChange(nextMonth)}}>
  						<b-icon-chevron-right />
					</b-button>
				</div>
			);
    },
    onSelectedDateChange(date) {
      this.$emit('selected', date);
    },
    setDisableDate(current) {
    	const now = moment();
    	const untilDay = now.clone().add(this.limitReservationDays,'days');
    	const duration = Math.floor(moment.duration(current.diff(untilDay)).as('days'));
    	if(duration >= 0 || duration < -(this.limitReservationDays+1) ){
    		return true;
    	}

    },
  },
  /* eslint-disable no-mixed-spaces-and-tabs */
};

</script>
