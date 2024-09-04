<template>
    <ion-page>
        <ion-header translucent>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button menu="menu" color="dark" />
                </ion-buttons>
                <ion-title v-t="'App.settings-menu'"></ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content fullscreen>
            <ion-list>
                <ion-item>
                    <ion-label v-t="'Settings.darkMode-setting'"></ion-label>
                    <ion-toggle v-model="darkModeEnabled" @ionChange="toggleMode"></ion-toggle>
                </ion-item>

                <ion-item>
                    <ion-label>Notifications</ion-label>
                    <ion-toggle v-model="notificationsEnabled"></ion-toggle>
                </ion-item>

                <ion-item>
                    <ion-label v-t="'Settings.language-setting'"></ion-label>
                    <ion-select v-model="selectedLanguage" @ionChange="setLocale">
                        <ion-select-option value="en" v-t="'Settings.english-language'"></ion-select-option>
                        <ion-select-option value="fr" v-t="'Settings.french-language'"></ion-select-option>
                    </ion-select>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script>
import log from 'loglevel';

import { 
    IonPage, 
    IonHeader, 
    IonContent,
    IonToolbar, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonToggle, 
    IonSelect, 
    IonSelectOption, 
    IonTitle,
    IonButtons,
    IonMenuButton
} from '@ionic/vue';

import { ref } from 'vue';
import { useAppStore } from '../stores/app';
import useSQLite from '../composables/useSQLite';
import  repo from '../db/repo/options';
import { useI18n } from 'vue-i18n';
//import { storeToRefs } from 'pinia';

const { update } = repo
const name = 'Settings';
const LOG = `[component|${name}]`;

export default {
    name,
    components: {
        IonPage,
        IonHeader,
        IonContent,
        IonToolbar,
        IonTitle, 
        IonList,
        IonMenuButton,
        IonButtons,
        IonItem,
        IonLabel,
        IonToggle,
        IonSelect,
        IonSelectOption
    },
    setup() {
        // injected code
        log.debug(LOG, "setup");

        const { locale } = useI18n();
        const store = useAppStore();
        const { run } = useSQLite();
        //const { shouldReloadData } = storeToRefs(store);


        const { showLoading, hideLoading } = store;


        // end injected code
        const darkModeEnabled = ref(true);
        const notificationsEnabled = ref(true);
        const selectedLanguage = ref(locale.value);

        const setLocale = async (event) => {
            log.debug(LOG,'event', {event, currentLocale: locale.value,selectedLanguage: selectedLanguage.value});
            try {
                await showLoading();
                await run(
                    update({
                        name: 'locale',
                        value: event.detail.value,
                        id: 1,
                    })
                );
                log.debug(LOG, 'locale updated');
                //shouldReloadData.value = true;
            } catch (ex) {
                log.error(ex);
            } finally {
                await hideLoading();
                location.reload();
            }
        }
        
        const toggleMode = () => {
            log.debug(LOG, 'toggleMode', {darkModeEnabled: darkModeEnabled.value});
            document.body.classList.toggle('dark-theme', darkModeEnabled.value);
            document.body.classList.toggle('light-theme', !darkModeEnabled.value);
        }

        return {
            darkModeEnabled,
            notificationsEnabled,
            selectedLanguage,
            setLocale,
            toggleMode,
            
        };
    }
}

</script>

<style scoped>
/* Add your custom styles here */
</style>