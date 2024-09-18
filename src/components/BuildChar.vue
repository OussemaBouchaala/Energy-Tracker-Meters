<template>
    <div :class="{'for-month': showMonth}">
        <ion-page>
            <ion-header>
                <ion-toolbar>
                    <ion-title v-t="'Charts.custom-chart-title'"/>
                    <ion-buttons slot="end">
                        <ion-button @click="dismissModal" v-t="'App.button-cancel'"></ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <ion-content>
                <ion-item>
                    <ion-label v-t="'Charts.select-category'"/>
                    <ion-select v-model="selectedCategory" @ionChange="showingMonth">
                        <ion-select-option v-t="'Charts.year'"></ion-select-option>
                        <ion-select-option v-t="'Charts.month'"></ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-label  
                        position="floating"
                        :color="submitted && v$.year.$error ? 'danger' : 'black'"
                    >{{t('Charts.enter')}} {{t('Charts.year')}}</ion-label>
                    <ion-input required v-model="year" type="number"></ion-input>
                    <ion-text color="danger" v-if="submitted && v$.year.$error">
                        <small>
                        <!-- Iterate over errors and display the first error message -->
                        {{ v$.year.$errors[0].$message }}
                        </small>
                    </ion-text>
                </ion-item>
                <ion-item v-if="showMonth">
                    <ion-label 
                        position="floating"
                        :color="submitted && v$.month.$error ? 'danger' : 'black'"
                    >{{t('Charts.enter')}} {{t('Charts.month')}}</ion-label>
                    <ion-input required v-model="month" type="number"></ion-input>
                    <ion-text color="danger" v-if="submitted && v$.month.$error">
                        <small>
                        <!-- Iterate over errors and display the first error message -->
                        {{ v$.month.$errors[0].$message }}
                        </small>
                    </ion-text>
                </ion-item>
                <ion-button expand="block" @click="buildChart">OK</ion-button>
            </ion-content>
        </ion-page>
    </div>
</template>

<script>
import log from "loglevel";
import { provide, ref } from 'vue';
import { 
    IonContent, 
    IonHeader, 
    IonPage, 
    IonTitle, 
    IonToolbar, 
    IonButton,
    IonButtons,
    IonLabel,
    IonInput, 
    IonItem,
    modalController,
    IonSelect,
    IonSelectOption,
    IonText
} from '@ionic/vue';

import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
import { required, helpers, minValue, maxValue } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";


const name = 'BuildChart';
const { withMessage } = helpers;
const LOG = `[view|${name}]`;

export default{
    name,
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
        IonButton,
        IonButtons,
        IonSelect,
        IonSelectOption,
        IonLabel,
        IonItem,
        IonInput,
        IonText
    },
    props: {
        currMeterId: {
            type: String,
            required: true,
        },
        readings:{
            type: Array,
            required: true,
        }
    },
    setup(props) {
        log.debug(LOG, "setup");

        const { t } = useI18n();
        const router = useRouter();
        const showMonth = ref(false);
        const submitted = ref(false);
        const year = ref(new Date().getFullYear());
        const month = ref(new Date().getMonth()+1)
        const selectedCategory = ref(t('Charts.year'));
        const filteredReadings = ref([])

        //validate entering value
        log.debug(LOG, "year", year.value);
        log.debug(LOG, "month", month.value);

        const rules = {
            year: {
                required: withMessage(t("AddReading.msg-value-required"), required),
                minValue: withMessage(
                t("Charts.valid-year"),
                minValue(1997)),
                maxValue: withMessage(
                t("Charts.valid-year"),
                maxValue(new Date().getFullYear()))
            },
        };
        let v$ = useVuelidate(rules, { year }, { $autoDirty: true });
        
        const showingMonth = () => {
            log.debug(LOG, "showingMonth", {
                show:showMonth.value, 
                selectedCategory: selectedCategory.value,
                category: t("Charts.month")
            });
            if(selectedCategory.value === t("Charts.month")){
                showMonth.value = true;
                year.value = new Date().getFullYear();
                rules.month = {
                    required: withMessage(t("AddReading.msg-value-required"), required),
                    minValue: withMessage(
                    t("Charts.valid-month"),
                    minValue(1)),
                    maxValue: withMessage(
                    t("Charts.valid-month"),
                    maxValue(12))
                }
                log.debug(LOG, "rules", rules)
                v$ = useVuelidate(rules, {year, month}, { $autoDirty: true})
            }
            else{
                showMonth.value = false;
            }
        }

        const dismissModal = () => {
            modalController.dismiss();
        }

        const buildChart = async () => {
            log.debug(LOG,'Building chart', selectedCategory.value);
            const $v = v$.value;
            const input = {
                year: year.value
            }
            if(selectedCategory.value){
                input.month = month.value
            }
            submitted.value = true;
            $v.$touch();
            var valid = await $v.$validate();
            log.log(LOG, "saving", input, $v);
            if (!valid) {
                log.log(LOG, "invalid input");
                return;
            }
            if("month" in input){
                filteredReadings.value = props.readings.filter(
                    item => {
                        const itemYear = new Date(item.date).getFullYear()
                        const itemMonth = new Date(item.date).getMonth()
                        return itemYear === year.value && itemMonth === month.value
                    }
                )
            }
            else{
                filteredReadings.value = props.readings.filter(
                    item => {
                        const itemYear = new Date(item.date).getFullYear()
                        return itemYear === year.value
                    }
                )
            }
            
            log.debug(LOG,"filtered array", filteredReadings.value)

            router.push(`/usage/charts/${props.currMeterId}`);
            dismissModal();
        };
        provide('filteredReadings', filteredReadings.value)

        return {
            dismissModal,
            selectedCategory,
            year,
            month,
            buildChart,
            showMonth,
            submitted,
            v$,
            t,
            showingMonth
        };
    },
};
</script>

<style scoped>

.for-month {
    --width: 85%;
    --height: 55%;
    --border-radius: 10px;
}

ion-modal {
    --ion-padding: 20px;
}
</style>
