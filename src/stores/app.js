import log from "loglevel";

import { defineStore } from "pinia";

const id = "app";
const LOG = `[store.${id}]`;

export const useAppStore = defineStore(id, {
  state() {
    return {
      shouldReloadData: false,
      shouldReloadUsage: false,
      readingsArray: [],
      dateDisplayFormat: "MMM",
      multiselect: false,
      loading: false,
      version: process.env.VUE_APP_VERSION,
      name: process.env.VUE_APP_NAME,
    };
  },
  actions: {
    formatDate(format){
      this.dateDisplayFormat = format;
    },
    changeReadingsArray(newVal){
      log.debug(LOG, "[A|changeReadingsArray]");
      this.readingsArray = newVal.slice();
      log.debug(LOG, "[A|changeReadingsArray] readingsArray: ", this.readingsArray);
    },
    reloadData(newVal) {
      log.debug(LOG, "[A|reloadData]");
      this.shouldReloadData = newVal;
    },
    showLoading() {
      log.debug(LOG, "[A|showLoading]");
      this.loading = true;
    },
    hideLoading() {
      log.debug(LOG, "[A|hideLoading]");
      this.loading = false;
    },
    enableMultiselect() {
      log.debug(LOG, "[A|enableMultiselect]");
      this.multiselect = true;
    },
    disableMultiselect() {
      log.debug(LOG, "[A|disableMultiselect]");
      this.multiselect = false;
    },
  }
});
