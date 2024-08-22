<script>
import log from "loglevel";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useAppStore } from "./stores/app";

import { IonApp, IonRouterOutlet, IonSplitPane, IonLoading } from "@ionic/vue";
import Menu from "./components/Menu.vue";
import SplashScreen from "./views/SplashScreen.vue";

const name = "App";
const LOG = `[component|${name}]`;

export default {
  name,
  components: {
    IonApp,
    IonRouterOutlet,
    IonSplitPane,
    IonLoading,
    Menu,
    SplashScreen,
  },
  setup() {
    log.debug(LOG, "setup");

    const { t } = useI18n();
    const { loading } = storeToRefs(useAppStore());

    const showSplashScreen = ref(true);

    const onSplashScreenFadeout = () => {
      showSplashScreen.value = false;
    };

    return {
      showSplashScreen,
      loading,
      onSplashScreenFadeout,
      t,
    };
  },
};
</script>

<template>
  <ion-app>
    <SplashScreen v-if="showSplashScreen" @fadeout="onSplashScreenFadeout" />
    <ion-split-pane v-else content-id="main-content">
      <Menu />
      <ion-loading :is-open="loading" :message="t('App.message-loading')" />
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<style scoped></style>
