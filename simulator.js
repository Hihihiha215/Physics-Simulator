const { Engine, Render, World, Bodies, Body, Mouse, MouseConstraint, Events, Runner } = Matter;

let engine, world, render, runner, createMode = true;

// Функция для инициализации игры
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

  // Стены
  const walls = [
    Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 50, { isStatic: true }), // Верхняя стена
    Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 50, { isStatic: true }), // Нижняя стена
    Bodies.rectangle(0, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true }), // Левая стена
    Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true }), // Правая стена
  ];
  World.add(world, walls);

  // Пол
  const floor = Bodies.rectangle(window.innerWidth / 2, window.innerHeight - 25, window.innerWidth, 50, { isStatic: true });
  World.add(world, floor);

  // Мышь для взаимодействия
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

  // Функция для создания кубика
  function createBox(x, y) {
    const box = Bodies.rectangle(x, y, 50, 50, { restitution: 0.8 });
    World.add(world, box);
  }

  // Обработчик мыши для создания и управления кубиками
  render.canvas.addEventListener('click', (event) => {
    const mousePosition = mouse.position;

    if (createMode) {
      createBox(mousePosition.x, mousePosition.y); // В режиме создания создаём кубик
    } else {
      // В режиме управления: просто перемещаем кубик, если он есть
      const selected = mouseConstraint.body;
      if (selected) {
        const forceMagnitude = 0.001; // Уменьшена сила импульса
        Body.applyForce(selected, selected.position, {
          x: (mousePosition.x - selected.position.x) * forceMagnitude,
          y: (mousePosition.y - selected.position.y) * forceMagnitude,
        });
      }
    }
  });

  // Остановка по краям и уничтожение кубиков, которые выходят за пределы
  Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
      // Если кубик выходит за пределы экрана, он уничтожается
      if (pair.bodyA === floor || pair.bodyB === floor) {
        const body = pair.bodyA === floor ? pair.bodyB : pair.bodyA;
        if (body.position.x < 0 || body.position.x > window.innerWidth || body.position.y < 0 || body.position.y > window.innerHeight) {
          World.remove(world, body);
        }
        // Кубик столкнулся с полом, применим силу для отскока
        Body.applyForce(body, body.position, { x: 0, y: -0.1 });
      }
    });
  });

  window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
  });

  // Добавляем кнопку переключения режима
  const toggleModeButton = document.createElement('button');
  toggleModeButton.textContent = "Переключить режим";
  toggleModeButton.id = "toggleMode";
  document.body.appendChild(toggleModeButton);

  toggleModeButton.addEventListener('click', () => {
    createMode = !createMode;
    toggleModeButton.textContent = createMode ? 'Переключить режим на управление' : 'Переключить режим на создание';
  });
}

// Главное меню
document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';
});

// Выбор комнаты
document.getElementById('roomButton').addEventListener('click', () => {
  startGame();
  document.getElementById('game').style.display = 'none'; // Убираем выбор комнаты
});