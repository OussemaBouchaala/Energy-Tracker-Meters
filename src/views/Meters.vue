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
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonItemSliding,
  onIonViewDidEnter,
  onIonViewWillEnter,
  modalController,
} from "@ionic/vue";

import { add as addIcon, trash as deleteIcon  } from "ionicons/icons";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Retrier } from "@jsier/retrier";

import useSQLite from "../composables/useSQLite";
import repo from "../db/repo/meters";

import { useAppStore } from "../stores/app";
import { storeToRefs } from "pinia";
import ConfirmDialog from "../components/ConfirmDialog.vue";

const name = "Meters";
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
    IonFab,
    IonFabButton,
    IonIcon,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonItem,
  },
  setup() {
    log.debug(LOG, "setup");

    useI18n();
    const store = useAppStore();
    const { ready, query, run } = useSQLite();

    const { shouldReloadData } = storeToRefs(store);

    const {t} = useI18n();
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
      if (!shouldReloadData.value) return;
      log.debug(LOG, "view will enter");
      await showLoading();
    });

    onIonViewDidEnter(async () => {
      if (!shouldReloadData.value) return;
      log.debug(LOG, "view did enter");
      tryLoadData();
    });

    const tryLoadData = () => {
      shouldReloadData.value = false;
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

    const refresh = () => {
      log.debug(LOG, "refresh");
    };

    const confirmDelete = async (item) => {
      log.debug(LOG, "confirm delete", { item });
      const modal = await modalController.create({
        component: ConfirmDialog,
        cssClass: "confirm-dialog-class",
        swipeToClose: true,
        componentProps: {
            message: t("Readings.msg-delete-reading"),
            title: t("Readings.title-delete-reading"),
            action: "delete",
        },
        presentingElement: document.querySelector('ion-content'),
      });
      modal.onDidDismiss().then(({ data }) => {
        if (data && data.action === 'delete') {
        deleteItem(item.id); // delete function emited
      }
    });

    return modal.present();
    };

    const deleteItem = async (meterId) => {
      const { deleteById } = repo;
      try {
        // Await the result of deleteById to ensure the operation completes
        const result = await run (
          deleteById({ id: meterId })
        )
        // Log the result of the deletion
        log.debug(LOG, "delete result", { result });

        // Set shouldReloadData to true to trigger any data reloading
        shouldReloadData.value = true;
        tryLoadData();
      } catch (error) {
        // Log any errors that occur during the deletion process
        log.error(LOG, "error deleting meter", { error });
      }
      log.debug("deleted item");
    };

    const toNewMeterPage = () => {
      log.debug(LOG, "new meter");
      router.push("/meters/add");
    };

    const openMeter = (item) => {
      log.debug(LOG, "open meter", { item });
      router.push(`/meters/${item.id}`);
    };

    return {
      ready,
      refresh,
      toNewMeterPage,
      openMeter,
      confirmDelete,
      deleteIcon,
      addIcon,
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
        <ion-title v-t="'Meters.page-title'" />
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreens>
      <ion-refresher slot="fixed" :hidden="!loading" @ionRefresh="refresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-list lines="full">
        <ion-item-sliding 
          v-for="item in items"
          :key="item.id"
        >
          <ion-item button @click="openMeter(item)">
             <ion-label>{{ item.name }}</ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger" @click="confirmDelete(item)">
              <ion-icon :icon="deleteIcon"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button
          :disabled="!ready"
          color="primary"
          @click="toNewMeterPage"
        >
          <ion-icon :icon="addIcon" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <ion-footer></ion-footer>
  </ion-page>
</template>

<style>
.confirm-dialog-class {
  --width: 80%;
  --height: 25%;
  --border-radius: 10px;
}
</style>