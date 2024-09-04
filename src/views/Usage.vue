<script>
import log from "loglevel";

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonLabel,
  onIonViewDidEnter,
  onIonViewWillEnter,
} from "@ionic/vue";

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Retrier } from "@jsier/retrier";

import useSQLite from "../composables/useSQLite";
import repo from "../db/repo/meters";

import { useAppStore } from "../stores/app";
import { storeToRefs } from "pinia";

const name = "Usage";
const LOG = `[component|${name}]`;

export default {
  name,
  components: {
    
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonFooter,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
  },
  setup() {
    log.debug(LOG, "setup");

    useI18n();
    const store = useAppStore();
    const { ready, query } = useSQLite();

    const { shouldReloadData, shouldReloadUsage } = storeToRefs(store);

    const loading = ref(false);
    const router = useRouter();
    const items = ref([]);

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

    const { showLoading, hideLoading } = store;

    showLoading();

    onMounted(async () => {      
      log.debug(LOG, "view mounted");
      tryLoadData();
    });

    onIonViewWillEnter(async () => {
      if (!shouldReloadUsage.value) return;
      log.debug(LOG, "view will enter");
      await showLoading();
    });

    onIonViewDidEnter(async () => {
      log.debug(LOG, "view did enter", shouldReloadData.value );
      if (!shouldReloadUsage.value) return;
      log.debug(LOG, "view did enter");
      tryLoadData();
    });

    const tryLoadData = () => {
      //shouldReloadData.value = false;
      shouldReloadUsage.value = false;
      retrier
        .resolve((attempt) => loadData(attempt))
        .then(
          async () => {
            log.debug(LOG, "data loaded");
            await hideLoading();
          },
          async () => {
            log.debug(LOG, "load data failed");
            await hideLoading();
          }
        );
    };

    const loadData = async (attempt) => {
      log.debug(LOG, "load meters", { attempt });
      if (!ready.value) throw new Error("fail to load data");

      try {
        const data = await query(repo.getAll());
        items.value = data;
      } catch (err) {
        log.error(err.message);
        throw err;
      }
    };

    const refresh = async (event) => {
      log.debug(LOG, "refresh");
      await tryLoadData();
      event.target.complete();
    };

    const toNewMeterPage = () => {
      log.debug(LOG, "new meter");
      router.push("/meters/add");
    };

    const openMeter = (item) => {
      log.debug(LOG, "open meter", { item });
      router.push(`/usage/${item.id}`);
    };

    return {
      ready,
      refresh,
      toNewMeterPage,
      openMeter,
      loading,
      items,
    };
  },
};
</script>

<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="menu" color="dark" />
        </ion-buttons>
        <ion-title>Usage</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreens>
      <ion-refresher slot="fixed" :hidden="!loading" @ionRefresh="refresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-list lines="full">
        <ion-item
          button
          @click="openMeter(item)"
          v-for="item in items"
          :key="item.id"
        >
          <ion-label>{{ item.name }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>

    <ion-footer></ion-footer>
  </ion-page>
</template>
