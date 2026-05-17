import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login.vue";
import Mainbox from "@/views/Mainbox.vue";
import RoutesConfig from "./config";
import { useAppStore } from "../stores/index";

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/mainbox",
    name: "mainbox",
    component: Mainbox,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.name === "login") {
    next();
  } else {
    if (!localStorage.getItem("token")) {
      next({
        path: "/login",
      });
    } else {
      const appStore = useAppStore();
      if (!appStore.isGetterRouter) {
        router.removeRoute("mainbox");
        configrouter();
        next({
          path: to.fullPath,
        });
      } else {
        next();
      }
    }
  }
});

const configrouter = () => {
  const appStore = useAppStore();
  if (!router.hasRoute("mainbox")) {
    router.addRoute({
      path: "/mainbox",
      name: "mainbox",
      component: Mainbox,
    });
  }
  RoutesConfig.forEach((item) => {
    checkPermission(item) && router.addRoute("mainbox", item);
  });
  appStore.changeGetterRouter(true);
};

const checkPermission = (item) => {
  const appStore = useAppStore();
  if (item.requireAdmin) {
    return appStore.userInfo.role === 1;
  }
  return true;
};

export default router;
