import * as Colyseus from "./plugin/colyseus";
import { MouseInput } from "./player-input/MouseInput";
import { PlayerController } from "./PlayerController";
// import * as PlayerController from "./PlayerController";
// import {a} from "./PlayerController"

const { ccclass, property } = cc._decorator;
@ccclass
export class NetManager extends cc.Component {
  @property(cc.Prefab)
  playerPrefab: cc.Prefab = null;

  room_name: string;
  server_url: string;
  players: Array<any>;
  mouseInput: MouseInput;
  client: Colyseus.Client = null;
  room: Colyseus.Room = null;
  serverFrameRate: number = 20;
  onLoad() {
    this.room_name = "game";
    this.server_url = "ws://localhost:2567";
    //玩家列表
    this.players = [];
    //玩家的输入
    let canvas = cc.find("Canvas");
    this.mouseInput = canvas.getComponent(MouseInput);
    //加入房间
    this.onJoinRoom();
  }

  //加入房间
  onJoinRoom() {
    this.client = new Colyseus.Client(this.server_url);
    console.log("连接 服务器  2567----", this.client);
    this.client
      .joinOrCreate(this.room_name, {
        /* options */
      })
      .then((room) => {
        console.log("joined successfully", room);
        this.room = room;
        this.joinSuccess();
      })
      .catch((e) => {
        console.log("join error:\n", e);
      });
  }

  //成功加入房间
  joinSuccess() {
    console.log("成功加入房间------", this.room.id, this.room.sessionId);
    this.room.onMessage("*", (type: any, message) => {
      this.onMessageHandler(type, message);
    });

    this.room.onStateChange((state) => {
      for (const key in state.players) {
        const element = state.players[key];
        this.updatePlayer(key, element);
      }
    });
    //开始游戏
    this.sendStartGame();
  }

  onMessageHandler(type: any, message: any) {
    switch (type) {
      case "left":
        this.removePlayer(message);
        break;
    }
  }

  updatePlayer(sessionId: string, playerData: any) {
    let existPlayer = this.players.filter((p) => {
      let PlayerScript = p.getComponent(PlayerController);
      return PlayerScript == null ? false : PlayerScript.sessionId == sessionId;
    });

    if (existPlayer.length > 0) {
      //存在这个玩家
      existPlayer[0].position = cc.v3(playerData.x, playerData.y, 0);
    } else {
      let player = cc.instantiate(this.playerPrefab);
      cc.find("Canvas/gameWorld").addChild(player);
      let PlayerScript = player.getComponent(PlayerController);
      PlayerScript.sessionId = sessionId;
      PlayerScript.isLocal = sessionId == this.room.sessionId;
      PlayerScript.setPlayerLab("玩家：" + sessionId);
      this.players.push(player);
      player.position = cc.v3(playerData.x, playerData.y, 0);
    }
  }

  removePlayer(sessionId) {
    let tmpPlayers: Array<any> = [];
    for (let index = 0; index < this.players.length; index++) {
      const p = this.players[index];
      let PlayerScript = p.getComponent(PlayerController);
      if (PlayerScript.sessionId == sessionId) {
        p.destroy();
        continue;
      }
      tmpPlayers.push(p);
    }

    this.players = tmpPlayers;
  }

  //向服务器发起开始游戏
  sendStartGame() {
    this.players = [];
    //加入游戏
    this.sendToRoom("add", this.room.sessionId);
    //以固定时间间隔上传用户输入
    setInterval(this.sendCMD.bind(this), 1000 / this.serverFrameRate);
  }

  //向服务器发送消息
  sendToRoom(type: string, data) {
    this.room.send(type, data);
  }

  //向服务器发送用户的操作指令
  sendCMD() {
    let dir = this.mouseInput.toServerData().dir;
    this.sendToRoom("input", dir);
  }
}
