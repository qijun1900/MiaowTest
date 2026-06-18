import escconfig from "../../config/esc.config";
import { getPlatform, getClientHeader } from "./platform";

const baseURl = escconfig.useTunnel
  ? escconfig.tunnelUrl
  : `http://${escconfig.serverHost}:${escconfig.serverPort}`;

const httpInterceptor = {
  invoke(options) {
    if (!options.url.startsWith("http")) {
      options.url = baseURl + options.url;
    }
    options.timeout = 40000;

    const platform = getPlatform();
    const clientHeader = getClientHeader();

    options.header = {
      ...options.header,
      "source-client": clientHeader,
      platform: platform,
    };
    const token = uni.getStorageSync("token");
    if (token) {
      options.header = {
        ...options.header,
        Authorization: `Bearer ${token}`,
      };
    }
  },
};

uni.addInterceptor("request", httpInterceptor);
uni.addInterceptor("uploadFile", httpInterceptor);

export { baseURl };
