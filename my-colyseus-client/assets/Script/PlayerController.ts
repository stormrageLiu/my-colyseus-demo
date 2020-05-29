const {ccclass, property} = cc._decorator;
@ccclass
export class PlayerController extends cc.Component {
    public static SPEED:number = 8;

    public sessionId:string = "";
    public isLocal:boolean = false;
    onLoad() {
        this.sessionId = "";
        this.isLocal = false;
    }

    setPlayerLab(str) {
        let lab = cc.find("lab", this.node);
        let labScript = lab.getComponent(cc.Label);
        labScript.string = str;
    }

    setPostion(cmd) {
        this.node.position.x = cmd.x;
        this.node.position.x = cmd.y;
    }
}