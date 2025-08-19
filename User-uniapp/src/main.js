import {createSSRApp} from "vue";
import App from "./App.vue";
//导入piania
import pinia from "./stores/index";
export function createApp() {
	const app = createSSRApp(App);
	
	//注册pinia
	app.use(pinia);

	return {
		app,
	};
}
