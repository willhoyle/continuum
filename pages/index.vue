<template lang="pug">
div
  div(ref="continuum-container", style="position: fixed; left: 0px; top: 0px")
    .continuum(ref="continuum")
  div(style="position: fixed; left: 0px; top: 0px; width: 100%")
    .has-text-centered.is-unselectable
      span.is-size-2.has-text-white continuum
      span.mr-1
      span.is-size-4.has-text-grey 2020
  div(
    v-if="showEnterUsername",
    style="position: fixed; left: 0%; top: 100px; width: 100%"
  )
    .columns.is-centered
      .column.is-narrow
        .card
          .card-content(v-if="disconnectedFromServer")
            b-icon(icon="information", type="is-danger", size="is-small")
            span.ml-2 Lost connection to server
          .card-content
            b-field(label="Enter a username to play", grouped)
              b-input(placeholder="username", type="text", v-model="username")
              p.control
                b-button.button.is-primary(@click="play") Play
          .card-content(v-if="settingUpGame")
            div(v-if="duplicateUsername")
              b-icon(icon="account", type="is-danger", size="is-small")
              span.ml-2 Username is already taken
            div(v-if="connecting")
              b-icon(icon="loading mdi-spin", size="is-small")
              span.ml-2 Connecting to game server...
            div(v-else-if="connectionError")
              b-icon(icon="close", type="is-danger", size="is-small")
              span.ml-2 Error connecting to game server (WebRTC)
            //-   div
            //-     b-icon(icon="close", type="is-danger", size="is-small")
            //-     span.ml-2 {{ connectionError }}
            div(v-else)
              b-icon(icon="check", type="is-success", size="is-small")
              span.ml-2 Connected to game server (WebRTC)

  div(style="position: fixed; right: 2px; top: 2px; color: grey")
    b-button(
      type="has-text-primary-light",
      style="background-color: rgba(255, 255, 255, 10%)",
      @click="toggleFullscreen"
    ) Full Screen
    //-   .chat(
    //-     v-if="showChat",
    //-     style="position: absolute; left: 0px; bottom: 0px; color: grey"
    //-   )
    //-     div Chat
</template>

<script>
// import Matter from "../../matter-js/build/matter.js";
import Matter from "matter-js";

import geckos from "@geckos.io/client";

var Example = Example || {};

const CreateWorld = (engine, {} = {}) => {
  engine.world.gravity.y = 0;
  return engine.world;
};

