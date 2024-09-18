<script>
import { 
    IonTitle,
    IonList,
    IonLabel,
    IonItem,
    IonPage, 
    IonHeader, 
    IonContent, 
    IonFooter,
    IonButtons,
    IonToolbar,
    IonBackButton,
    IonRefresher,
    IonRefresherContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonItemSliding,
    IonItemOption,
    IonItemOptions,
    IonAlert,
    modalController,
    IonFabList,
} from '@ionic/vue';

import NewReading from '../components/NewReading.vue';
import EditComment from '../components/EditComment.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import BuildChart from '../components/BuildChart.vue';

import log from 'loglevel';

import { 
    add as addIcon ,
    trash as deleteIcon, 
    pencil as editIcon,
    barChart as chartIcon,
    menu as menuIcon,
    chatbubble as commentIcon
} from "ionicons/icons";
import { ref, onMounted, watch } from "vue";
import repo from "../db/repo/readings";
import repo1 from "../db/repo/meters";
import { Retrier } from "@jsier/retrier";
import useSQLite from "../composables/useSQLite";
import { useI18n } from "vue-i18n";
import {  mdEnterAnimation, mdLeaveAnimation } from '@ionic/core';
//import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/app";

const { getById } = repo1;
const name = "Readings";
const LOG = `[view|${name}]`;

