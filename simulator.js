const { Engine, Render, World, Bodies, Body, Mouse, MouseConstraint, Events, Runner } = Matter;

let engine, world, render, runner, createMode = true;

function startGame() {
  engine = Engine.create();
  world = engine.world;
  render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
    },
  });
  Render.run(render);

  runner = Runner.create();
  Runner.run(runner, engine);

  const walls = [
    Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 50, { isStatic: true }),
    Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 50, { isStatic: true }),
    Bodies.rectangle(0, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true }),
    Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true }),
  ];
  World.add(world, walls);

  const floor = Bodies.rectangle(window.innerWidth / 2, window.innerHeight - 25, window.innerWidth, 50, { isStatic: true });
  World.add(world, floor);

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  });
  World.add(world, mouseConstraint);

  function createBox(x, y) {
    const box = Bodies.rectangle(x, y, 50, 50, { restitution: 0.8 });
    World.add(world, box);
  }

  render.canvas.addEventListener('click', (event) => {
    const mousePosition = mouse.position;

    if (createMode) {
      createBox(mousePosition.x, mousePosition.y);
    } else {
      const selected = mouseConstraint.body;
      if (selected) {
        const forceMagnitude = 0.001;
        Body.applyForce(selected, selected.position, {
          x: (mousePosition.x - selected.position.x) * forceMagnitude,
          y: (mousePosition.y - selected.position.y) * forceMagnitude,
        });
      }
    }
  });

  Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
      if (pair.bodyA === floor || pair.bodyB === floor) {
        const body = pair.bodyA === floor ? pair.bodyB : pair.bodyA;
        if (body.position.x < 0 || body.position.x > window.innerWidth || body.position.y < 0 || body.position.y > window.innerHeight) {
          World.remove(world, body);
        }
        Body.applyForce(body, body.position, { x: 0, y: -0.1 });
      }
    });
  });

  window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
  });

  const toggleModeButton = document.createElement('button');
  toggleModeButton.textContent = "Switch Mode";
  toggleModeButton.id = "toggleMode";
  document.body.appendChild(toggleModeButton);

  toggleModeButton.addEventListener('click', () => {
    createMode = !createMode;
    toggleModeButton.textContent = createMode ? 'Switch to Control Mode' : 'Switch to Creation Mode';
  });
}

document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';
});

document.getElementById('roomButton').addEventListener('click', () => {
  startGame();
  document.getElementById('game').style.display = 'none';
});
