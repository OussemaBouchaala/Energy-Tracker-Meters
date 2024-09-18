<!-- ConfirmationDialog.vue -->
<template>
    <ion-header>
        <ion-toolbar>
            <ion-title>{{title}}</ion-title>
            <ion-buttons slot="end">
                <ion-button @click="dismissModal" v-t="'App.button-cancel'"></ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content style="padding: 3px;">
        <ion-item>
            <ion-text style="margin:5px;">{{ message }}</ion-text>
        </ion-item>
        <ion-button expand="block" @click="confirm">Ok</ion-button>
    </ion-content>
  </template>
  
  <script>
import log from "loglevel";

import { 
    IonText,
    IonContent, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton,
    IonItem,
    modalController,
} from '@ionic/vue';

const name = 'ConfirmationDialog';
const LOG = `[view|${name}]`;

export default{
    name,
    components: {
        IonText,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonItem,
    },
    props: {
        message: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: false,
        },
    },
    setup(props) {
        log.debug(LOG, "setup");

        const dismissModal = () => {
            modalController.dismiss();
        }

        const confirm = () => {
            modalController.dismiss({ action: props.action });
        }

        return {
            dismissModal,
            confirm,
        };
    },
}
  
  </script>
  