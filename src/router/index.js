import { createRouter, createWebHistory } from "@ionic/vue-router";

const routes = [
  {
    path: "",
    redirect: "/meters",
    name: "root",
  },
  {
    path: "/meters",
    name: "meters",
    component: () => import("../views/Meters.vue"),
  },
  {
    path: "/meters/:id",
    name: "meter-consult",
    component: () => import("../views/EditMeter.vue"),
    props: true,
  },
  {
    path: "/meters/add",
    name: "meter-add",
    component: () => import("../views/AddMeter.vue"),
  },
  {
    path: "/usage",
    component: () => import("../views/Usage.vue"),
    name: "usage",
  },
  {
    path: "/usage/:id",
    name: "meter-readings",
    component: () => import("../views/Readings.vue"),
    props: true,
  },
  {
    path: "/usage/charts",
    name: "chart",
    component: () => import("../views/Charts.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../views/Settings.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/About.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
