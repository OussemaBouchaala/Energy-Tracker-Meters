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
                    >{{t('Charts.enter')}} {{t('Charts.year')}}</ion-label>
                    <ion-select v-model="selectedYear">
                        <ion-select-option v-for="year in years" :key="year" :value="year">
                            {{year}}
                        </ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item v-if="showMonth">
                    <ion-label 
                        position="floating"
                    >{{t('Charts.enter')}} {{t('Charts.month')}}</ion-label>
                    <ion-select v-model="selectedMonth">
                        <ion-select-option v-for="month in months" :key="month" :value="month">
                            {{month}}
                        </ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-button expand="block" @click="buildChart">OK</ion-button>
            </ion-content>
        </ion-page>
    </div>
</template>

<script>
import log from "loglevel";
import { ref } from 'vue';
import { 
    IonContent, 
    IonHeader, 
    IonPage, 
    IonTitle, 
    IonToolbar, 
    IonButton,
    IonButtons,
    IonLabel,
    IonItem,
    modalController,
    IonSelect,
    IonSelectOption,
} from '@ionic/vue';

import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
import { useAppStore } from "../stores/app";

const name = 'BuildChart';
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

        
        const store = useAppStore();
        const { changeReadingsArray, formatDate } = store;
        const { t } = useI18n();
        const router = useRouter();
        const showMonth = ref(false);
        const submitted = ref(false);
        const selectedYear = ref(null);
        const selectedMonth = ref(null)
        const selectedCategory = ref(t('Charts.year'));
        //const fullYears = ref([])
        //const fullMonths = ref([])
        const months = ref([])
        const years = ref([])
        const filteredReadings = ref([])
        

        props.readings.map(
            item => {
                const itemYear = new Date(item.date).getFullYear()
                //fullYears.value.push(itemYear)
                if(!(years.value.includes(itemYear))){
                    years.value.push(itemYear)
                }
            }
        )
        selectedYear.value = years.value[0];
        selectedMonth.value = new Date().getMonth()+1;

        log.debug(LOG, "props", props.readings);
        //validate entering value
        log.debug(LOG, "year", selectedYear.value);
        log.debug(LOG, "month", selectedMonth.value);

        
        const showingMonth = () => {
            log.debug(LOG, "showingMonth", {
                show:showMonth.value, 
                selectedCategory: selectedCategory.value,
                category: t("Charts.month")
            });
            if(selectedCategory.value === t("Charts.month")){
                formatDate("MMM DD");
                showMonth.value = true;
                props.readings.map(
                    item => {
                        const itemYear = new Date(item.date).getFullYear()
                        //fullYears.value.push(itemYear)
                        if(!(years.value.includes(itemYear))){
                            years.value.push(itemYear)
                        }
                        const itemMonth = new Date(item.date).getMonth()+1
                        //fullMonths.value.push(itemMonth)
                        if(!(months.value.includes(itemMonth))){
                            months.value.push(itemMonth)
                        }
                        
                    }
                )
                log.debug(LOG,"years and months",{years:years.value, months:months.value})
                selectedYear.value = new Date().getFullYear();
                
            }
            else{
                formatDate("MMM");
                showMonth.value = false;
            }
        }

        const dismissModal = () => {
            modalController.dismiss();
        }

        const buildChart = async () => {
            log.debug(LOG,'Building chart', selectedCategory.value);
            
            submitted.value = true;
            
            
            if(selectedCategory.value === t("Charts.month")){
                filteredReadings.value = props.readings.filter(
                    item => {
                        const itemYear = new Date(item.date).getFullYear()
                        const itemMonth = new Date(item.date).getMonth()+1
                        return itemYear === selectedYear.value && itemMonth === selectedMonth.value
                    }
                )
                log.debug(LOG,"filtered array", filteredReadings.value)
            }
            else{
                filteredReadings.value = props.readings.filter(
                    item => {
                        const itemYear = new Date(item.date).getFullYear()
                        return itemYear === selectedYear.value
                    }
                )            
                log.debug(LOG,"filtered array year", filteredReadings.value)

            }
            changeReadingsArray(filteredReadings.value.reverse());

            router.push(`/usage/charts/${props.currMeterId}`);
            dismissModal();
        };
        

        return {
            dismissModal,
            selectedCategory,
            selectedYear,
            selectedMonth,
            months,
            years,
            buildChart,
            showMonth,
            submitted,
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
