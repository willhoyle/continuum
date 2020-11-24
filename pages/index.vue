<template lang="pug">
div
  div(
    ref="screen",
    style="position: fixed; top: 0px; left: 0px; height: 100%; width: 100%;"
  )
  div(
    ref="el",
    style="position: relative; height: 100%; width: 100%; top: 0; left: 0;"
  )
  .container-fluid
    .columns
      .column.mt-5.ml-5
        | Continuum
    .columns
      .columns
    .columns.ml-5
      .column.continuum-container
        .continuum(ref="continuum")
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

  // add bodies
  let texture = "/warbird.png";
  let body = Bodies.rectangle(width / 2, height / 2, 30, 30, {
    //   let body = Bodies.circle(width / 2, height / 2, 30, {
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,
    restitution: 1,
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
  let arenaLeft = Bodies.rectangle(100, height / 2, 30, height - 200, {
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
      strokeStyle: "#ffffff",
    },
  });

  Matter.Resolver._restingThresh = 0.001;
  let arenaRight = Bodies.rectangle(width - 100, height / 2, 30, height - 200, {
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
      strokeStyle: "#ffffff",
    },
  });
  let ctx = render.canvas.getContext("2d");
  var my_gradient = ctx.createLinearGradient(0, 0, 0, 400);
  my_gradient.addColorStop(0, "black");
  my_gradient.addColorStop(1, "white");
  let arenaTop = Bodies.rectangle(width / 2, 100, width - 200, 30, {
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
      fillStyle: my_gradient,
      strokeStyle: "#ffffff",
    },
  });
  let arenaBottom = Bodies.rectangle(width / 2, height - 100, width - 200, 30, {
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
      strokeStyle: "#ffffff",
    },
  });
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

let game;
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
      channel: null,
      game: null,
    };
  },
  async mounted() {
    this.channel = geckos({ port: 9208 }); // default port is 9208

    this.channel.onConnect((error) => {
      if (error) {
        console.error(error.message);
        return;
      }

      this.channel.onRaw((data) => {
        console.log(data);
      });
    });

    let continuum = this.$refs.continuum;
    let width = window.innerWidth - 100;
    let height = window.innerHeight - 100;
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
    console.log(this.$refs.screen);
    new ResizeSensor(this.$refs.screen, function (evt) {
      console.log("Changed to " + evt.width, evt.height);
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
    Matter.Events.on(game.engine, "collisionEnd", (evt) => {
      let pairs = evt.pairs;
      pairs.forEach((p) => {
        console.log(p);
      });
      console.log(evt.source);
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
      let body = Matter.Composite.allBodies(game.world)[0];
      speed = body.speed;
      velocityX = body.velocity.x;
      velocityY = body.velocity.y;
      let ctx = game.canvas.getContext("2d");
      ctx.font = "16px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`radians: ${bodyAngle}`, 5, 20);
      ctx.fillText(`degrees: ${bodyAngleDeg}`, 5, 40);
      ctx.fillText(`speed: ${speed}`, 5, 60);
      ctx.fillText(`velocity:  x: ${velocityX}  y: ${velocityY}`, 5, 80);
      ctx.fillText(
        `bullet velocity:  x: ${bulletVelocityX}  y: ${bulletVelocityY}`,
        5,
        100
      );
      ctx.fillText(`force:  x: ${forceX}  y: ${forceY}`, 5, 120);
    });
    //   console.log(delta);
  },
  methods: {
    shoot(game) {
      lastShot = performance.now();
      let body = Matter.Composite.allBodies(game.world)[0];
      let b = body.angle;
      bodyAngle = b % (2 * Math.PI);

      //   bullet shoots in direction the ship is pointing
      let bulletVector = Matter.Vector.rotate({ x: 0, y: 10 }, bodyAngle);
      //   console.log(bulletVector);
      let bullet = Matter.Bodies.rectangle(
        body.position.x,
        body.position.y,
        5,
        5,
        {
          friction: 0,
          frictionStatic: 0,
          frictionAir: 0,
          restitution: 1,
          slop: 0,
          collisionFilter: {
            category: 4,
            mask: 1,
            group: -1,
          },
          render: {
            strokeStyle: "#ffffff",
            fillStyle: "#ffffff",
          },
        }
      );
      Matter.Body.setVelocity(
        bullet,
        Matter.Vector.sub(body.velocity, bulletVector)
      );
      bulletVelocityX = bullet.velocity.x;
      bulletVelocityY = bullet.velocity.y;
      let x = new Int8Array(2);
      x[0] = 0;
      x[1] = 1;
      this.channel.raw.emit(x);
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