Example.ballPool = async function ({ element, width, height }) {
  var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events;

  // create engine
  const engine = Engine.create();
  const world = CreateWorld(engine);
  // create renderer
  var render = Render.create({
    element,
    engine,
    options: {
      width,
      height,
      showAngleIndicator: false,
      wireframes: false,
      showVelocity: false,
      showCollisions: false,
      showBounds: false,
      showBroadphase: false,
    },
  });
  //   render.textures["warbird"] =

  Render.run(render);

  // create runner
  var runner = Runner.create();
  Runner.run(runner, engine);

  let arenaWidth = 1000;
  let arenaHeight = 1000;
  let arenaBorderThickness = 32;

  // add bodies
  let texture = "/warbird.png";
  let body = Matter.Bodies.circle(arenaWidth / 2, arenaHeight / 2, 14, {
    //   let body = Bodies.circle(width / 2, height / 2, 30, {
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,
    restitution: 0.8,
    slop: 0,
    collisionFilter: {
      mask: 1,
      category: 2,
    },
    render: {
      strokeStyle: "#ffffff",
      sprite: {
        texture: "/warbird.png",
      },
    },
  });
  let arenaLeft = Bodies.rectangle(
    arenaBorderThickness / 2,
    height / 2,
    arenaBorderThickness,
    arenaHeight,
    {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      isStatic: true,
      restitution: 1,
      slop: 0,
      collisionFilter: {
        category: 1,
      },
      render: {
        fillStyle: "grey",
        strokeStyle: "#ffffff",
      },
    }
  );

  Matter.Resolver._restingThresh = 0.001;
  let arenaRight = Bodies.rectangle(
    arenaWidth - arenaBorderThickness / 2,
    height / 2,
    arenaBorderThickness,
    arenaHeight,
    {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      isStatic: true,
      restitution: 1,
      slop: 0,
      collisionFilter: {
        category: 1,
      },
      render: {
        fillStyle: "grey",
        strokeStyle: "#ffffff",
      },
    }
  );
  let ctx = render.canvas.getContext("2d");
  var my_gradient = ctx.createLinearGradient(0, 0, 0, 400);
  my_gradient.addColorStop(0, "black");
  my_gradient.addColorStop(1, "white");
  let arenaTop = Bodies.rectangle(
    arenaWidth / 2,
    height / 2 - arenaHeight / 2 - arenaBorderThickness / 2,
    arenaWidth,
    arenaBorderThickness,
    {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      isStatic: true,
      restitution: 1,
      slop: 0,
      collisionFilter: {
        category: 1,
      },
      render: {
        fillStyle: "grey",
        strokeStyle: "#ffffff",
      },
    }
  );
  let arenaBottom = Bodies.rectangle(
    arenaWidth / 2,
    height / 2 + arenaHeight / 2 + arenaBorderThickness / 2,
    arenaWidth,
    arenaBorderThickness,
    {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      isStatic: true,
      restitution: 1,
      slop: 0,
      collisionFilter: {
        category: 1,
      },
      render: {
        fillStyle: "grey",
        strokeStyle: "#ffffff",
      },
    }
  );
  arenaLeft.friction = 0;
  arenaLeft.frictionStatic = 0;
  arenaLeft.frictionAir = 0;
  arenaLeft.restitution = 1;
  arenaLeft.slop = 0;
  World.add(world, [body, arenaLeft, arenaRight, arenaTop, arenaBottom]);

  // keep the mouse in sync with rendering

  // context for MatterTools.Demo
  return {
    engine,
    runner,
    render,
    world,
    canvas: render.canvas,
    stop: function () {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    },
  };
};

let keyState = {};
const handleUp = function (evt) {
  keyState[evt.keyCode || evt.which] = false;
};
const handleDown = function (evt) {
  keyState[evt.keyCode || evt.which] = true;
};

let game, channel;
let players = {};
let bodyAngle = 0,
  bodyAngleDeg = 0,
  speed = 0,
  velocityX = 0,
  velocityY = 0,
  forceX = 0,
  forceY = 0,
  accelX = 0,
  accelY = 0,
  bulletVelocityX = 0,
  bulletVelocityY = 0,
  lastShot = 0;
