import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

import { IonicVue } from "@ionic/vue";

import log from "loglevel";

// import the db
/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";

// i18n
import { createI18n } from "vue-i18n";
import messages from "./locales";
//import useSQLite from "./composables/useSQLite";

const LOG = "[main]";
log.disableAll();
if (process.env.NODE_ENV === "development") {
  log.setLevel(0);
}
log.debug(LOG, "log", { level: log.getLevel() });

log.debug(LOG, {
  name: process.env.VUE_APP_NAME,
  version: process.env.VUE_APP_VERSION,
});
log.debug(LOG, "creating app...");
const app = createApp(App).use(IonicVue).use(router);


// load locale

 //const { ready, querySingle } = useSQLite();
 //log.log("test", ready, querySingle);


// const retrierOptions = {
//   limit: 5,
//   firstAttemptDelay: 0,
//   delay: 250,
//   keepRetryingIf: (response, attempt) => {
//     log.debug(LOG, "keepRetryingIf", {
//       response,
//       attempt,
//     });
//     return !ready.value;
//   },
// };
// const retrier = new Retrier(retrierOptions);

// let items = []
 
// const loadData = async (attempt) => {
//   log.debug(LOG, "load locale", { attempt });
//   if (ready.value) {
//     if (!ready.value) throw new Error("fail to load locale");

//     try {
//       const data = await querySingle(repo.getByName({name: 'locale'}));
//       log.debug(LOG, "locale loaded", { data });
//       items = data;
//     } catch (err) {
//       log.error(err.message);
//       throw err;
//     }
//   }
// };



  //log.debug(LOG, "db ready");
router.isReady().then(async () => {
  log.debug(LOG, "router ready");
  app
    .use(
      createI18n({
        legacy: false,
        locale: "en",
        messages,
      })
    )
    .use(createPinia())
    .mount("#app");

    //var z = useSQLite()
    //log.log("tttttttttttttttttttttt", z)
});


// import { useAppStore } from "./stores/app";
// import { storeToRefs } from "pinia";

// const store = useAppStore();
// const {language} = storeToRefs(store);
// import {locale} from "vue-i18n"; 
// locale.value = language.value;

// # move to javascript
// https://ionicframework.com/docs/vue/quickstart#build-your-way-with-typescript-or-javascript
