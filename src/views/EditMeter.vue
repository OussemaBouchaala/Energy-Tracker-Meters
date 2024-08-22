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
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import repo from "../db/repo/meters";
import { Retrier } from "@jsier/retrier";
import useSQLite from "../composables/useSQLite";
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { storeToRefs } from "pinia";

import { useAppStore } from "../stores/app";

const name = "Meter";
const LOG = `[component|${name}]`;
const { withMessage } = helpers;
const { getById, update } = repo;

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
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    log.debug(LOG, "setup");

    const store = useAppStore();
    const { t } = useI18n();
    const router = useRouter();
    const { ready, querySingle, run } = useSQLite();
    const { shouldReloadData } = storeToRefs(store);

    const name = ref("");
    const unit = ref("");
    const startValue = ref();
    const description = ref("");
    const submitted = ref(false);
    const loadingData = ref(true);
    let data = null;

    const { showLoading, hideLoading } = store;

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

    showLoading();

    onMounted(async () => {
      log.debug(LOG, "view mounted");
      retrier
        .resolve((attempt) => load(attempt))
        .then(
          async () => {
            loadingData.value = false;
            log.debug(LOG, "data loaded");
            await hideLoading();
          },
          async () => {
            log.debug(LOG, "load data failed");
            await hideLoading();
            router.back();
          }
        );
    });

    const rules = {
      name: {
        required: withMessage(t("AddMeter.msg-title-required"), required),
      },
      unit: {
        required: withMessage(t("AddMeter.msg-unit-required"), required),
      },
    };
    const v$ = useVuelidate(rules, { name, unit }, { $autoDirty: true });

    

    const load = async (attempt) => {
      log.debug(LOG, `load meter`, { attempt, id: props.id });
      if (!ready.value) {
        log.debug(LOG, "db not ready");
        throw new Error("fail to load data");
      }

      try {
        data = await querySingle(getById({ id: parseInt(props.id) }));

        name.value = data.name;
        unit.value = data.unit;
        startValue.value = data.startValue;
        description.value = data.description;
      } catch (err) {
        log.error(err.message);
        throw err;
      }
    };

    const save = async () => {
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

      try {
        showLoading();
        await run(
          update({
            name: name.value,
            unit: unit.value,
            startValue: startValue.value,
            description: description.value,
            id: parseInt(props.id),
          })
        );
        shouldReloadData.value = true;
        router.back();
      } catch (ex) {
        log.error(ex);
      } finally {
        hideLoading();
      }
    };

    const dataChanged = computed(() => {
      if (loadingData.value) return false;

      return !(
        name.value === data.name &&
        unit.value === data.unit &&
        startValue.value === data.startValue &&
        description.value === data.description
      );
    });

    return {
      name,
      unit,
      startValue,
      description,
      save,
      submitted,
      dataChanged,
      v$,
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
            <ion-input v-model="description"></ion-input>
          </ion-item>
          <section class="mt">
            <ion-button
              :disabled="!dataChanged"
              expand="block"
              @click="save"
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
