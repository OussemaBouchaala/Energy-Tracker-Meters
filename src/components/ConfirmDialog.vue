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
    <ion-content>
        <ion-text style="margin:5px;">{{ message }}</ion-text>
        <ion-button expand="block" @click="confirm">Ok</ion-button>
    </ion-content>
  </template>
  
  <script>
import { 
    IonText,
    IonContent, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton,

    modalController,
} from '@ionic/vue';

export default{
    components: {
        IonText,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
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
        function dismissModal() {
            modalController.dismiss();
        }

        function confirm() {
            modalController.dismiss({ action: props.action });
        }

        return {
            dismissModal,
            confirm,
        };
    },
}
  
  </script>
  