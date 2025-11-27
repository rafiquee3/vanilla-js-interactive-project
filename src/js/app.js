import { Menu } from "./navLogic";
import { Router } from "./router";

const menu = document.querySelector(".menu");
const main = document.querySelector(".main-cnt");
const nav = new Menu(menu, {transitionTiming: "0.5s", action: "click"});
const router = new Router(main);
router.init();

