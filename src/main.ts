import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";

const app = createApp(App).use(IonicVue).use(router);

router
  .isReady()
  .then(() => app.mount("#app"))
  .catch((error) => {
    console.error("Unable to start Lost and Found:", error);
    document.querySelector("#app")!.innerHTML = `
    <main style="padding: 32px; font-family: sans-serif; color: #202b2b">
      <h1>Lost &amp; Found could not start</h1>
      <p>Close and reopen the app. If the problem continues, check the app build configuration.</p>
    </main>
  `;
  });
