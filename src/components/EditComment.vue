<template> 
    <ion-header>
        <ion-toolbar>
          <ion-title v-t="'Readings.edit-reading-comment'"></ion-title>
          <ion-buttons slot="end">
              <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="stacked" v-t="'AddReading.label-comment'"></ion-label>
          <ion-input v-model="comment"></ion-input>
        </ion-item>
        <ion-button expand="block" :disabled="!dataChanged" @click="editComment">OK</ion-button>
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

import { ref, onMounted, computed } from 'vue';
import { Retrier } from '@jsier/retrier';
import repo from "../db/repo/readings";
import { useAppStore } from '../stores/app';
import useSQLite from "../composables/useSQLite";
import { useRouter  } from 'vue-router';
import { storeToRefs } from 'pinia';

const name="NewReading";
const LOG = `[component|${name}]`;
const { update, getById} = repo;


export default({
  name,
  //emits:["update:isVisibleForm"],
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
  props: {
    commentId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    log.debug(LOG, "setup");

    const router = useRouter();
    const store = useAppStore();
    const {run,ready, querySingle} = useSQLite();
    const { shouldReloadData } = storeToRefs(store);

    //const isModalOpen = ref(props.isVisibleForm);
    const comment = ref("");
    const submitted = ref(false);
    const loadingData = ref(true);
    let data = null;
    

    const { showLoading, hideLoading } = store;

    // const closeModal = () => {
    //   isModalOpen.value = false;
    //   context.emit('update:isVisibleForm' , false);
    // };
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
      log.debug(LOG,"edit dialog11", props.commentId);
      if(props.commentId){

          log.debug(LOG, "props111", { id: props.commentId });
      }
      log.debug(LOG, "view mounted");
      log.debug(LOG, "props", { id: props.commentId });
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
          }
        )
    });

    const load = async (attempt) => {
      log.debug(LOG, `load reading edit `, { attempt, id: props.commentId });
      if (!ready.value) {
        log.debug(LOG, "db not ready");
        throw new Error("fail to load data");
      }

      try {
        data = await querySingle(getById({ id: parseInt(props.commentId) }));
        log.debug(LOG, "data",  data.comment);
        comment.value = data.comment;
      } catch (err) {
        log.error(err.message);
        throw err;
      }
    };

    const closeModal = () => {
      modalController.dismiss();
    };

    const editComment = async () => {
      
      submitted.value = true;
      log.log(LOG, "saving");

      try {
        await run(
          update({
            comment: comment.value,
            id: parseInt(props.commentId)
          })
        );
        shouldReloadData.value = true;
        router.push('/meters-readings');
        closeModal();
      } catch (ex) {
        log.error(ex);
      }

      log.debug("saved");
    };
    
    const dataChanged = computed(() => {
      if (loadingData.value) return false;

      return !(
        comment.value === data.comment
      );
    });

    return {
      submitted,
      editComment,
      comment,
      closeModal,
      dataChanged
      //isModalOpen,
    };
  }
});
</script>

