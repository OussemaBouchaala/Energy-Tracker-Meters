<script>
import log from "loglevel";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useAppStore } from "./stores/app";

import { IonApp, IonRouterOutlet, IonSplitPane, IonLoading } from "@ionic/vue";
import Menu from "./components/Menu.vue";
import SplashScreen from "./views/SplashScreen.vue";
import LogoScreen from "./views/LogoScreen.vue";

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
    LogoScreen,
  },
  setup() {
    log.debug(LOG, "setup");

    const { t } = useI18n();
    const { loading } = storeToRefs(useAppStore());

    const showSplashScreen = ref(true);
    const showLogoScreen = ref(true);

    const onLogoScreenFadeout = () => {
      showLogoScreen.value = false;
    };

    const onSplashScreenFadeout = () => {
      showSplashScreen.value = false;
    };

    return {
      showSplashScreen,
      showLogoScreen,
      loading,
      onSplashScreenFadeout,
      onLogoScreenFadeout,
      t,
    };
  },
};
</script>

<template>
  <ion-app>
    <LogoScreen v-if="showLogoScreen" @fadeout="onLogoScreenFadeout"/>
    <SplashScreen v-if="showSplashScreen && !showLogoScreen" @fadeout="onSplashScreenFadeout" />
    <ion-split-pane v-else-if="!showSplashScreen && !showLogoScreen" content-id="main-content">
      <Menu />
      <ion-loading :is-open="loading" :message="t('App.message-loading')" />
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<style scoped></style>
