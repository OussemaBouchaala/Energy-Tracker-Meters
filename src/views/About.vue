<script>
import log from "loglevel";
import { computed } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonContent,
  IonBackButton,
  IonItem,
  IonLabel,
  IonNote,
  IonTitle,
  IonBadge,
} from "@ionic/vue";

const name = "About";
const LOG = `[component|${name}]`;

export default {
  name,
  components: {
    IonPage,
    IonHeader,
    IonContent,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonNote,
    IonTitle,
    IonBadge,
  },
  setup() {
    log.debug(LOG, "setup");

    const appVersion = computed(() => "0.2.0");
    const appName = computed(() => "Energie Tracker");

    return {
      appName,
      appVersion,
    };
  },
};
</script>

<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button color="dark" text="" />
        </ion-buttons>
        <ion-title v-t="'App.about-menu'"></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-item :detail="true" :button="true" router-direction="forward">
        <ion-label>Version</ion-label>
        <ion-note slot="end" color="default">
          <ion-badge color="warning">{{ appVersion }}</ion-badge>
        </ion-note>
      </ion-item>
    </ion-content>
  </ion-page>
</template>
