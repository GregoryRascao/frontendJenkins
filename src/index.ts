import {MainModule} from "./app/main-module";
import {Balrog} from "./framework/balrog";
import {IModule} from "./framework/module/module";

export const balrog = new Balrog();
balrog.initBalrog(new MainModule());
console.log("BALROG INIT DONE");
