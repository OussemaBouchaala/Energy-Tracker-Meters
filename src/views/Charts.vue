<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="{{name: 'meter-readings'}}" />
                </ion-buttons>
                <ion-title>Charts for "{{meterName}}"</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="chart-container">
                <canvas id="averages" width="400" height="258"></canvas>
                <canvas id="values" width="400" height="258"></canvas>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import log from "loglevel";

import { 
    IonBackButton, 
    IonButtons, 
    IonContent, 
    IonHeader, 
    IonPage, 
    IonTitle, 
    IonToolbar
} from '@ionic/vue';
import 'chartjs-adapter-moment';
import { ref, onMounted } from "vue";
import repo from "../db/repo/readings";
import repo1 from "../db/repo/meters";
import { Retrier } from "@jsier/retrier";
import useSQLite from "../composables/useSQLite";
import { useI18n } from "vue-i18n";
import { Chart, registerables } from 'chart.js';
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/app";
//import { forEach } from "core-js/core/array";

const { getById } = repo1;
const name = 'Charts';
const LOG = `[view|${name}]`;

export default{
    name,
    components: { 
        IonContent, 
        IonHeader, 
        IonPage, 
        IonTitle, 
        IonToolbar,
        IonBackButton,
        IonButtons
    },
    props: {
        id: {
            type: String,
            required: true
        }
    },
    setup(props) {
        Chart.register(...registerables);
        log.debug(LOG, "setup");

        const { t } = useI18n();

        useI18n();
        const store = useAppStore();
        
        const { ready, query, querySingle } = useSQLite();
        
        const readings = ref([]);
        const meterName = ref("");
        let dataReadings = null;
        let currentMeter = null;
        const averages =  ref([]);
        const dates = ref([]);
        const values = ref([]);

        const { shouldReloadData } = storeToRefs(store);
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
        onMounted(() => {
            tryLoadAndCreateChart();
        });
        let chart;
        // Create a new chart instance
        const createChart = (ctx,labels,datasetLabel,data,minDate,destroy=false) => {
            if (destroy && chart) {
                chart.destroy();
            }
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels:  labels,
                    datasets: [{
                        label: datasetLabel,
                        data: data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'month',
                                tooltipFormat: 'DD MMM YYYY',
                                displayFormats: {
                                    month: 'MMM'
                                }
                            },
                            min: minDate,
                        },
                        y: {
                            beginAtZero: true
                        }
                    },
                    layout: {
                        padding: {
                            right: 10 // Add some padding to accommodate scrolling
                        }
                    }
                }
            });
            return chart;
        }
        
        const tryLoadAndCreateChart = () => {
            shouldReloadData.value = false;
            retrier
                .resolve((attempt) => loadData(attempt))
                .then(
                    async () => {
                        log.debug(LOG, "data loaded");
                        await hideLoading();
                    },
                    async () => {
                        log.debug(LOG, "load data failed");
                        await hideLoading();
                    }
                )
                .then(() => {
                    const month = new Date(dates.value[0]).getMonth()
                    const year = new Date(dates.value[0]).getFullYear();
                    const firstDate = new Date(year, month, 1);
                    log.debug(LOG, "First date", firstDate);
                    createChart(
                        document.getElementById('averages').getContext('2d'),
                        dates.value,
                        t('Charts.evolution-averages'),
                        averages.value,
                        firstDate,
                        true
                    );
                    log.debug(LOG, "Chart1 created");
                    createChart(
                        document.getElementById('values').getContext('2d'),
                        dates.value,
                        t('Charts.evolution-values'),
                        values.value,
                        firstDate
                    );
                    log.debug(LOG, "Chart2 created");
                });
        };

        const loadData = async (attempt) => {
            log.debug(LOG, "load readings", { attempt, id: props.id });
            if (!ready.value) {
                throw new Error("fail to load data");
            }
            try {
                currentMeter = await querySingle(getById({ id: parseInt(props.id) }));
                dataReadings = await query(repo.getAll({ meter_id: parseInt(props.id) }));
                log.debug(LOG, "Loaded readings data",  dataReadings );
                readings.value = dataReadings
                
                readings.value.forEach(reading => {
                    averages.value.push(reading.average);
                    dates.value.push(reading.date);
                    values.value.push(reading.value);
                });
                log.debug(LOG, "Loaded data", {averages: averages.value, dates: dates.value, values: values.value});
                // forEach(readings.value, (reading, i) => {
                //     //const reading = readings.value[i];
                //     const average = reading.values.reduce((sum, value) => sum + value, 0) / reading.values.length;
                //     averages.push(average);
                // })
                meterName.value = currentMeter.name
                log.debug(LOG, "Loaded name:", meterName.value );
                log.debug(LOG, "Loaded readings", { readings: readings.value });
            } catch (err) {
                log.error(LOG, "Error loading data", err);
                throw err;
            }
        };

        return {
            t,
            meterName,
        };
    }
};
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: 400px;
}
</style>