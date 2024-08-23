<template>
    <div class="loader">
        <ion-page>
            <ion-grid/>
            <ion-grid class="logo-container">
                <ion-row>
                    <ion-col class="flex-col">
                        <ion-img src="data:image/jpeg;base64,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" 
                        alt="App Logo" class="logo-image"></ion-img>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-justify-content-center">
                    <ion-col class="flex-col">
                        <ion-spinner name="circles" />
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid/>
        </ion-page>
    </div>
</template>

<script>
import log from "loglevel";
import { onMounted } from "vue";
import { 
    IonPage, 
    IonRow, 
    IonCol, 
    IonSpinner, 
    IonGrid, 
    IonImg ,
    //onIonViewDidEnter, 
    onIonViewWillEnter,
} from "@ionic/vue";
import { pause } from "../utils/helper";
import { init } from "../db/utils";
import db from "../db";
import { useI18n } from "vue-i18n";
import useSQLite from '../composables/useSQLite';
import repo from "../db/repo/options";
import { Retrier } from "@jsier/retrier";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/app";


const name = "logo-screen";
const LOG = `[component|${name}]`;

export default {
  name,
  components: {
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonPage,
    IonImg,
  },
  emits: ["fadeout"],
  setup(_, context) {
    log.debug(LOG, "setup");

    const { locale } = useI18n();
    const { ready, querySingle } = useSQLite();
    const store = useAppStore();
    const { shouldReloadData } = storeToRefs(store);
    const { showLoading, hideLoading } = store;

    onMounted(async () => {
      log.debug(LOG, "view mounted");
      await init({ db });
      await pause(3000);
      context.emit("fadeout");
      trySetLocale();
    });
    
    onIonViewWillEnter(async () => {
      if (!shouldReloadData.value) return;
      log.debug(LOG, "view will enter");
      await showLoading();
    });

    // onIonViewDidEnter(async () => {
    //   if (!shouldReloadData.value) return;
    //   log.debug(LOG, "view did enter");
    //   
    // });
    
    const retrierOptions = {
        limit: 5,
        firstAttemptDelay: 0,
        delay: 250,
        keepRetryingIf: (response, attempt) => {
            log.debug(LOG, "keepRetryingIf", {
            response,
            attempt,
            });
            return !ready.value;
        },
    };
    const retrier = new Retrier(retrierOptions);

    const trySetLocale = () => {
      shouldReloadData.value = false;
      retrier
        .resolve((attempt) => loadLocale(attempt))
        .then(
          async () => {
            log.debug(LOG, "locale loaded");
            await hideLoading();
          },
          async () => {
            log.debug(LOG, "load locale failed");
            await hideLoading();
          }
        );
    };

    const loadLocale = async (attempt) => {
        log.debug(LOG, "load locale", { attempt });
        if (ready.value) {
            if (!ready.value) throw new Error("fail to load locale");

            try {
                const newLocale = await querySingle(repo.getByName({name: 'locale'}));
                log.debug(LOG, "locale loaded", { newLocale });
                locale.value = newLocale;
            } catch (err) {
                log.error(err.message);
            throw err;
            }
        }
    };

    return {
    };
  },
};
</script>

<style scoped>
.logo-container {
  height: 100vh;
}
.flex-col {
  display: flex;
  justify-content: center;
}
.loader {
  background: linear-gradient( #7290B2 39%, #7598C1 41%);
  color: white;
  display: block;
  font-size: 16px;
  overflow: hidden;
  padding-top: 10vh;
  position: fixed;
  text-align: center;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
}
.logo-image {
  width: 10vh;
}
</style>