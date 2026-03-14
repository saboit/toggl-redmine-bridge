import { client as togglClient } from "./api-toggl/client.gen.js";
import { client as redmineClient } from "./api-redmine/client.gen.js";
import { configureRedmine } from "./mutators/redmine.js";
import { configureToggl } from "./mutators/toggl.js";

type RedmineAuth = {
  baseUrl: string;
  token: string;
};

type TogglAuth = {
  baseUrl: string;
  token: string;
};

type Credentials = {
  redmine: RedmineAuth;
  toggl: TogglAuth;
};

export const initConfig = ({ redmine, toggl }: Credentials) => {
  // Configure @hey-api/client-fetch SDK clients
  togglClient.setConfig({
    baseUrl: toggl.baseUrl,
    headers: {
      Authorization: toggl.token,
    },
  });

  redmineClient.setConfig({
    baseUrl: redmine.baseUrl,
    headers: {
      Authorization: redmine.token,
    },
  });

  // Configure react-query hook fetch instances
  configureRedmine({ baseURL: redmine.baseUrl, authorization: redmine.token });
  configureToggl({ baseURL: toggl.baseUrl, authorization: toggl.token });
};
