<script>
import log from "loglevel";
import { ref, onMounted } from "vue";
import { IonPage, IonRow, IonCol, IonSpinner, IonGrid } from "@ionic/vue";
import { pause } from "../utils/helper";
import { init } from "../db/utils";
import db from "../db";
import { useI18n } from "vue-i18n";


const name = "splash-screen";
const LOG = `[component|${name}]`;

export default {
  name,
  components: {
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonPage,
  },
  emits: ["fadeout"],
  setup(_, context) {
    log.debug(LOG, "setup");

    const { t } = useI18n();
    const running = ref(true);
    const message = ref("");


    onMounted(async () => {
      message.value = t("SplashScreen.message-init-db");

      await init({ db });
      await pause(2000);
      running.value = false;
      await pause(1000);
      context.emit("fadeout");
    });

    return {
      message,
      running,
    };
  },
};
</script>

<template>
  <div class="loader" :class="{ fadeout: !running }">
    <ion-page>
      <ion-grid />
      <ion-grid fixed>
        <ion-row>
          <ion-col class="flex-col">
            <ion-spinner name="circles" />
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center">
          <ion-col class="flex-col">
            {{ message }}
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-grid />
    </ion-page>
  </div>
</template>

<style scoped>
.flex-row {
  display: flex;
  align-items: center;
}
.flex-col {
  display: flex;
  justify-content: center;
}
.loader {
  background-color: #3dc2ff;
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
.fadeout {
  animation: fadeout 2s forwards;
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
