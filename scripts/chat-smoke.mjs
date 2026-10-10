// A real chat conversation over the chat's live connection, at the address
// given, through whatever stands in front of it (26.1010).
//
//   node scripts/chat-smoke.mjs ws://www.travish.com/chat/socket.io/
//
// scripts/proxy-smoke.sh runs it inside the chat's own image (Node there has
// WebSocket built in), aimed at the rehearsal proxy, so the conversation goes
// proxy → the site's nginx → the chat container and back: the path a visitor's
// browser takes. Two people connect; one joins as "ci-alice" and says hello;
// the other must see her in the list and hear the hello. It speaks socket.io's
// own wire format by hand (no client library to install): "0…" opens, "40"
// joins the default room, "42[…]" is an event, "2"/"3" are ping/pong.
//
// Prints one PASS/FAIL line per step; exits 1 if any failed or 20 s passed.
const base = process.argv[2];
if (!base) {
  console.error('usage: node chat-smoke.mjs ws://<host>/chat/socket.io/');
  process.exit(2);
}
const address = `${base}?EIO=4&transport=websocket`;
let fails = 0;
const check = (what, ok) => {
  if (!ok) fails += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  chat over WebSocket: ${what}`);
};

function person() {
  const socket = new WebSocket(address);
  const events = [];
  let opened = false;
  let joined = false;
  socket.addEventListener('message', ({ data }) => {
    const text = String(data);
    if (text === '2') socket.send('3');
    else if (text.startsWith('0')) {
      opened = true;
      socket.send('40');
    } else if (text.startsWith('40')) joined = true;
    else if (text.startsWith('42')) events.push(JSON.parse(text.slice(2)));
  });
  return {
    socket,
    events,
    opened: () => opened,
    joined: () => joined,
    emit: (...event) => socket.send(`42${JSON.stringify(event)}`),
  };
}

const until = (test, ms = 5000) =>
  new Promise((resolve) => {
    const started = Date.now();
    const look = () => {
      if (test()) resolve(true);
      else if (Date.now() - started > ms) resolve(false);
      else setTimeout(look, 50);
    };
    look();
  });

const timer = setTimeout(() => {
  console.log('FAIL  chat over WebSocket: gave up after 20 s');
  process.exit(1);
}, 20000);

const alice = person();
const bob = person();
check(
  'two connections open through the proxy',
  await until(() => alice.opened() && bob.opened()),
);
check(
  'both are let into the chat',
  await until(() => alice.joined() && bob.joined()),
);
alice.emit('message', { name: 'ci-alice' });
check(
  'the other person sees ci-alice join',
  await until(() =>
    bob.events.some(
      ([name, users]) =>
        name === 'status' && users.some((user) => user.name === 'ci-alice'),
    ),
  ),
);
alice.emit('message', 'hello through the proxy');
check(
  'the other person hears her hello',
  await until(() =>
    bob.events.some(
      ([name, said]) =>
        name === 'message' &&
        Array.isArray(said) &&
        said.some(
          (line) =>
            line.user === 'ci-alice' && line.body === 'hello through the proxy',
        ),
    ),
  ),
);
alice.socket.close();
bob.socket.close();
clearTimeout(timer);
process.exit(fails === 0 ? 0 : 1);
