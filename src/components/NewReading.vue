<template> 
    <ion-header>
        <ion-toolbar>
        <ion-title>New reading</ion-title>
        <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
        </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-item>
          <ion-label 
            position="stacked"
            v-t="'AddReading.label-value'"
            :color="submitted && v$.value.$error ? 'danger' : 'black'"
          ></ion-label>
          <ion-input required v-model="value" type="text"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label 
            position="stacked"
            v-t="'AddReading.label-date'"
            :color="submitted && v$.date.$error ? 'danger' : 'black'"
          ></ion-label>
          <ion-input required v-model="date" type="date"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked" v-t="'AddReading.label-comment'"></ion-label>
          <ion-input v-model="comment" type="text"></ion-input>
        </ion-item>
        <ion-button expand="block" v-t="'AddReading.button-save'" @click="save"></ion-button>
    </ion-content>
</template>

<script>
import { 
    IonContent, 
    IonButton,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonItem, 
    IonLabel, 
    IonInput,
    modalController,
} from '@ionic/vue';
import log from 'loglevel';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useVuelidate from "@vuelidate/core";
import repo from "../db/repo/readings";
import { useAppStore } from '../stores/app';
import useSQLite from "../composables/useSQLite";
import { useRouter  } from 'vue-router';
import { storeToRefs } from 'pinia';
import { required, helpers } from "@vuelidate/validators";

const name="NewReading";
const { withMessage } = helpers;
const LOG = `[component|${name}]`;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}


export default({
  name,
  components: {
    IonContent, 
    IonButton,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonItem, 
    IonLabel, 
    IonInput,
  },
  props:{
    currMeterId: {
      type: String,
      required: true
    },
    previousReading: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    log.debug(LOG, "setup");

    const router = useRouter();
    const store = useAppStore();
    const {run} = useSQLite();
    const { shouldReloadData } = storeToRefs(store);

    //const isModalOpen = ref(props.isVisibleForm);
    const isDateOpen = ref(false);
    const { t } = useI18n();
    const value = ref('');
    const date = ref('');
    const comment = ref('');
    const average = ref(0.0);
    const submitted = ref(false);
    const now = ref(new Date());
    const nowDate = now.value.toISOString().split('T')[0];

    const dateInput = () => {
      log.debug("dateInput");
      isDateOpen.value = true;
    }; 

    // const closeModal = () => {
    //   isModalOpen.value = false;
    //   context.emit('update:isVisibleForm' , false);
    // };
    
    const closeModal = () => {
      modalController.dismiss();
    };

    const rules = {
      value: {
        required: withMessage(t("AddReading.msg-value-required"), required),
      },
      date: {
        required: withMessage(t("AddReading.msg-date-required"), required),
      },
    };
    const v$ = useVuelidate(rules, { value, date }, { $autoDirty: true });

    const save = async () => {
      const $v = v$.value;
      const reading = {
        value: value.value,
        date: date.value,
      };

      submitted.value = true;
      $v.$touch();
      var valid = await $v.$validate();
      log.log(LOG, "saving", reading, $v);
      if (!valid) {
        log.log(LOG, "invalid");
        return;
      }
      //get the array of previousReading's ids   
      log.debug(LOG,"previousReading", props.previousReading);
      //check if the previous reading exist
      
        
      if (props.previousReading) {
        const previousReadingId= props.previousReading.id;
        log.debug(LOG,"previousReadingsId", { prev: previousReadingId, 
          prevDate: new Date(date.value), date:new Date(props.previousReading.date).getDate(),
        });
        //calculate the average
        const a = new Date(date.value);
        const b = new Date(props.previousReading.date);
        
        const result = dateDiffInDays(b, a);
        log.debug(LOG,"days between dates", a);
        log.debug(LOG,"value utc1", b);
        average.value = ((
          value.value - props.previousReading.value) / 
            result).toFixed(3);
        log.debug(LOG,"calculatedAverage", average.value);
      }
      
      //add to db   
      const { add } = repo;
      try {
        await run(
          add({
            value: value.value,
            date: date.value,
            comment: comment.value,
            average: average.value,
            meter_id: props.currMeterId,
          })
        );
        shouldReloadData.value = true;
        router.push('/usage');
        //`/usage/${props.currMeterId}`
        closeModal();
      } catch (ex) {
        log.error(ex);
      }

      log.debug("saved");
    };
    
    

    return {
      submitted,
      v$,
      save,
      value,
      date,
      comment,
      closeModal,
      //isModalOpen,
      nowDate,
      isDateOpen,
      dateInput,
    };
  }
});
</script>