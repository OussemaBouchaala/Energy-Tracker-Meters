<script>
import log from "loglevel";
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenu,
  IonMenuToggle,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
} from "@ionic/vue";
import {
  list as listIcon,
  bag as bagIcon,
  sync as syncIcon,
  information as infoIcon,
  create as createIcon,
  logOut as logoutIcon,
  settings as settingsIcon,
} from "ionicons/icons";

import { useI18n } from "vue-i18n";

const name = "Menu";
const LOG = `[component|${name}]`;

export default {
  name,
  components: {
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenu,
    IonMenuToggle,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
  },
  setup() {
    log.log(LOG, "setup");
    const { t } = useI18n();
    useI18n();

    const router = useRouter();

    const appVersion = computed(() => "0.2.0");
    const appName = computed(() => "Energie Tracker");

    

    return {
      router,
      createIcon,
      listIcon,
      bagIcon,
      syncIcon,
      infoIcon,
      t,
      logoutIcon,
      settingsIcon,
      appName,
      appVersion,
    };
  },
};
</script>

<template>
  <ion-menu side="start" menu-id="menu" content-id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ appName }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-menu-toggle>
          <ion-item button @click="() => router.push('/meters')">
            <ion-icon slot="start" :icon="listIcon" />
            <ion-label v-t="t('App.meter-menu')"></ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle>
          <ion-item button @click="() => router.push('/usage')">
            <ion-icon slot="start" :icon="bagIcon" />
            <ion-label>Usage</ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle auto-hide="false">
          <ion-item button @click="() => router.push('/settings')">
            <ion-icon slot="start" :icon="settingsIcon" />
            <ion-label v-t="t('App.settings-menu')"></ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle auto-hide="false">
          <ion-item button @click="() => router.push('/about')">
            <ion-icon slot="start" :icon="infoIcon" />
            <ion-label v-t="t('App.about-menu')"></ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>