export default {
    name,
    components: {
        IonTitle,
        IonList,
        IonLabel,
        IonRefresher,
        IonRefresherContent,
        IonItem,
        IonPage,
        IonHeader,
        IonContent,
        IonFooter,
        IonButtons,
        IonToolbar,
        IonBackButton,
        IonFab,
        IonFabButton,
        IonFabList,
        IonIcon,
        IonItemSliding,
        IonItemOption,
        IonItemOptions,
        IonAlert,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {

        log.debug(LOG, "setup");

        const { t } = useI18n();

        useI18n();
        const store = useAppStore();
        //const router = useRouter();
        const isAlertOpen = ref(false);
        const alertButtons = [
            {
                text: 'OK',
                role: 'cancel',
                cssClass: 'error-button'
            }
        ];
        
        const { ready, query, querySingle, run } = useSQLite();
        
        const loading = ref(false);
        const readings = ref([]);
        const currMeter = ref([]);
        const initialVal = ref("");
        const errorMessage = ref("");
        const currentReadingId = ref("");
        let readingsData = null;
        let meterData = null;

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

        onMounted(async () => {
            log.debug(LOG, "view mounted");
            tryLoadData();
        });
        
        //control reload data
        watch(()=>
        shouldReloadData.value, async (newValue) => {
            log.debug(LOG, "shouldReloadData changed",  newValue );
            if (newValue) {
                await showLoading();
                tryLoadData();
            }
        });
   
        //to edit comment popup
        const editComment = async (item) => {
            currentReadingId.value =  item.id;
          //log.debug(LOG, "edit comment",  item.id );
            log.debug(LOG, "edit comment222",  currentReadingId.value );
            const modal = await modalController.create({
                component: EditComment,
                componentProps: {
                    commentId: currentReadingId.value,
                },
                cssClass: 'edit-comment-class',
                swipeToClose: true,
                enterAnimation: mdEnterAnimation,
                leaveAnimation: mdLeaveAnimation,
                mode: "md",
                presentingElement: document.querySelector('ion-content'),
            });
            return modal.present();
        };

        //to add reading popup
        const toAddReading = async () => {
            log.debug(LOG, "new reading");
            const modal = await modalController.create({
                component: NewReading,
                componentProps: {
                    currMeterId: props.id,
                    previousReading: readings.value[0],
                    currMeterInitVal: initialVal.value,
                },
                cssClass: 'add-reading-class',
                swipeToClose: true,
                presentingElement: document.querySelector('ion-content'),
            });
            return modal.present();
        };

        //load readings

        const tryLoadData = () => {
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
                );
        };

        const loadData = async (attempt) => {
            log.debug(LOG, "load readings", { attempt, id: props.id });
            if (!ready.value) {
                throw new Error("fail to load data");
            }

            try {
                meterData = await querySingle(getById({ id: parseInt(props.id) }));
                readingsData = await query(repo.getAll({ meter_id: parseInt(props.id) }));
                readingsData = readingsData.reverse();
                log.debug(LOG, "Loaded readings readingsData",  readingsData );
                readings.value = readingsData;
                currMeter.value = meterData;
                initialVal.value = meterData.startValue
                log.debug(LOG, "Loaded name", { name: currMeter.value.name, initVal: initialVal.value });
                log.debug(LOG, "Loaded readings", { readings: readings.value });
            } catch (err) {
                log.error(LOG, "Error loading data", err);
                throw err;
            }
        };

        // to confirm delete popup
        const confirmDelete = async (item) => {
            log.debug(LOG, "confirm delete", { item });
            const modal = await modalController.create({
                component: ConfirmDialog,
                cssClass: "confirm-dialog-class",
                swipeToClose: true,
                componentProps: {
                    message: t("Readings.msg-delete-reading"),
                    title: t("Readings.title-delete-reading"),
                    action: "delete",
                },
                presentingElement: document.querySelector('ion-content'),
            });
            modal.onDidDismiss().then(({ data }) => {
                if (data && data.action === 'delete') {
                deleteItem(item.id); // delete function emited
                }
            });

            return modal.present();
        };
        
        //to add chart popup
        // const toAddChart = () => {
        //      log.debug(LOG, "new chart");
        //     router.push(`/usage/charts/${props.id}`);
        //  };
        const toAddChart = async () => {
            log.debug(LOG, "new chart");
            if(readings.value.length < 2){
                isAlertOpen.value = true;
                errorMessage.value = t("Readings.msg-chart-error")
                throw new Error("Not enough readings to build a chart");
            }
            else{
                const modal = await modalController.create({
                    component: BuildChart,
                    componentProps: {
                        currMeterId: props.id,
                        readings: readings.value,
                    },
                    cssClass: 'build-chart',
                    swipeToClose: true,
                    enterAnimation: mdEnterAnimation,
                    leaveAnimation: mdLeaveAnimation,
                    mode: "md",
                    presentingElement: document.querySelector('ion-content'),
                    backdropDismiss: true,
                });
                return modal.present();
            }
        }

        // delete reading
        const deleteItem = async (readingId) => {
            const readingIds = readings.value.map(item => item.id);
            log.debug(LOG, "deleteID", { readingId, readingIds });
            if(readingId !== readingIds[0]){
                isAlertOpen.value = true;
                errorMessage.value = t("Readings.msg-delete-error")
                throw new Error("Cannot delete this reading");
            }
            try {
                // Await the result of deleteById to ensure the operation completes
                const result = await run(
                    repo.deleteById({ id: readingId })
                );
                // Log the result of the deletion
                log.debug(LOG, "delete result reading", { result });

                // Set shouldReloadData to true to trigger any data reloading
                shouldReloadData.value = true;
                tryLoadData();
            } catch (error) {
                // Log any errors that occur during the deletion process
                log.error(LOG, "error deleting reading", { error });
            }
            log.debug("deleted reading");
        };
        

        const refresh = () => {
        log.debug(LOG, "refresh");
        };

        return {
            toAddReading,
            t,
            currMeter,
            addIcon,
            deleteIcon,
            editIcon,
            menuIcon,
            commentIcon,
            chartIcon,
            editComment,
            deleteItem,
            confirmDelete,
            currentReadingId,
            toAddChart,
            readings,
            ready,
            loading,
            refresh,
            Error: t("Readings.title-error"),
            errorMessage,
            isAlertOpen,
            alertButtons,
        };
    },
}
</script>



