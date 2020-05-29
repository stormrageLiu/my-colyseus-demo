const {ccclass, property} = cc._decorator;
@ccclass
export class MouseInput extends cc.Component {

    private inputDirectionLocal:cc.Vec2;
    private upPressed:boolean = false;
    private downPressed:boolean = false;
    private leftPressed:boolean = false;
    private rightPressed:boolean = false;
    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

        this.inputDirectionLocal = cc.v2(0, 0);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onTouchMove(event) {
        let x = event.getLocationX();
        let y = event.getLocationY();
        // console.log("mouse  move  ", x, y);
    }


    onKeyDown(e) {
        switch (e.keyCode) {
            case cc.macro.KEY.w:
                this.upPressed = true;
                this.inputDirectionLocal.y = this.downPressed ? 0 : 1;
                break;
            case cc.macro.KEY.s:
                this.downPressed = true;
                this.inputDirectionLocal.y = this.upPressed ? 0 : -1;
                break;
            case cc.macro.KEY.a:
                this.leftPressed = true;
                this.inputDirectionLocal.x = this.rightPressed ? 0 : -1;
                break;
            case cc.macro.KEY.d:
                this.rightPressed = true;
                this.inputDirectionLocal.x = this.leftPressed ? 0 : 1;
                break;
            default:
                break;
        }

    }

    onKeyUp(e) {
        switch (e.keyCode) {
            case cc.macro.KEY.w:
                this.upPressed = false;
                this.inputDirectionLocal.y = this.downPressed ? -1 : 0;
                break;
            case cc.macro.KEY.s:
                this.downPressed = false;
                this.inputDirectionLocal.y = this.upPressed ? 1 : 0;
                break;
            case cc.macro.KEY.a:
                this.leftPressed = false;
                this.inputDirectionLocal.x = this.rightPressed ? 1 : 0;
                break;
            case cc.macro.KEY.d:
                this.rightPressed = false;
                this.inputDirectionLocal.x = this.leftPressed ? -1 : 0;
                break;
            default:
                break;
        }
    }


    //传给服务器的操作指令
    toServerData() {
        return {
            dir: this.inputDirectionLocal
        };
    }

}