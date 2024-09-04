<script>
import log from "loglevel";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonFooter,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
} from "@ionic/vue";

import { useRouter } from "vue-router";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";

import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";

import { useAppStore } from "../stores/app";
import repo from "../db/repo/meters";

import useSQLite from "../composables/useSQLite";

const name = "Meter";
const LOG = `[component|${name}]`;
const { withMessage } = helpers;

export default {
  name,
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButton,
    IonButtons,
    IonFooter,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
  },
  setup() {
    log.debug(LOG, "setup");

    const { t } = useI18n();
    const store = useAppStore();
    const router = useRouter();
    const { ready, run } = useSQLite();
    const { shouldReloadData, shouldReloadUsage } = storeToRefs(store);

    const name = ref("");
    const unit = ref("");
    const startValue = ref();
    const description = ref("");
    const submitted = ref(false);

    const rules = {
      name: {
        required: withMessage(t("AddMeter.msg-title-required"), required),
      },
      unit: {
        required: withMessage(t("AddMeter.msg-unit-required"), required),
      },
    };
    const v$ = useVuelidate(rules, { name, unit }, { $autoDirty: true });

    const saveItem = async () => {
      const $v = v$.value;
      const meter = {
        name: name.value,
        unit: unit.value,
      };

      submitted.value = true;
      $v.$touch();
      var valid = await $v.$validate();
      log.log(LOG, "saving", meter, $v);
      if (!valid) {
        log.log(LOG, "invalid");
        return;
      }

      const { add } = repo;
      try {
        await run(
          add({
            name: name.value,
            unit: unit.value,
            startValue: startValue.value,
            description: description.value,
            user: "app",
          })
        );
        shouldReloadData.value = true;
        shouldReloadUsage.value = true;
        router.replace("/meters");
      } catch (ex) {
        log.error(ex);
      }

      log.debug("saved");
    };

    return {
      v$,
      ready,
      name,
      unit,
      startValue,
      description,
      saveItem,
      submitted,
    };
  },
};
</script>

<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/meters" />
        </ion-buttons>
        <ion-title v-t="{ path: 'AddMeter.page-title' }" />
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreens>
      <form>
        <ion-list lines="full" class="ion-margin">
          <ion-item>
            <ion-label
              position="stacked"
              v-t="'AddMeter.label-name'"
              :color="submitted && v$.name.$error ? 'danger' : 'black'"
            />
            <ion-input required v-model="name"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label
              position="stacked"
              v-t="'AddMeter.label-unit'"
              :color="submitted && v$.unit.$error ? 'danger' : 'black'"
            />
            <ion-input v-model="unit"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked" v-t="'AddMeter.label-start-value'" />
            <ion-input type="number" v-model="startValue"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked" v-t="'AddMeter.label-description'" />
            <ion-input required v-model="description"></ion-input>
          </ion-item>
          <section class="mt">
            <ion-button
              :disabled="!ready"
              expand="block"
              @click="saveItem"
              v-t="'AddMeter.button-save'"
            />
          </section>
        </ion-list>
      </form>
    </ion-content>

    <ion-footer></ion-footer>
  </ion-page>
</template>

<style scoped>
.mt {
  margin-top: 20px;
}
</style>