<template>
    <ion-page>
        <ion-header translucent>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/usage" />
                </ion-buttons>
                <ion-title>{{ currMeter.name }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-alert
                :is-open="isAlertOpen"
                :header="Error"
                :message="errorMessage"
                :buttons="alertButtons"
                css-class="error-alert"
                @did-dismiss="isAlertOpen = false">
            </ion-alert>
            <ion-refresher slot="fixed" :hidden="!loading" @ionRefresh="refresh">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-list lines="full">
                <ion-item-sliding
                    style="display:block"
                    button
                    v-for="item in readings"
                    :key="item.id"
                >
                    <ion-list>
                        <ion-item >
                            <ion-label slot="start" position="fixed">
                                <span v-t="'AddReading.label-date'"></span>
                                <span>:<br>{{ item.date }} </span>
                            </ion-label>
                            <ion-label slot="end" position="fixed">
                                <span v-t="'AddReading.label-average'"></span>
                                <span>:<br>{{ item.average }} {{ currMeter.unit }}/jr</span>
                            </ion-label>
                            <ion-label slot="end" position="fixed">
                                <span v-t="'AddReading.label-value'"></span>
                                <span>:<br>{{ item.value }} {{ currMeter.unit }}</span>
                            </ion-label>
                        </ion-item>
                    </ion-list>
                    <ion-item-options side="end">
                        <ion-item-option color="dark" @click="editComment(item)">
                            <ion-icon :icon="commentIcon" />
                        </ion-item-option>
                        <ion-item-option color="danger" @click="confirmDelete(item)">
                            <ion-icon :icon="deleteIcon"></ion-icon>
                        </ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>
            </ion-list>
           <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button
                    :disabled="!ready"
                    color="primary"
                    >
                    <ion-icon :icon="menuIcon"/>
                </ion-fab-button>
                <ion-fab-list side="top">
                    <ion-fab-button
                        :disabled="!ready"
                        color="primary"
                        @click="toAddReading"
                        >
                        <ion-icon :icon="addIcon"/>
                    </ion-fab-button>
                    <ion-fab-button
                        :disabled="!ready"
                        color="primary"
                        @click="toAddChart"
                        >
                        <ion-icon :icon="chartIcon" />
                    </ion-fab-button>
                </ion-fab-list>
            </ion-fab>
        </ion-content>

        <ion-footer>
            <!-- Footer content goes here -->
        </ion-footer>
    </ion-page>
</template>

<style scoped>
.dark-theme ion-item {
    --background: transparent;
    --color: #fff;

    --border-width: 0 0 1px 0; /* Sets the bottom border to 2px */

    --border-color: #fff; /* Color of the bottom border */
    --border-style: solid;
}
.light-theme ion-item {
    --background: transparent;
    --color: #000;

    --border-color: #000;
    --border-buttom-style: solid;
    --border-width: 0 0 1px 0;
}
</style>
<style>
.add-reading-class {
    --width: 80%;
    --height: 64%;
    --border-radius: 10px;
}
.edit-comment-class{
    --width:90%;
    --height:35%;
    --border-radius: 10px;
}
.confirm-dialog-class {
    --width: 80%;
    --height: 28%;
    --border-radius: 10px;
}
.build-chart {
    --width: 85%;
    --height: 40%;
    --border-radius: 10px;
}

.error-alert {
    padding: 50px;
}
.error-alert .alert-title {
    color: #ff0000; /* Red color for error title */
    font-weight: bold;
}

.error-alert .alert-message {
    color: #ff0000; /* Red color for error message */
}


.error-alert .alert-button-group {
     /* Red background color for buttons */
    display: flex; /* Display buttons in a row */
    justify-content: center; /* Center buttons */
    align-items: center; /* Center buttons */
    padding: 0; /* Remove padding from the buttons */
    margin: 5px; /* Remove margin from the buttons */
    border-radius: 5px; /* Round corners */
}

.error-alert .alert-button{
    background-color: #ff0000;
    width: 20%; /* Make buttons take full width */
    text-align: center; /* Center text inside the button */
    padding: 5px 15px 5px 0;
}

.error-alert .alert-button-inner {
    color: #ffffff;         /* White text color */
    width: 100%;/* Force button to take full width */
    text-align: center;       /* Center text inside the button */
}

</style>