<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { enIE, id } from "date-fns/locale";
import moment from "moment";
import { useTheme } from 'vuetify';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// INTERFACE
interface IProps {
  from: any;
  to: any;
}
interface IEmits {
  (e: "date-change", response: any): void;
}

const displayFormatter = (dateStr: any) => {
  return moment(dateStr).format("DD MMM YYYY HH:mm:ss");
}
const paramsFormatter = (dateObj: any) => {
  return moment(dateObj).format("YYYY-MM-DD HH:mm:ss");
}

// VARIABLE
const props = defineProps<IProps>();
const emit = defineEmits<IEmits>();
const date_picker = ref();
const date = ref([props.from, props.to]);
const date_from = ref("");
const date_to = ref("");
const date_filter = ref(
  `${displayFormatter(date.value[0])} - ${displayFormatter(date.value[1])}`
);

const shortcut_button = ref([
  {
    title: 'Today',
    value: "today",
  },
  {
    title: 'Yesterday',
    value: "yesterday",
  },
  {
    title: 'Last 7 Days',
    value: "last_week",
  },
  {
    title: 'This Month',
    value: "this_month",
  },
  {
    title: 'Last 1 Month',
    value: "last_one_month",
  },
  {
    title: 'Last 3 Months',
    value: "last_three_month",
  },
]);

const vuetifyTheme = useTheme();
const isDark = computed(() => vuetifyTheme.global.name.value === 'dark');

// FUNCTION
function cancelPickDate() {
  date_picker.value.closeMenu();
}
function pickSelectedDate() {
  date_picker.value.selectDate();
  date_from.value = date.value[0];
  date_to.value = date.value[1];
  date_filter.value = `${displayFormatter(
    date_from.value
  )} - ${displayFormatter(date_to.value)}`;

  const date_emit = {
    from: paramsFormatter(date.value[0]),
    to: paramsFormatter(date.value[1]),
  };
  emit("date-change", date_emit);
}
function shortcutDate(type: string) {
  if (type == "today") {
    date_from.value = moment().format("YYYY-MM-DD 00:00:00");
    date_to.value = moment().format("YYYY-MM-DD 23:59:59");
  } else if (type == "yesterday") {
    date_from.value = moment()
      .subtract(1, "days")
      .format("YYYY-MM-DD 00:00:00");
    date_to.value = moment().subtract(1, "days").format("YYYY-MM-DD 23:59:59");
  } else if (type == "last_week") {
    date_from.value = moment()
      .subtract(6, "days")
      .format("YYYY-MM-DD 00:00:00");
    date_to.value = moment().format("YYYY-MM-DD 23:59:59");
  } else if (type == "this_month") {
    date_from.value = moment().startOf("month").format("YYYY-MM-DD 00:00:00");
    date_to.value = moment().format("YYYY-MM-DD 23:59:59");
  } else if (type == "last_one_month") {
    date_from.value = moment()
      .subtract(1, "months")
      .format("YYYY-MM-DD 00:00:00");
    moment().format("YYYY-MM-DD 23:59:59");
    date_to.value = moment().format("YYYY-MM-DD 23:59:59");
  } else if (type == "last_three_month") {
    date_from.value = moment()
      .subtract(2, "months")
      .format("YYYY-MM-DD 00:00:00");
    moment().format("YYYY-MM-DD 23:59:59");
    date_to.value = moment().format("YYYY-MM-DD 23:59:59");
  }
  date.value = [date_from.value, date_to.value];
}

watch(props, () => {
  date.value = [props.from, props.to];
});
</script>

<template>
  <VueDatePicker
    ref="date_picker"
    v-model="date"
    range
    format="dd LLL yyyy HH:mm:ss"
    month-name-format="long"
    time-picker-inline
    enable-seconds
    locale="id"
    hours-grid-increment="1"
    minutes-grid-increment="1"
    seconds-grid-increment="1"
    :max-date="new Date()"
    :multi-calendars="{ solo: false }"
    :teleport="true"
    :clearable="false"
    :partial-range="false"
    :format-locale="id"
    :dark="isDark"
  >
    <template #trigger>
      <VTextField
        v-model="date_filter"
        label="Date"
        variant="outlined"
        readonly
        density="compact"  hide-details       >
        <template #append-inner>
          <VIcon
            icon="mdi-calendar-event"
            size="20"
            style="margin-top: 1px;"
          />
        </template>
      </VTextField>
    </template>
    <template #action-extra>
      <div class="px-2">
        <VCard
          class="d-flex gap-2 mt-2 border-custom rounded pe-0 py-2"
          style="padding-left: 10px; box-shadow: none;"
        >
          <VChip
            v-for="item in shortcut_button"
            :key="item.value"
            label
            variant="tonal"
            size="x-small"
            color="primary"
            class="clickable"
            @click="shortcutDate(item.value)"
          >
            {{ item.title }}
          </VChip>
        </VCard>
      </div>
    </template>
    <template #action-buttons>
      <div class="d-flex">
        <VBtn
          variant="tonal"
          size="small"
          color="error"
          @click="cancelPickDate"
        >
          Cancel
        </VBtn>
        <VBtn
          variant="tonal"
          size="small"
          color="success"
          class="ms-1"
          @click="pickSelectedDate"
        >
          Save
        </VBtn>
      </div>
    </template>
  </VueDatePicker>
</template>

<style>
.dp__main * {
  font-family: "Poppins", sans-serif !important;
}
.dp__month_year_wrap {
  font-size: 16px !important;
  font-weight: 600 !important;
}

.dp__calendar_header {
  font-size: 14px !important;
  font-weight: 500 !important;
}

.dp__menu {
  border-radius: 10px !important;
  font-family: "Poppins", sans-serif !important;
}


.dp__arrow_top {
  border-block-start: 1px solid rgb(247, 244, 244);
}

.dp__calendar_item {
  block-size: 30px !important;
  font-size: 14px !important;
}

.dp__time_col {
  font-family: "Poppins", sans-serif !important;
  font-size: 14px !important;
}

.dp__time_picker_inline_container {
  inline-size: 33.5rem !important;
}

.dp__flex {
  border: 0.5px solid #a0a3b8;
  border-radius: 6px;
  inline-size: 100% !important;
  margin-block: 0;
  margin-inline: 9px;
  padding-block: 3px;
  padding-inline: 0;
}

.dp__theme_dark {
  --dp-background-color: #2f3349 !important;
  --dp-menu-border-color: #a0a4b6 !important;
  --dp-range-between-dates-background-color: #4c516e !important;
}

.border-custom {
  border: 0.5px solid #a0a3b8;
}

.clickable {
  cursor: pointer;
}
</style>
