import { Room, Client, nosync } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {

  @nosync
  public maxX: number = 480;
  @nosync
  public maxY: number = 640;
  
  @nosync
  public dirX: number = 0;
  @nosync
  public dirY: number = 0;
  @nosync
  public id: string = ""; 

  @nosync
  public speed: number = 12;

  @type("number")
  public x: number = 0;

  @type("number")
  public y: number = 0;
  
    constructor(id:string) {
        super();
        this.id = id;
        this.x = Math.random() * 200 - 100;
        this.y = Math.random() * 300 - 200; 
    }

    update() {
        let l_x = this.x;
        let l_y = this.y;
        l_x += this.speed * this.dirX;
        l_y += this.speed * this.dirY;
        if(l_x != this.x) {
            if(Math.abs(l_x) < this.maxX)
                this.x = l_x;
        }
        if(l_y != this.y) {
            if(Math.abs(l_y) < this.maxY)
                this.y = l_y;
        }
    }
}

export class State extends Schema {
    @type({ map: Player })
    public players = new MapSchema<Player>();
}

export class GameRoom extends Room<State> {

    serverFrameRate:number = 20;
    timeInterval:NodeJS.Timeout;

    onCreate(options: any) {

        this.setState(new State());

        this.onMessage("*", (client:Client, type:any, message:any) => {
            this.onCMD(client, type, message);
        });

        this.timeInterval = setInterval(this.update.bind(this), 1000 / this.serverFrameRate);
        // this.setSimulationInterval(this.update.bind(this),16.6);
  }
    onCMD(client:Client, type:string, message:any) {
        const player:Player = this.getEntityById(client.sessionId);
        if(type == "add"){
            if(player){
                client.send("err","1");
            }else{
                this.addPlayer(client);
            }
        }
        else if(type == "input") {
            if(player){
                player.dirX = message.x;
                player.dirY = message.y;
            }else{
                client.send("err","2");
            }
        }
    }

    getEntityById(id:string){

        return this.state.players[id];
    }

    addPlayer(client: Client) {
        let player = new Player(client.sessionId);
        this.state.players[client.sessionId] = player;
    }

    removePlayer(sessionId: string) {
        let player:Player = this.getEntityById(sessionId);
        if (player) {
            delete this.state.players[sessionId];
        }
    }

    onJoin(client: Client, options: any) {
        console.log("client.sessionId ---> " + client.sessionId + "加入了游戏");
    }

    onLeave (client: Client, consented: boolean) {
        console.log("client.sessionId ---> " + client.sessionId + "离开了游戏");
        this.removePlayer(client.sessionId);
        this.broadcast("left",client.sessionId);
    }  
    onDispose () {
        clearInterval(this.timeInterval);
        console.log("this.roomId ---> " + this.roomId + "关闭了");
    }

    update() {
        for (let k in this.state.players) {
            this.state.players[k].update();       
        }
    }

    
}