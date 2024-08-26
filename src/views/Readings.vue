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
    onIonViewWillEnter, 
    onIonViewDidEnter,
    modalController,
    IonFabList,
} from '@ionic/vue';

import NewReading from '../components/NewReading.vue';
import EditComment from '../components/EditComment.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';

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

import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/app";

const { getById } = repo1;
const name = "Reading";
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

        const store = useAppStore();
        const router = useRouter();
        
        const { ready, query, querySingle, run } = useSQLite();
        
        const loading = ref(false);
        const items = ref([]);
        const name = ref("");
        const currentId = ref("");
        //const isVisibleForm = ref(false)
        let data = null;
        let nameData = null;

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
   
        const editComment = async (item) => {
            currentId.value =  item.id;
          //log.debug(LOG, "edit comment",  item.id );
            log.debug(LOG, "edit comment222",  currentId.value );
            const modal = await modalController.create({
                component: EditComment,
                componentProps: {
                    commentId: currentId.value,
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

        const toAddReading = async () => {
            log.debug(LOG, "new reading");
            const modal = await modalController.create({
                component: NewReading,
                componentProps: {
                    currMeterId: props.id,
                },
                cssClass: 'add-reading-class',
                swipeToClose: true,
                presentingElement: document.querySelector('ion-content'),
            });
            return modal.present();
        };

        //copied code

        useI18n();

        showLoading();

        onMounted(async () => {
            log.debug(LOG, "view mounted");
            tryLoadData();
        });

        onIonViewWillEnter(async () => {
            if (!shouldReloadData.value) return;
            log.debug(LOG, "view will enter");
            await showLoading();
        });

        onIonViewDidEnter(async () => {
            if (!shouldReloadData.value) return;
            log.debug(LOG, "view did enter");
            tryLoadData();
        });

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

        watch(ready, (newValue) => {
            log.debug(LOG, "Database ready state changed", { ready: newValue });
            if (newValue) {
                tryLoadData();
            }
        });

        const loadData = async (attempt) => {
            log.debug(LOG, "load readings", { attempt, id: props.id });
            if (!ready.value) {
                log.error(LOG, "Database not ready");
                throw new Error("fail to load data");
            }

            try {
                nameData = await querySingle(getById({ id: parseInt(props.id) }));
                data = await query(repo.getAll({ meter_id: parseInt(props.id) }));
                log.debug(LOG, "Loaded readings data",  data );
                items.value = data;
                name.value = nameData;
                log.debug(LOG, "Loaded name", { name: name.value });
                log.debug(LOG, "Loaded items", { items: items.value });
            } catch (err) {
                log.error(LOG, "Error loading data", err);
                throw err;
            }
        };

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
        
       const toAddChart = () => {
            log.debug(LOG, "new chart");
            router.push("/usage/charts");
        };
        

        const deleteItem = async (readingId) => {
            try {
                // Await the result of deleteById to ensure the operation completes
                const result = await run (
                    repo.deleteById({ id: readingId })
                )
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
            name,
            addIcon,
            deleteIcon,
            editIcon,
            menuIcon,
            commentIcon,
            chartIcon,
            editComment,
            deleteItem,
            confirmDelete,
            currentId,
            toAddChart,
            items,
            ready,
            loading,
            refresh,
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
                <ion-title>{{ name.name }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-refresher slot="fixed" :hidden="!loading" @ionRefresh="refresh">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-list lines="full">
                <ion-item-sliding
                    style="display:block"
                    button
                    v-for="item in items"
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
                                <span>:<br>{{ average }}</span>
                            </ion-label>
                            <ion-label slot="end" position="fixed">
                                <span v-t="'AddReading.label-value'"></span>
                                <span>:<br>{{ item.value }}{{ name.unit }}</span>
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
                    <ion-icon :icon="menuIcon" />
                </ion-fab-button>
                <ion-fab-list side="top">
                    <ion-fab-button
                        :disabled="!ready"
                        color="primary"
                        @click="toAddReading"
                        >
                        <ion-icon :icon="addIcon" />
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
ion-item {
    --background: transparent;
    --color: #fff;

    --background-hover: rgba(128, 128, 128, 0.911);
    --border-color: #fff;
    --border-style: dashed;
    --border-width: 2px;

  }
</style>
<style>
.add-reading-class {
    --width: 80%;
    --height: 70%;
    --border-radius: 10px;
}
.edit-comment-class{
    --width:80%;
    --height:40%;
    --border-radius: 10px;
}
.confirm-dialog-class {
    --width: 80%;
    --height: 25%;
    --border-radius: 10px;
}
</style>