export default {
  data() {
    return {
      duplicateUsername: false,
      disconnectedFromServer: false,
      settingUpGame: false,
      connecting: false,
      connectionError: false,
      showEnterUsername: true,
      showChat: true,
      username: "",
      storage: null,
      channel: null,
      game: null,
      width: 0,
      height: 0,
    };
  },
  async beforeMount() {
    let localStorage = window.localStorage;
    if (localStorage.getItem("username")) {
      this.username = localStorage.getItem("username");
    }
  },
  async mounted() {
    let continuum = this.$refs.continuum;
    let width = window.innerWidth;
    this.width = window.innerWidth;
    let height = window.innerHeight;
    this.height = window.innerHeight;
    game = await Example.ballPool({ element: continuum, height, width });

    window.addEventListener("keyup", handleUp, true);
    window.addEventListener("keydown", handleDown, true);

    let ElementQueries = require("css-element-queries/src/ElementQueries");
    let ResizeSensor = require("css-element-queries/src/ResizeSensor");
    // attaches to DOMLoadContent and does anything for you
    ElementQueries.listen();

    // or if you want to trigger it yourself:
    // 'init' parses all available CSS and attach ResizeSensor to those elements which
    // have rules attached (make sure this is called after 'load' event, because
    // CSS files are not ready when domReady is fired.
    new ResizeSensor(this.$refs["continuum-container"], (evt) => {
      this.resize(evt);
    });
    let start;

    let ships = {
      0: {
        // all values normalized to seconds when applicable
        energy: {
          current: 1500,
          initial: 1500,
          recharge: 400,
          afterburner: 550,
        },
        speed: {
          current: 0,
          initial: 200,
          max: 600,
          rotation: 200,
        },
        thrust: {
          initial: 16,
          max: 24,
        },
        maxSpeed: 6000,
        velocity: 200,
        speed: 2000,
      },
    };
    let lastCalledTime, fps;
    Matter.Events.on(game.render, "beforeRender", (evt) => {
      if (!lastCalledTime) {
        lastCalledTime = evt.timestamp;
        fps = 0;
        return;
      }
      let delta = (evt.timestamp - lastCalledTime) / 1000;
      lastCalledTime = evt.timestamp;
      fps = 1 / delta;
    });

    Matter.Events.on(game.engine, "collisionEnd", (evt) => {
      let pairs = evt.pairs;
      pairs.forEach((p) => {
        if (
          p.bodyA.collisionFilter.category == 4 ||
          p.bodyB.collisionFilter.category == 4
        ) {
          let bullet =
            p.bodyA.collisionFilter.category == 4 ? p.bodyA : p.bodyB;
          Matter.World.remove(game.world, bullet);
        }
      });
    });
    Matter.Events.on(game.runner, "afterTick", (evt) => {
      let body = Matter.Composite.allBodies(game.world)[0];

      Matter.Render.lookAt(
        game.render,
        body,
        { x: this.width / 2, y: this.height / 2 },
        true
      );
      if (channel) {
        let buffer = new ArrayBuffer(3 * 4);
        let view = new DataView(buffer);
        view.setUint32(0, body.position.x);
        view.setUint32(1 * 4, body.position.y);
        view.setFloat32(2 * 4, body.angle);
        // console.log(
        //   `x: ${view.getUint32(0 * 4)}, y: ${view.getUint32(
        //     1 * 4
        //   )}, angle: ${view.getFloat32(2 * 4)}`
        // );
        channel.raw.emit(view.buffer);
      }
    });
    Matter.Events.on(game.runner, "beforeTick", (evt) => {
      // left
      if (keyState[37]) {
        this.rotate(-1);
      } //right
      else if (keyState[39]) {
        this.rotate(1);
      } else {
        this.rotate(0);
      }
      // shift
      let boost = 1;
      if (keyState[16]) {
        boost = 1.5;
      }
      // ctrl
      if (keyState[17]) {
        if (performance.now() - lastShot > 1000) {
          this.shoot(game);
        }
      }
      // up
      if (keyState[38]) {
        this.thrust(-1, boost);
      } // down
      else if (keyState[40]) {
        this.thrust(1, boost);
      } else {
        // this.coast();
      }
      let bodies = Matter.Composite.allBodies(game.world);
      let body = bodies[0];
      let ctx = game.canvas.getContext("2d");
      //   speed = body.speed;
      //   velocityX = body.velocity.x;
      //   velocityY = body.velocity.y;
      //   ctx.font = "16px Arial";
      //   ctx.fillStyle = "white";
      //   ctx.fillText(`radians: ${bodyAngle}`, 5, 20);
      //   ctx.fillText(`degrees: ${bodyAngleDeg}`, 5, 40);
      //   ctx.fillText(`speed: ${speed}`, 5, 60);
      //   ctx.fillText(`velocity:  x: ${velocityX}  y: ${velocityY}`, 5, 80);
      //   ctx.fillText(
      //     `bullet velocity:  x: ${bulletVelocityX}  y: ${bulletVelocityY}`,
      //     5,
      //     100
      //   );
      //   ctx.fillText(`force:  x: ${forceX}  y: ${forceY}`, 5, 120);
      //   ctx.fillText(`${Math.round(fps)} fps`, 5, 140);

      Object.keys(players)
        .map((k) => players[k])
        .map((player) => {
          ctx.font = "16px Arial";
          ctx.fillStyle = "#7f51fc";
          let username = player.username;
          let ship = bodies[player.idx];
          let { x, y } = ship.position;
          x = x - body.position.x;
          y = y - body.position.y;

          ctx.fillText(username, x, y + 80);
        });
      ctx.font = "16px Arial";
      ctx.fillStyle = "#fdde3f";
      ctx.fillText(
        `${this.username}`,
        this.width / 2 + 8,
        this.height / 2 + 30
      );
    });
    //   console.log(delta);
  },
  methods: {
    createChannel() {
      if (!channel) {
        this.connecting = true;
        channel = geckos({
          host: process.env.geckosHost,
          port: process.env.geckosPort,
        }); // default port is 9208

        channel.onConnect((error) => {
          if (error) {
            this.connecting = false;
            this.connectionError = error.message;
            channel = null;
            console.error(error.message);
            return;
          }
          this.connecting = false;
          this.connectionError = false;
          this.lostConnectionToServer = false;
          this.duplicateUsername = false;

          channel.onRaw((data) => {
            let bodies = Matter.Composite.allBodies(game.world);
            let view = new DataView(data);
            let id = view.getUint32(0);
            let player = players[id];
            let idx = player.idx;
            Matter.Body.setPosition(bodies[idx], {
              x: view.getUint32(1 * 4),
              y: view.getUint32(2 * 4),
            });
            Matter.Body.setAngle(bodies[idx], view.getFloat32(3 * 4));
            // let ctx = game.canvas.getContext("2d");
            // ctx.font = "16px Arial";
            // ctx.fillStyle = "blue";
            // ctx.fillText(`${this.username}`, data[1] + 8, data[2] + 30);
          });
          channel.emit(
            "play",
            {
              username: this.username,
            },
            { reliable: true, runs: 5, interval: 200 }
          );
          // listens for a custom event from the server
          channel.on("play", (data) => {
            if (data.id == null) {
              this.duplicateUsername = true;
            } else {
              data.players.forEach((player) => {
                if (player.id == data.id) return;
                let body = Matter.Bodies.circle(500, 500, 14, {
                  //   let body = Bodies.circle(width / 2, height / 2, 30, {
                  label: "enemy",
                  friction: 0,
                  frictionStatic: 0,
                  frictionAir: 0,
                  restitution: 0.8,
                  slop: 0,
                  collisionFilter: {
                    mask: 5,
                    category: 8,
                  },
                  render: {
                    strokeStyle: "#ffffff",
                    sprite: {
                      texture: "/warbird.png",
                    },
                  },
                });
                Matter.World.add(game.world, body);
                players[player.id] = {
                  idx: Matter.Composite.allBodies(game.world).length - 1,
                  username: player.username,
                  matterId: body.id,
                };
              });
              this.settingUpGame = false;
              this.showEnterUsername = false;
              this.duplicateUsername = false;
            }
          });
          channel.on("newPlayer", (data) => {
            if (data.username !== this.username) {
              let body = Matter.Bodies.circle(500, 500, 14, {
                //   let body = Bodies.circle(width / 2, height / 2, 30, {
                friction: 0,
                frictionStatic: 0,
                frictionAir: 0,
                restitution: 0.8,
                slop: 0,
                collisionFilter: {
                  mask: 5,
                  category: 8,
                },
                render: {
                  strokeStyle: "#ffffff",
                  sprite: {
                    texture: "/warbird.png",
                  },
                },
              });
              Matter.World.add(game.world, body);
              players[data.id] = {
                idx: Matter.Composite.allBodies(game.world).length - 1,
                username: data.username,
              };
            }
          });
          channel.onDisconnect(() => {
            this.disconnectedFromServer = true;
            this.showEnterUsername = true;
            channel = null;
          });
        });
      } else {
        channel.emit(
          "play",
          {
            username: this.username,
          },
          { reliable: true, runs: 5, interval: 200 }
        );
      }
    },
    play(evt) {
      if (this.username.length >= 2 && this.username.length <= 30) {
        window.localStorage.setItem("username", this.username);
        this.settingUpGame = true;
        this.createChannel();
      }
    },
    toggleFullscreen() {
      this.$refs["continuum-container"].requestFullscreen();
    },
    resize(evt) {
      this.width = game.canvas.width = evt.width;
      this.height = game.canvas.height = evt.height;
    },
    shoot(game) {
      lastShot = performance.now();
      let body = Matter.Composite.allBodies(game.world)[0];
      let b = body.angle;
      bodyAngle = b % (2 * Math.PI);

      //   bullet shoots in direction the ship is pointing
      let bulletVector = Matter.Vector.rotate({ x: 0, y: 10 }, bodyAngle);
      //   console.log(bulletVector);
      let bullet = Matter.Bodies.circle(body.position.x, body.position.y, 3, {
        label: "bullet",
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0,
        restitution: 1,
        slop: 0,
        collisionFilter: {
          category: 4,
          mask: 9,
          group: -1,
        },
        render: {
          strokeStyle: "#ffffff",
          fillStyle: "#ffffff",
        },
      });
      Matter.Body.setVelocity(
        bullet,
        Matter.Vector.sub(body.velocity, bulletVector)
      );
      bulletVelocityX = bullet.velocity.x;
      bulletVelocityY = bullet.velocity.y;
      //   let x = new Int8Array(2);
      //   x[0] = 0;
      //   x[1] = 1;
      //   channel.raw.emit(x);
      Matter.World.add(game.world, bullet);
    },
    rotate(direction) {
      let body = Matter.Composite.allBodies(game.world)[0];
      Matter.Body.setAngularVelocity(body, (1 / 20) * direction);
      if (direction !== 0) {
        let b = body.angle;
        bodyAngle = b % (2 * Math.PI);
      }
    },
    speed(body) {},
    // coast(direction, boost) {
    //   let body = Matter.Composite.allBodies(game.world)[0];
    //   Matter.Body.setVelocity(body, body.velocity);
    // },
    thrust(direction, boost) {
      let body = Matter.Composite.allBodies(game.world)[0];
      let velocity = body.velocity;
      let b = body.angle;
      bodyAngle = b % (2 * Math.PI);
      let forceVector = Matter.Vector.rotate({ x: 0, y: 1 }, bodyAngle);
      forceVector = Matter.Vector.mult(forceVector, direction * boost * 0.0002);
      Matter.Body.applyForce(body, body.position, forceVector);
      if (velocity.x > 5) {
        Matter.Body.setVelocity(body, { x: 5, y: velocity.y });
      }
      if (velocity.y > 5) {
        Matter.Body.setVelocity(body, { x: velocity.x, y: 5 });
      }
      if (velocity.x < -5) {
        Matter.Body.setVelocity(body, { y: velocity.y, x: -5 });
      }
      if (velocity.y < -5) {
        Matter.Body.setVelocity(body, { x: velocity.x, y: -5 });
      }

      //   if (currentSpeed > 3 || currentSpeed < -3) {
      //     Matter.Body.setVelocity(
      //       body,
      //       Matter.Vector.mult(body.velocity, 3 / currentSpeed)
      //     );
      //   }
      //   if (body.acceleration.y > 3 || body.velocity.y < -3) {
      //     body.position.y -= amount;
      //   }
    },
  },
  beforeDestroy() {},
};
</script>

<style>
html,
body {
  overflow: hidden;
  margin: 0 !important;
  padding: 0 !important;
}
</style>